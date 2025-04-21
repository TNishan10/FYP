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
      `SELECT el.log_id, el.user_id, el.exercise_id, el.date, el.sets, el.reps, el.weight, el.rest, el.notes,
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

// ...existing code...

// Log an exercise for user
export const logExercise = async (req, res) => {
  try {
    const userId = req.params.userId;
    const {
      exercise_id,
      exercise_name,
      muscle_group,
      date,
      sets,
      reps,
      weight,
      rest,
      notes,
    } = req.body;

    console.log("Request body:", req.body); // For debugging

    // Auth check - same as before
    if (String(req.user.id) !== String(userId) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this data",
      });
    }

    // Handle exercise_name + muscle_group case
    let finalExerciseId = exercise_id;
    let exerciseDetails;

    if (!finalExerciseId && exercise_name && muscle_group) {
      // Check if exercise with this name already exists
      const existingExerciseResult = await con.query(
        "SELECT exercise_id FROM exercises WHERE name = $1 AND muscle_group = $2 LIMIT 1",
        [exercise_name, muscle_group]
      );

      if (existingExerciseResult.rows.length > 0) {
        // Use existing exercise
        finalExerciseId = existingExerciseResult.rows[0].exercise_id;
      } else {
        // Create new exercise
        const newExerciseResult = await con.query(
          "INSERT INTO exercises (name, muscle_group) VALUES ($1, $2) RETURNING exercise_id",
          [exercise_name, muscle_group]
        );
        finalExerciseId = newExerciseResult.rows[0].exercise_id;
      }

      // Get exercise details
      const exerciseResult = await con.query(
        "SELECT * FROM exercises WHERE exercise_id = $1",
        [finalExerciseId]
      );
      exerciseDetails = exerciseResult.rows[0];
    } else if (finalExerciseId) {
      // Get exercise details from provided ID
      const exerciseResult = await con.query(
        "SELECT * FROM exercises WHERE exercise_id = $1",
        [finalExerciseId]
      );

      if (exerciseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Exercise not found",
        });
      }

      exerciseDetails = exerciseResult.rows[0];
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Either exercise_id or both exercise_name and muscle_group must be provided",
      });
    }

    // Insert exercise log with the determined exercise_id
    const result = await con.query(
      `INSERT INTO exercise_logs (user_id, exercise_id, date, sets, reps, weight, rest, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING log_id`,
      [userId, finalExerciseId, date, sets, reps, weight, rest || null, notes]
    );

    res.status(201).json({
      success: true,
      data: {
        log_id: result.rows[0].log_id,
        user_id: userId,
        exercise_id: finalExerciseId,
        date,
        sets,
        reps,
        weight: weight || null,
        rest: rest || null,
        notes,
        name: exerciseDetails.name,
        muscle_group: exerciseDetails.muscle_group,
        equipment: exerciseDetails.equipment,
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

// WORKOUT DAY FUNCTIONS

// Create a workout day for a program
export const createWorkoutDay = async (req, res) => {
  try {
    const { program_id } = req.params;
    const { workout_date, day_name, notes } = req.body;

    // Validate required fields
    if (!workout_date) {
      return res.status(400).json({
        success: false,
        message: "Workout date is required",
      });
    }

    // Check if program exists
    const programExists = await con.query(
      `SELECT 1 FROM training_programs WHERE program_id = $1`,
      [program_id]
    );

    if (programExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Training program not found",
      });
    }

    // Check if the workout day already exists for this date
    const existingDay = await con.query(
      `SELECT 1 FROM program_workout_days 
       WHERE program_id = $1 AND workout_date = $2`,
      [program_id, workout_date]
    );

    if (existingDay.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A workout day already exists for this date",
      });
    }

    // Create the workout day
    const result = await con.query(
      `INSERT INTO program_workout_days(
        program_id, 
        workout_date, 
        day_name, 
        notes
      ) VALUES($1, $2, $3, $4) RETURNING *`,
      [program_id, workout_date, day_name || null, notes || null]
    );

    return res.status(201).json({
      success: true,
      message: "Workout day created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating workout day:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all workout days for a program
export const getWorkoutDays = async (req, res) => {
  try {
    const { program_id } = req.params;

    // Check if program exists
    const programExists = await con.query(
      `SELECT 1 FROM training_programs WHERE program_id = $1`,
      [program_id]
    );

    if (programExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Training program not found",
      });
    }

    // Get all workout days
    const result = await con.query(
      `SELECT * FROM program_workout_days 
       WHERE program_id = $1 
       ORDER BY workout_date`,
      [program_id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting workout days:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Add exercises to a workout day
export const addExercisesToWorkoutDay = async (req, res) => {
  try {
    const { workout_day_id } = req.params;
    const { exercises } = req.body;

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Exercises array is required",
      });
    }

    // Check if workout day exists
    const workoutDay = await con.query(
      `SELECT program_id FROM program_workout_days WHERE workout_day_id = $1`,
      [workout_day_id]
    );

    if (workoutDay.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workout day not found",
      });
    }

    const programId = workoutDay.rows[0].program_id;

    // Begin transaction
    await con.query("BEGIN");

    // Insert exercises
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      await con.query(
        `INSERT INTO program_exercises(
          program_id,
          workout_day_id,
          movement,
          intensity_kg,
          weight_used,
          actual_rpe,
          sets,
          reps,
          tempo,
          rest,
          coaches_notes,
          exercise_order
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          programId,
          workout_day_id,
          ex.movement,
          ex.intensity_kg || null,
          ex.weight_used || null,
          ex.actual_rpe || null,
          ex.sets,
          ex.reps,
          ex.tempo || null,
          ex.rest || null,
          ex.coaches_notes || ex.notes || null,
          i + 1, // exercise_order starts from 1
        ]
      );
    }

    // Commit transaction
    await con.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Exercises added to workout day successfully",
    });
  } catch (error) {
    // Rollback transaction in case of error
    await con.query("ROLLBACK");
    console.error("Error adding exercises to workout day:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get exercises for a specific workout day
export const getWorkoutDayExercises = async (req, res) => {
  try {
    const { workout_day_id } = req.params;

    // Check if workout day exists
    const workoutDayExists = await con.query(
      `SELECT 1 FROM program_workout_days WHERE workout_day_id = $1`,
      [workout_day_id]
    );

    if (workoutDayExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workout day not found",
      });
    }

    // Get exercises for the workout day
    const exercisesResult = await con.query(
      `SELECT * FROM program_exercises 
       WHERE workout_day_id = $1 
       ORDER BY exercise_order`,
      [workout_day_id]
    );

    return res.status(200).json({
      success: true,
      data: {
        exercises: exercisesResult.rows,
      },
    });
  } catch (error) {
    console.error("Error fetching workout day exercises:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update a workout day
export const updateWorkoutDay = async (req, res) => {
  try {
    const { workout_day_id } = req.params;
    const { workout_date, day_name, notes } = req.body;

    // Check if workout day exists
    const workoutDayExists = await con.query(
      `SELECT program_id FROM program_workout_days WHERE workout_day_id = $1`,
      [workout_day_id]
    );

    if (workoutDayExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workout day not found",
      });
    }

    const programId = workoutDayExists.rows[0].program_id;

    // If workout date is being changed, check for conflicts
    if (workout_date) {
      const dateConflict = await con.query(
        `SELECT 1 FROM program_workout_days 
         WHERE program_id = $1 AND workout_date = $2 AND workout_day_id != $3`,
        [programId, workout_date, workout_day_id]
      );

      if (dateConflict.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Another workout day already exists for this date",
        });
      }
    }

    // Update the workout day
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (workout_date !== undefined) {
      updateFields.push(`workout_date = $${paramCount++}`);
      values.push(workout_date);
    }

    if (day_name !== undefined) {
      updateFields.push(`day_name = $${paramCount++}`);
      values.push(day_name);
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    values.push(workout_day_id);

    const result = await con.query(
      `UPDATE program_workout_days 
       SET ${updateFields.join(", ")} 
       WHERE workout_day_id = $${paramCount} 
       RETURNING *`,
      values
    );

    return res.status(200).json({
      success: true,
      message: "Workout day updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating workout day:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a workout day and its exercises
export const deleteWorkoutDay = async (req, res) => {
  try {
    const { workout_day_id } = req.params;

    // Check if workout day exists
    const workoutDayExists = await con.query(
      `SELECT 1 FROM program_workout_days WHERE workout_day_id = $1`,
      [workout_day_id]
    );

    if (workoutDayExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workout day not found",
      });
    }

    // Begin transaction
    await con.query("BEGIN");

    // Delete exercises for this workout day
    await con.query(`DELETE FROM program_exercises WHERE workout_day_id = $1`, [
      workout_day_id,
    ]);

    // Delete the workout day
    await con.query(
      `DELETE FROM program_workout_days WHERE workout_day_id = $1`,
      [workout_day_id]
    );

    // Commit transaction
    await con.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Workout day and associated exercises deleted successfully",
    });
  } catch (error) {
    // Rollback transaction in case of error
    await con.query("ROLLBACK");
    console.error("Error deleting workout day:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update exercises for a workout day
export const updateWorkoutDayExercises = async (req, res) => {
  try {
    const { workout_day_id } = req.params;
    const { exercises } = req.body;

    if (!exercises || !Array.isArray(exercises)) {
      return res.status(400).json({
        success: false,
        message: "Exercises array is required",
      });
    }

    // Check if workout day exists
    const workoutDay = await con.query(
      `SELECT program_id FROM program_workout_days WHERE workout_day_id = $1`,
      [workout_day_id]
    );

    if (workoutDay.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Workout day not found",
      });
    }

    const programId = workoutDay.rows[0].program_id;

    // Begin transaction
    await con.query("BEGIN");

    // Delete existing exercises for this workout day
    await con.query(`DELETE FROM program_exercises WHERE workout_day_id = $1`, [
      workout_day_id,
    ]);

    // Insert updated exercises
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      await con.query(
        `INSERT INTO program_exercises(
          program_id,
          workout_day_id,
          movement,
          intensity_kg,
          weight_used,
          actual_rpe,
          sets,
          reps,
          tempo,
          rest,
          coaches_notes,
          exercise_order
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          programId,
          workout_day_id,
          ex.movement,
          ex.intensity_kg || null,
          ex.weight_used || null,
          ex.actual_rpe || null,
          ex.sets,
          ex.reps,
          ex.tempo || null,
          ex.rest || null,
          ex.coaches_notes || ex.notes || null,
          i + 1, // exercise_order starts from 1
        ]
      );
    }

    // Commit transaction
    await con.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Workout day exercises updated successfully",
    });
  } catch (error) {
    // Rollback transaction in case of error
    await con.query("ROLLBACK");
    console.error("Error updating workout day exercises:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
