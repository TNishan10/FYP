import con from "../server.js";

// Search food database
export const searchFoods = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const result = await con.query(
      "SELECT * FROM foods WHERE name ILIKE $1 OR brand ILIKE $1 LIMIT 20",
      [`%${query}%`]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error searching foods:", error);
    res.status(500).json({
      success: false,
      message: "Error searching foods",
      error: error.message,
    });
  }
};

export const getDailyFoodLog = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Format the date properly or use current date
    const formattedDate = date || new Date().toISOString().split("T")[0];

    // Changed table name from daily_log to food_logs
    const result = await con.query(
      `SELECT 
        dl.log_id,
        dl.user_id,
        dl.food_id,
        dl.date,
        dl.meal_type,
        dl.servings,
        f.name,
        f.calories,
        f.protein,
        f.carbs,
        f.fats,
        f.fiber,
        f.serving_size
      FROM food_logs dl
      JOIN foods f ON dl.food_id = f.food_id
      WHERE dl.user_id = $1 AND dl.date = $2
      ORDER BY dl.created_at DESC`,
      [userId, formattedDate]
    );

    // Return the results
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error in getDailyFoodLog:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching food log",
      error: error.message,
    });
  }
};

export const addFoodToLog = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { food_id, date, meal_type, servings } = req.body;

    // Add detailed debugging
    console.log("=== Food Log Request ===");
    console.log("User ID:", userId);
    console.log("Food Data:", { food_id, date, meal_type, servings });
    console.log(
      "Auth user:",
      req.user
        ? `ID: ${req.user.id}, Admin: ${req.user.isAdmin}`
        : "Not authenticated"
    );

    // Check if req.user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Validate required fields
    if (!food_id) {
      return res.status(400).json({
        success: false,
        message: "food_id is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date is required",
      });
    }

    // ALREADY UPDATED: Use string comparison for UUID format
    if (String(req.user.id) !== String(userId) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this data",
      });
    }

    // Insert food log with better error handling
    try {
      const result = await con.query(
        `INSERT INTO food_logs (user_id, food_id, date, meal_type, servings)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING log_id`,
        [userId, food_id, date, meal_type || "snack", servings || 1]
      );

      res.status(201).json({
        success: true,
        data: {
          log_id: result.rows[0].log_id,
        },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Database error when adding food to log",
        error: dbError.message,
        detail: dbError.detail || "No additional details",
      });
    }
  } catch (error) {
    console.error("Error adding food to log:", error);
    res.status(500).json({
      success: false,
      message: "Error adding food to log",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Add food to database
export const addFood = async (req, res) => {
  try {
    const { name, brand, serving_size, calories, protein, carbs, fats, fiber } =
      req.body;

    // Insert the food into database
    const result = await con.query(
      `INSERT INTO foods (name, brand, serving_size, calories, protein, carbs, fats, fiber)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING food_id`,
      [name, brand, serving_size, calories, protein, carbs, fats, fiber]
    );

    res.status(201).json({
      success: true,
      data: {
        food_id: result.rows[0].food_id,
      },
    });
  } catch (error) {
    console.error("Error adding food:", error);
    res.status(500).json({
      success: false,
      message: "Error adding food",
      error: error.message,
    });
  }
};

// Remove food from user's daily log
export const removeFoodFromLog = async (req, res) => {
  try {
    const userId = req.params.userId;
    const logId = req.params.logId;

    // Debug logging
    console.log("Auth check for removing food:", {
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

    // Delete food log entry
    await con.query(
      "DELETE FROM food_logs WHERE log_id = $1 AND user_id = $2",
      [logId, userId]
    );

    res.status(200).json({
      success: true,
      data: { log_id: parseInt(logId) },
    });
  } catch (error) {
    console.error("Error removing food from log:", error);
    res.status(500).json({
      success: false,
      message: "Error removing food from log",
      error: error.message,
    });
  }
};
