import con from "../db.js";

// Get all training programs
export const getAllTrainingPrograms = async (req, res) => {
  try {
    const result = await con.query(`
      SELECT p.*, 
             COUNT(DISTINCT pd.download_id) as download_count
      FROM training_programs p
      LEFT JOIN program_downloads pd ON p.program_id = pd.program_id
      GROUP BY p.program_id
      ORDER BY p.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting training programs:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get exercises for a specific training program
export const getTrainingProgramExercises = async (req, res) => {
  try {
    const { id } = req.params;

    // Get exercises for the program, including workout day information
    const exercisesResult = await con.query(
      `SELECT pe.*, pwd.workout_date, pwd.day_name
       FROM program_exercises pe
       LEFT JOIN program_workout_days pwd ON pe.workout_day_id = pwd.workout_day_id
       WHERE pe.program_id = $1 
       ORDER BY pwd.workout_date, pe.exercise_order`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        exercises: exercisesResult.rows,
      },
    });
  } catch (error) {
    console.error("Error fetching program exercises:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get training program by ID with workout days
export const getTrainingProgramById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the program details
    const programResult = await con.query(
      `SELECT * FROM training_programs WHERE program_id = $1`,
      [id]
    );

    if (programResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Training program not found",
      });
    }

    // Get the workout days
    const workoutDaysResult = await con.query(
      `SELECT * FROM program_workout_days 
       WHERE program_id = $1 
       ORDER BY workout_date`,
      [id]
    );

    // Get all exercises for this program (we'll organize them by workout day)
    const exercisesResult = await con.query(
      `SELECT pe.*, pwd.workout_date, pwd.day_name 
       FROM program_exercises pe
       LEFT JOIN program_workout_days pwd ON pe.workout_day_id = pwd.workout_day_id
       WHERE pe.program_id = $1 
       ORDER BY pwd.workout_date, pe.exercise_order`,
      [id]
    );

    // Organize exercises by workout day
    const workoutDays = {};
    workoutDaysResult.rows.forEach((day) => {
      workoutDays[day.workout_day_id] = {
        ...day,
        exercises: [],
      };
    });

    // Add exercises to their respective workout days
    exercisesResult.rows.forEach((exercise) => {
      if (exercise.workout_day_id && workoutDays[exercise.workout_day_id]) {
        workoutDays[exercise.workout_day_id].exercises.push(exercise);
      }
    });

    // Create program object with workout days
    const program = {
      ...programResult.rows[0],
      workout_days: Object.values(workoutDays),
      // Keep the original exercises array for backwards compatibility
      exercises: exercisesResult.rows,
    };

    return res.status(200).json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error("Error getting training program:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Create a new training program with workout days
export const createTrainingProgram = async (req, res) => {
  try {
    const {
      title,
      description,
      goal_type,
      difficulty,
      duration,
      exercises = [],
      workout_days = [], // New parameter for workout days
      frequency = "Not specified",
      highlights = null,
      image = null,
    } = req.body;

    // Add this validation before your SQL query
    if (!title || !description || !goal_type || !difficulty || !duration) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Use image URL directly from request
    const imageUrl = image;

    let formattedHighlights = highlights;
    if (highlights && typeof highlights === "string") {
      // Convert string to PostgreSQL array format: '{item1,item2}'
      formattedHighlights = `{${highlights}}`;
    } else if (Array.isArray(highlights)) {
      // Format array properly for PostgreSQL
      formattedHighlights = `{${highlights.join(",")}}`;
    }

    // Begin transaction
    await con.query("BEGIN");

    // Insert the program
    const programResult = await con.query(
      `INSERT INTO training_programs(
        title, 
        description, 
        image_url, 
        goal_type, 
        difficulty, 
        duration, 
        frequency,
        highlights,
        is_featured,
        file_url
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        title,
        description,
        imageUrl,
        goal_type,
        difficulty,
        duration,
        frequency,
        formattedHighlights,
        false,
        "",
      ]
    );

    const programId = programResult.rows[0].program_id;

    // Process workout days if provided
    const workoutDayMap = {}; // To map workout day dates to their IDs

    if (workout_days && workout_days.length > 0) {
      for (const day of workout_days) {
        // Insert workout day
        const workoutDayResult = await con.query(
          `INSERT INTO program_workout_days(
            program_id, 
            workout_date, 
            day_name, 
            notes
          ) VALUES($1, $2, $3, $4) RETURNING *`,
          [programId, day.workout_date, day.day_name || null, day.notes || null]
        );

        const workoutDayId = workoutDayResult.rows[0].workout_day_id;
        workoutDayMap[day.workout_date] = workoutDayId;

        // Insert exercises for this workout day if provided
        if (day.exercises && day.exercises.length > 0) {
          for (let i = 0; i < day.exercises.length; i++) {
            const ex = day.exercises[i];
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
                workoutDayId,
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
        }
      }
    }

    // For backward compatibility - insert exercises without workout days if provided
    // and no workout days were specified
    if (exercises.length > 0 && workout_days.length === 0) {
      // If no workout days were specified but exercises were provided,
      // create a default workout day for these exercises
      const defaultWorkoutDate = new Date();
      const defaultWorkoutResult = await con.query(
        `INSERT INTO program_workout_days(
          program_id, 
          workout_date, 
          day_name
        ) VALUES($1, $2, $3) RETURNING *`,
        [programId, defaultWorkoutDate, "Default Workout"]
      );

      const defaultWorkoutDayId = defaultWorkoutResult.rows[0].workout_day_id;

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
            defaultWorkoutDayId,
            ex.movement,
            ex.intensity || null,
            ex.weight_used || null,
            ex.actual_rpe || null,
            ex.sets,
            ex.reps,
            ex.tempo || null,
            ex.rest || null,
            ex.notes || null,
            i + 1, // exercise_order starts from 1
          ]
        );
      }
    }

    // Commit transaction
    await con.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Training program created successfully",
      data: programResult.rows[0],
    });
  } catch (error) {
    // Rollback transaction in case of error
    await con.query("ROLLBACK");
    console.error("Error creating training program:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update a training program with workout days
export const updateTrainingProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      goal_type,
      difficulty,
      duration,
      exercises = [],
      workout_days = [], // New parameter for workout days
      frequency = null,
      highlights = null,
      image = null,
    } = req.body;

    // Check if program exists
    const existingProgram = await con.query(
      `SELECT * FROM training_programs WHERE program_id = $1`,
      [id]
    );

    if (existingProgram.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Training program not found",
      });
    }

    // Use existing image or new one if provided
    const imageUrl = image || existingProgram.rows[0].image_url;

    let formattedHighlights = highlights;
    if (highlights && typeof highlights === "string") {
      formattedHighlights = `{${highlights}}`;
    } else if (Array.isArray(highlights)) {
      formattedHighlights = `{${highlights.join(",")}}`;
    }

    // Begin transaction
    await con.query("BEGIN");

    // Update the program
    const updatedProgram = await con.query(
      `UPDATE training_programs SET
        title = $1,
        description = $2,
        image_url = $3,
        goal_type = $4,
        difficulty = $5,
        duration = $6,
        frequency = $7,
        highlights = $8,
        file_url = $9,
        updated_at = NOW()
      WHERE program_id = $10 RETURNING *`,
      [
        title,
        description,
        imageUrl,
        goal_type,
        difficulty,
        duration,
        frequency,
        formattedHighlights,
        existingProgram.rows[0].file_url,
        id,
      ]
    );

    // If workout days are provided, update them
    if (workout_days && workout_days.length > 0) {
      // Delete all existing workout days and exercises
      await con.query(
        `DELETE FROM program_workout_days WHERE program_id = $1`,
        [id]
      );
      // Exercises will be deleted by cascade effect

      // Create new workout days and exercises
      for (const day of workout_days) {
        // Insert workout day
        const workoutDayResult = await con.query(
          `INSERT INTO program_workout_days(
            program_id, 
            workout_date, 
            day_name, 
            notes
          ) VALUES($1, $2, $3, $4) RETURNING *`,
          [id, day.workout_date, day.day_name || null, day.notes || null]
        );

        const workoutDayId = workoutDayResult.rows[0].workout_day_id;

        // Insert exercises for this workout day
        if (day.exercises && day.exercises.length > 0) {
          for (let i = 0; i < day.exercises.length; i++) {
            const ex = day.exercises[i];
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
                id,
                workoutDayId,
                ex.movement,
                ex.intensity_kg || ex.intensity || null,
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
        }
      }
    }
    // For backward compatibility - if only exercises are provided (old format)
    else if (exercises && exercises.length > 0) {
      // Delete all existing exercises
      await con.query(`DELETE FROM program_exercises WHERE program_id = $1`, [
        id,
      ]);

      // Check if there are any workout days
      const existingWorkoutDays = await con.query(
        `SELECT workout_day_id FROM program_workout_days WHERE program_id = $1 LIMIT 1`,
        [id]
      );

      let workoutDayId;

      // If no workout days exist, create a default one
      if (existingWorkoutDays.rows.length === 0) {
        const defaultWorkoutDate = new Date();
        const defaultWorkoutResult = await con.query(
          `INSERT INTO program_workout_days(
            program_id, 
            workout_date, 
            day_name
          ) VALUES($1, $2, $3) RETURNING *`,
          [id, defaultWorkoutDate, "Default Workout"]
        );

        workoutDayId = defaultWorkoutResult.rows[0].workout_day_id;
      } else {
        // Use the first existing workout day
        workoutDayId = existingWorkoutDays.rows[0].workout_day_id;
      }

      // Insert exercises into the workout day
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
            id,
            workoutDayId,
            ex.movement,
            ex.intensity_kg || ex.intensity || null,
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
    }

    // Commit transaction
    await con.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Training program updated successfully",
      data: updatedProgram.rows[0],
    });
  } catch (error) {
    // Rollback transaction in case of error
    await con.query("ROLLBACK");
    console.error("Error updating training program:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a training program
export const deleteTrainingProgram = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if program exists
    const existingProgram = await con.query(
      `SELECT * FROM training_programs WHERE program_id = $1`,
      [id]
    );

    if (existingProgram.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Training program not found",
      });
    }

    // Begin transaction
    await con.query("BEGIN");

    // Delete from featured if it was featured
    await con.query(`DELETE FROM featured_programs WHERE program_id = $1`, [
      id,
    ]);

    // Delete workout days (will cascade delete exercises)
    await con.query(`DELETE FROM program_workout_days WHERE program_id = $1`, [
      id,
    ]);

    // Delete any exercises that might not be associated with workout days
    await con.query(`DELETE FROM program_exercises WHERE program_id = $1`, [
      id,
    ]);

    // Delete downloads
    await con.query(`DELETE FROM program_downloads WHERE program_id = $1`, [
      id,
    ]);

    // Delete program
    await con.query(`DELETE FROM training_programs WHERE program_id = $1`, [
      id,
    ]);

    // Commit transaction
    await con.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Training program deleted successfully",
    });
  } catch (error) {
    // Rollback transaction in case of error
    await con.query("ROLLBACK");
    console.error("Error deleting training program:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// The remaining functions (getFeaturedProgram, setFeaturedProgram,
// recordProgramDownload, getUserDownloads) can remain unchanged
export const getFeaturedProgram = async (req, res) => {
  try {
    console.log("Fetching featured programs"); // Add this debugging line

    const featuredPrograms = await con.query(
      `SELECT * FROM training_programs 
       WHERE is_featured = true 
       ORDER BY created_at DESC
       LIMIT 1`
    );

    console.log("Featured programs query result:", featuredPrograms.rows); // Debug

    return res.status(200).json({
      success: true,
      data: featuredPrograms.rows[0], // Return the first featured program
    });
  } catch (error) {
    console.error("Error getting featured programs:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const setFeaturedProgram = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if program exists
    const programExists = await con.query(
      `SELECT 1 FROM training_programs WHERE program_id = $1`,
      [id]
    );

    if (programExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Training program not found",
      });
    }

    // Begin transaction
    await con.query("BEGIN");

    // First, remove featured status from all programs
    await con.query(`UPDATE training_programs SET is_featured = FALSE`);

    // Then set the new featured program
    await con.query(
      `UPDATE training_programs SET is_featured = TRUE WHERE program_id = $1`,
      [id]
    );

    // Commit transaction
    await con.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Program set as featured successfully",
    });
  } catch (error) {
    // Rollback transaction in case of error
    await con.query("ROLLBACK");
    console.error("Error setting featured program:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const recordProgramDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if program exists
    const programExists = await con.query(
      `SELECT 1 FROM training_programs WHERE program_id = $1`,
      [id]
    );

    if (programExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Training program not found",
      });
    }

    // Record the download
    await con.query(
      `INSERT INTO program_downloads(program_id, user_id) VALUES($1, $2)`,
      [id, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Program download recorded",
      file_url: null, // No longer generating PDF
    });
  } catch (error) {
    console.error("Error recording download:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getUserDownloads = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await con.query(
      `
      SELECT p.*, pd.downloaded_at
      FROM program_downloads pd
      JOIN training_programs p ON pd.program_id = p.program_id
      WHERE pd.user_id = $1
      ORDER BY pd.downloaded_at DESC
    `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting user downloads:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
