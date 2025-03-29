import con from "../server.js";

// Get user's weight history
export const getWeightHistory = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if user is authorized
    if (req.user.id !== parseInt(userId) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this data",
      });
    }

    const result = await con.query(
      "SELECT * FROM weight_entries WHERE user_id = $1 ORDER BY date ASC",
      [userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching weight history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching weight history",
      error: error.message,
    });
  }
};

// Add weight entry
export const addWeightEntry = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { weight, date, notes } = req.body;

    // Check if user is authorized
    if (req.user.id !== parseInt(userId) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this data",
      });
    }

    // Check if an entry already exists for this date
    const existingEntry = await con.query(
      "SELECT * FROM weight_entries WHERE user_id = $1 AND date = $2",
      [userId, date]
    );

    if (existingEntry.rows.length > 0) {
      // Update existing entry
      await con.query(
        "UPDATE weight_entries SET weight = $1, notes = $2 WHERE user_id = $3 AND date = $4",
        [weight, notes, userId, date]
      );

      res.status(200).json({
        success: true,
        data: {
          weight_id: existingEntry.rows[0].weight_id,
          user_id: parseInt(userId),
          weight,
          date,
          notes,
        },
      });
    } else {
      // Add new entry
      const result = await con.query(
        "INSERT INTO weight_entries (user_id, weight, date, notes) VALUES ($1, $2, $3, $4) RETURNING weight_id",
        [userId, weight, date, notes]
      );

      res.status(201).json({
        success: true,
        data: {
          weight_id: result.rows[0].weight_id,
          user_id: parseInt(userId),
          weight,
          date,
          notes,
        },
      });
    }
  } catch (error) {
    console.error("Error adding weight entry:", error);
    res.status(500).json({
      success: false,
      message: "Error adding weight entry",
      error: error.message,
    });
  }
};

// Delete weight entry
export const deleteWeightEntry = async (req, res) => {
  try {
    const userId = req.params.userId;
    const weightId = req.params.weightId;

    // Check if user is authorized
    if (req.user.id !== parseInt(userId) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this data",
      });
    }

    await con.query(
      "DELETE FROM weight_entries WHERE weight_id = $1 AND user_id = $2",
      [weightId, userId]
    );

    res.status(200).json({
      success: true,
      data: { weight_id: parseInt(weightId) },
    });
  } catch (error) {
    console.error("Error deleting weight entry:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting weight entry",
      error: error.message,
    });
  }
};
