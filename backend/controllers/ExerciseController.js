import con from "../server.js";

// Get list of exercises
export const getExercises = async (req, res) => {
  try {
    const { muscle_group } = req.query;

    let query = "SELECT * FROM exercises";
    const params = [];

    if (muscle_group) {
      query += " WHERE muscle_group = $1";
      params.push(muscle_group);
    }

    query += " ORDER BY name ASC";

    const result = await con.query(query, params);

    res.status(200).json({
      success: true,
      data: {
        exercises: result.rows,
      },
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exercises",
      error: error.message,
    });
  }
};

// Get list of unique muscle groups
export const getMuscleGroups = async (req, res) => {
  try {
    const result = await con.query(
      "SELECT DISTINCT muscle_group FROM exercises ORDER BY muscle_group ASC"
    );

    res.status(200).json({
      success: true,
      data: {
        muscle_groups: result.rows.map((item) => item.muscle_group),
      },
    });
  } catch (error) {
    console.error("Error fetching muscle groups:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching muscle groups",
      error: error.message,
    });
  }
};

// Get user's exercise logs for a specific date
export const getUserExerciseLogs = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { date } = req.query;

    // Debug logging
    console.log("Auth check for exercise logs:", {
      tokenUserId: req.user.id,
      requestUserId: userId,
      isAdmin: req.user.isAdmin,
    });

    // UPDATED: Use string comparison for UUID format
    if (String(req.user.id) !== String(userId) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this data",
      });
    }

    const result = await con.query(
      `SELECT el.log_id, el.user_id, el.exercise_id, el.date, el.sets, el.reps, el.weight, el.notes,
              e.name, e.muscle_group, e.equipment
       FROM exercise_logs el
       JOIN exercises e ON el.exercise_id = e.exercise_id
       WHERE el.user_id = $1 AND el.date = $2
       ORDER BY el.created_at DESC`,
      [userId, date]
    );

    res.status(200).json({
      success: true,
      data: {
        exercises: result.rows,
      },
    });
  } catch (error) {
    console.error("Error fetching exercise logs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exercise logs",
      error: error.message,
    });
  }
};

// Log an exercise for user
export const logExercise = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { exercise_id, date, sets, reps, weight, notes } = req.body;

    // Debug logging
    console.log("Auth check for logging exercise:", {
      tokenUserId: req.user.id,
      requestUserId: userId,
      isAdmin: req.user.isAdmin,
    });

    // UPDATED: Use string comparison for UUID format
    if (String(req.user.id) !== String(userId) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this data",
      });
    }

    const result = await con.query(
      `INSERT INTO exercise_logs (user_id, exercise_id, date, sets, reps, weight, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING log_id`,
      [userId, exercise_id, date, sets, reps, weight, notes]
    );

    // Get exercise details for response
    const exerciseDetails = await con.query(
      "SELECT * FROM exercises WHERE exercise_id = $1",
      [exercise_id]
    );

    res.status(201).json({
      success: true,
      data: {
        log_id: result.rows[0].log_id,
        user_id: userId, // Return the original UUID instead of parsing to int
        exercise_id: exercise_id,
        date,
        sets,
        reps,
        weight: weight || null,
        notes,
        name: exerciseDetails.rows[0].name,
        muscle_group: exerciseDetails.rows[0].muscle_group,
        equipment: exerciseDetails.rows[0].equipment,
      },
    });
  } catch (error) {
    console.error("Error logging exercise:", error);
    res.status(500).json({
      success: false,
      message: "Error logging exercise",
      error: error.message,
    });
  }
};

// Remove exercise log
export const removeExerciseLog = async (req, res) => {
  try {
    const userId = req.params.userId;
    const logId = req.params.logId;

    // Debug logging
    console.log("Auth check for removing exercise:", {
      tokenUserId: req.user.id,
      requestUserId: userId,
      isAdmin: req.user.isAdmin,
    });

    // UPDATED: Use string comparison for UUID format
    if (String(req.user.id) !== String(userId) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this data",
      });
    }

    await con.query(
      "DELETE FROM exercise_logs WHERE log_id = $1 AND user_id = $2",
      [logId, userId]
    );

    res.status(200).json({
      success: true,
      data: { log_id: logId }, // Return the original log ID without parsing to int
    });
  } catch (error) {
    console.error("Error removing exercise log:", error);
    res.status(500).json({
      success: false,
      message: "Error removing exercise log",
      error: error.message,
    });
  }
};
