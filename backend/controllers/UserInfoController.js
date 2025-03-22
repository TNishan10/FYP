import con from "../server.js";
import pool from "../db.js";

// Get all user info records
export const getAllUserInfo = async (req, res) => {
  try {
    const query = 'SELECT * FROM public."user_info" ORDER BY user_info_id';
    const result = await con.query(query);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching user info",
      error: error.message,
    });
  }
};

// Get user info by user_info_id
export const getUserInfoById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM public."user_info" WHERE user_info_id = $1';
    const result = await con.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User info not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching user info",
      error: error.message,
    });
  }
};

// Get user info by user_id (foreign key)
export const getUserInfoByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Use proper casting for UUID in PostgreSQL
    const query = `SELECT * FROM public."user_info" WHERE user_id::text = $1`;
    const result = await pool.query(query, [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User info not found for this user",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching user info",
      error: error.message,
    });
  }
};

// Create new user info
export const createUserInfo = async (req, res) => {
  try {
    const {
      user_id,
      gender,
      DOB,
      weight,
      height,
      goal,
      neck_size,
      shoulder_size,
      forearm_size,
      biceps_size,
      hip_size,
      thigh_size,
      claves_size,
      // Remove user_info_id from destructuring
    } = req.body;

    // Validate required fields
    if (!user_id || !gender || !DOB || !weight || !height || !goal) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: user_id, gender, DOB, weight, height, and goal are required",
      });
    }

    // Check if user info already exists for this user_id
    const checkQuery = 'SELECT * FROM public."user_info" WHERE user_id = $1';
    const checkResult = await con.query(checkQuery, [user_id]);

    if (checkResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User info already exists for this user",
        data: checkResult.rows[0],
      });
    }

    // Insert new user info - REMOVE user_info_id from the field list
    const query = `
      INSERT INTO public."user_info" (
        user_id, gender, DOB, weight, height, goal, 
        neck_size, shoulder_size, forearm_size, biceps_size, 
        hip_size, thigh_size, claves_size
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      user_id,
      gender,
      DOB,
      weight,
      height,
      goal,
      neck_size || null,
      shoulder_size || null,
      forearm_size || null,
      biceps_size || null,
      hip_size || null,
      thigh_size || null,
      claves_size || null,
      // Remove user_info_id from values array
    ];

    const result = await con.query(query, values);

    res.status(201).json({
      success: true,
      message: "User info created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      success: false,
      message: "Error creating user info",
      error: error.message,
    });
  }
};

// Update user info
export const updateUserInfo = async (req, res) => {
  try {
    const { id } = req.params; // This is user_info_id
    const {
      gender,
      DOB,
      weight,
      height,
      goal,
      neck_size,
      shoulder_size,
      forearm_size,
      biceps_size,
      hip_size,
      thigh_size,
      claves_size,
    } = req.body;

    // Check if user info exists
    const checkQuery =
      'SELECT * FROM public."user_info" WHERE user_info_id = $1';
    const checkResult = await con.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User info not found",
      });
    }

    // Build the query dynamically based on provided fields
    let updateFields = [];
    let values = [];
    let paramIndex = 1;

    if (gender !== undefined) {
      updateFields.push(`gender = $${paramIndex++}`);
      values.push(gender);
    }

    if (DOB !== undefined) {
      updateFields.push(`DOB = $${paramIndex++}`);
      values.push(DOB);
    }

    if (weight !== undefined) {
      updateFields.push(`weight = $${paramIndex++}`);
      values.push(weight);
    }

    if (height !== undefined) {
      updateFields.push(`height = $${paramIndex++}`);
      values.push(height);
    }

    if (goal !== undefined) {
      updateFields.push(`goal = $${paramIndex++}`);
      values.push(goal);
    }

    if (neck_size !== undefined) {
      updateFields.push(`neck_size = $${paramIndex++}`);
      values.push(neck_size);
    }

    if (shoulder_size !== undefined) {
      updateFields.push(`shoulder_size = $${paramIndex++}`);
      values.push(shoulder_size);
    }

    if (forearm_size !== undefined) {
      updateFields.push(`forearm_size = $${paramIndex++}`);
      values.push(forearm_size);
    }

    if (biceps_size !== undefined) {
      updateFields.push(`biceps_size = $${paramIndex++}`);
      values.push(biceps_size);
    }

    if (hip_size !== undefined) {
      updateFields.push(`hip_size = $${paramIndex++}`);
      values.push(hip_size);
    }

    if (thigh_size !== undefined) {
      updateFields.push(`thigh_size = $${paramIndex++}`);
      values.push(thigh_size);
    }

    if (claves_size !== undefined) {
      updateFields.push(`claves_size = $${paramIndex++}`);
      values.push(claves_size);
    }

    // If no fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update provided",
      });
    }

    // Add user_info_id to values array
    values.push(id);

    // Build and execute the query
    const query = `
      UPDATE public."user_info" 
      SET ${updateFields.join(", ")}
      WHERE user_info_id = $${paramIndex}
      RETURNING *
    `;

    const result = await con.query(query, values);

    res.status(200).json({
      success: true,
      message: "User info updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      success: false,
      message: "Error updating user info",
      error: error.message,
    });
  }
};

// Delete user info
export const deleteUserInfo = async (req, res) => {
  try {
    const { id } = req.params; // This is user_info_id

    const query =
      'DELETE FROM public."user_info" WHERE user_info_id = $1 RETURNING *';
    const result = await con.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User info not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User info deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      success: false,
      message: "Error deleting user info",
      error: error.message,
    });
  }
};

// Delete user info by user_id
export const deleteUserInfoByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    const query =
      'DELETE FROM public."user_info" WHERE user_id = $1 RETURNING *';
    const result = await con.query(query, [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User info not found for this user",
      });
    }

    res.status(200).json({
      success: true,
      message: "User info deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      success: false,
      message: "Error deleting user info",
      error: error.message,
    });
  }
};
