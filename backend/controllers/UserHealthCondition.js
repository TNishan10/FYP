import con from "../server.js";

// Get all user-health condition associations
export const getAllUserHealthConditions = async (req, res) => {
  try {
    const query = `
      SELECT uh.user_id, uh.condition_id, hc.condition_name, u.user_email
      FROM public."user_health" uh
      JOIN public."users" u ON uh.user_id = u.user_id
      JOIN public."health_condition" hc ON uh.condition_id = hc.condition_id
    `;
    const result = await con.query(query);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      message: "Error fetching user health conditions",
      error: error.message,
    });
  }
};

// Get health conditions for a specific user
export const getUserHealthConditions = async (req, res) => {
  try {
    const { user_id } = req.params;

    const query = `
      SELECT uh.condition_id, hc.condition_name
      FROM public."user_health" uh
      JOIN public."health_condition" hc ON uh.condition_id = hc.condition_id
      WHERE uh.user_id = $1
    `;
    const result = await con.query(query, [user_id]);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      message: "Error fetching health conditions for user",
      error: error.message,
    });
  }
};

// Get users with a specific health condition
export const getUsersByHealthCondition = async (req, res) => {
  try {
    const { condition_id } = req.params;

    const query = `
      SELECT uh.user_id, u.user_email
      FROM public."user_health" uh
      JOIN public."users" u ON uh.user_id = u.user_id
      WHERE uh.condition_id = $1
    `;
    const result = await con.query(query, [condition_id]);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      message: "Error fetching users with this health condition",
      error: error.message,
    });
  }
};

// Get a specific user-health condition association
export const getUserHealthConditionById = async (req, res) => {
  try {
    const { user_id, condition_id } = req.params;

    const query = `
      SELECT uh.user_id, uh.condition_id, hc.condition_name, u.user_email
      FROM public."user_health" uh
      JOIN public."users" u ON uh.user_id = u.user_id
      JOIN public."health_condition" hc ON uh.condition_id = hc.condition_id
      WHERE uh.user_id = $1 AND uh.condition_id = $2
    `;

    const result = await con.query(query, [user_id, condition_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Association between user and health condition not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      message: "Error fetching user-health condition association",
      error: error.message,
    });
  }
};

// Add health condition to user
export const addUserHealthCondition = async (req, res) => {
  try {
    const { user_id, condition_id } = req.body;

    if (!user_id || !condition_id) {
      return res.status(400).json({
        success: false,
        message: "Both user_id and condition_id are required",
      });
    }

    // Check if the association already exists
    const checkQuery =
      'SELECT * FROM public."user_health" WHERE user_id = $1 AND condition_id = $2';
    const checkResult = await con.query(checkQuery, [user_id, condition_id]);

    if (checkResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This health condition is already associated with the user",
      });
    }

    // Add the association - CORRECTED COLUMN ORDER
    const insertQuery =
      'INSERT INTO public."user_health" (condition_id, user_id) VALUES ($1, $2) RETURNING *';
    const result = await con.query(insertQuery, [condition_id, user_id]);

    res.status(201).json({
      success: true,
      message: "Health condition added to user successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      message: "Error adding health condition to user",
      error: error.message,
    });
  }
};

// Remove health condition from user
export const removeUserHealthCondition = async (req, res) => {
  try {
    const { user_id, condition_id } = req.params;

    const query =
      'DELETE FROM public."user_health" WHERE user_id = $1 AND condition_id = $2 RETURNING *';
    const result = await con.query(query, [user_id, condition_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Association between user and health condition not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Health condition removed from user successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      message: "Error removing health condition from user",
      error: error.message,
    });
  }
};

// Update user's health conditions (replace all existing ones with new list)
export const updateUserHealthConditions = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { condition_ids } = req.body;

    if (!Array.isArray(condition_ids)) {
      return res.status(400).json({
        success: false,
        message: "condition_ids must be an array of health condition IDs",
      });
    }

    // Begin transaction
    await con.query("BEGIN");

    // Delete all existing associations
    await con.query('DELETE FROM public."user_health" WHERE user_id = $1', [
      user_id,
    ]);

    // Insert new associations
    let insertedRows = [];

    if (condition_ids.length > 0) {
      // Prepare values for bulk insert - CORRECTED VALUES ORDER
      const values = condition_ids
        .map((condition_id) => `(${condition_id}, '${user_id}')`)
        .join(", ");
      const insertQuery = `INSERT INTO public."user_health" (condition_id, user_id) VALUES ${values} RETURNING *`;
      const result = await con.query(insertQuery);
      insertedRows = result.rows;
    }

    // Commit transaction
    await con.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "User health conditions updated successfully",
      data: insertedRows,
    });
  } catch (error) {
    // Rollback transaction in case of error
    await con.query("ROLLBACK");

    console.error("Error executing query", error.stack);
    res.status(500).json({
      message: "Error updating user health conditions",
      error: error.message,
    });
  }
};
