import con from "../server.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

// Get all users (with pagination) - exclude passwords
export const getAllUsers = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Query to get users with pagination
    const query = `
      SELECT 
        user_id, user_name, user_email, user_role, 
        account_status, is_verified, token_expires_at 
      FROM public."users" 
      ORDER BY user_name 
      LIMIT $1 OFFSET $2
    `;
    const result = await con.query(query, [limit, offset]);

    // Get total count for pagination info
    const countQuery = 'SELECT COUNT(*) FROM public."users"';
    const countResult = await con.query(countQuery);
    const totalUsers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      pagination: {
        currentPage: page,
        totalPages,
        total_count: totalUsers,
        totalItems: totalUsers,
        itemsPerPage: limit,
      },
      data: result.rows,
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Get user by ID - exclude password
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        user_id, user_name, user_email, user_role, 
        account_status, is_verified, token_expires_at 
      FROM public."users" 
      WHERE user_id = $1
    `;
    const result = await con.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    const {
      user_name,
      user_email,
      user_password,
      user_role = "user",
      account_status = "active",
      is_verified = false,
    } = req.body;

    // Validation
    if (!user_name || !user_email || !user_password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if email already exists
    const emailCheck = await con.query(
      'SELECT * FROM public."users" WHERE user_email = $1',
      [user_email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user_password, saltRounds);

    // Generate UUID and verification token
    const user_id = uuidv4();
    const verification_token = Math.random().toString(36).substring(2, 12);
    const token_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Insert new user
    const query = `
      INSERT INTO public."users" (
        user_id, user_name, user_email, user_password, user_role, 
        account_status, is_verified, verification_token, token_expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING user_id, user_name, user_email, user_role, account_status, is_verified, token_expires_at
    `;

    const values = [
      user_id,
      user_name,
      user_email,
      hashedPassword,
      user_role,
      account_status,
      is_verified,
      verification_token,
      token_expires_at,
    ];

    const result = await con.query(query, values);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0],
      verification_token, // Only include this in development, remove for production
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_name,
      user_email,
      user_password,
      user_role,
      account_status,
      is_verified,
    } = req.body;

    // Check if user exists
    const userCheck = await con.query(
      'SELECT * FROM public."users" WHERE user_id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Start building the query
    let updateFields = [];
    let values = [];
    let paramIndex = 1;

    if (user_name !== undefined) {
      updateFields.push(`user_name = $${paramIndex++}`);
      values.push(user_name);
    }

    if (user_email !== undefined) {
      // Check if email is already in use by another user
      if (user_email !== userCheck.rows[0].user_email) {
        const emailCheck = await con.query(
          'SELECT * FROM public."users" WHERE user_email = $1 AND user_id != $2',
          [user_email, id]
        );

        if (emailCheck.rows.length > 0) {
          return res.status(409).json({
            success: false,
            message: "Email already in use by another user",
          });
        }
      }

      updateFields.push(`user_email = $${paramIndex++}`);
      values.push(user_email);
    }

    if (user_password !== undefined) {
      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user_password, saltRounds);

      updateFields.push(`user_password = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (user_role !== undefined) {
      updateFields.push(`user_role = $${paramIndex++}`);
      values.push(user_role);
    }

    if (account_status !== undefined) {
      updateFields.push(`account_status = $${paramIndex++}`);
      values.push(account_status);
    }

    if (is_verified !== undefined) {
      updateFields.push(`is_verified = $${paramIndex++}`);
      values.push(is_verified);
    }

    // If no fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update provided",
      });
    }

    // Add user_id to values array
    values.push(id);

    // Build and execute the update query
    const query = `
      UPDATE public."users"
      SET ${updateFields.join(", ")}
      WHERE user_id = $${paramIndex}
      RETURNING user_id, user_name, user_email, user_role, account_status, is_verified, token_expires_at
    `;

    const result = await con.query(query, values);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// Delete user
// ...existing code...

// Replace the softDeleteUser function with this
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userCheck = await con.query(
      'SELECT * FROM public."users" WHERE user_id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Permanently delete user
    const query = `
      DELETE FROM public."users" 
      WHERE user_id = $1 
      RETURNING user_id
    `;

    const result = await con.query(query, [id]);

    res.status(200).json({
      success: true,
      message: "User permanently deleted",
      data: { user_id: result.rows[0].user_id },
    });
  } catch (error) {
    console.error("Error deleting user:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// New function to automatically clean up inactive users
export const cleanupInactiveUsers = async (req, res) => {
  try {
    // Delete users inactive for 30+ days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const query = `
      DELETE FROM public."users"
      WHERE (last_login_at < $1 OR last_login_at IS NULL)
      AND account_status = 'inactive'
      RETURNING user_id
    `;

    const result = await con.query(query, [thirtyDaysAgo]);
    const deletedCount = result.rows.length;

    // If this is an API endpoint
    if (res) {
      res.status(200).json({
        success: true,
        message: `${deletedCount} inactive users have been permanently deleted`,
        data: { deleted_count: deletedCount },
      });
    }

    return deletedCount;
  } catch (error) {
    console.error("Error cleaning up inactive users:", error.stack);

    // If this is an API endpoint
    if (res) {
      res.status(500).json({
        success: false,
        message: "Error cleaning up inactive users",
        error: error.message,
      });
    }

    throw error;
  }
};

// Get user by email
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const query = `
      SELECT 
        user_id, user_name, user_email, user_role, 
        account_status, is_verified, token_expires_at 
      FROM public."users" 
      WHERE user_email = $1
    `;

    const result = await con.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// Verify user account
export const verifyUser = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Check if token is valid and not expired
    const query = `
      UPDATE public."users" 
      SET is_verified = true 
      WHERE verification_token = $1 
        AND token_expires_at > NOW() 
        AND is_verified = false
      RETURNING user_id, user_name, user_email, is_verified
    `;

    const result = await con.query(query, [token]);

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    res.status(200).json({
      success: true,
      message: "Account verified successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      success: false,
      message: "Error verifying user",
      error: error.message,
    });
  }
};

// Add this to your UsersController.js file
export const createUserByAdmin = async (req, res) => {
  try {
    const {
      user_name,
      user_email,
      password,
      user_role,
      is_verified,
      account_status,
    } = req.body;

    // Validate required fields
    if (!user_name || !user_email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required fields",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Check if user already exists
    const checkUserQuery = `SELECT * FROM public."users" WHERE user_email = $1`;
    const checkUserResult = await con.query(checkUserQuery, [user_email]);

    if (checkUserResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set default values for optional fields
    const role = user_role || "user";
    const verified = is_verified || false;
    const status = account_status || "active";

    // Updated column name from "password" to "user_password"
    const insertQuery = `
      INSERT INTO public."users" 
        (user_name, user_email, user_password, user_role, is_verified, account_status) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_id, user_name, user_email, user_role, is_verified, account_status
    `;
    const values = [
      user_name,
      user_email,
      hashedPassword,
      role,
      verified,
      status,
    ];
    const result = await con.query(insertQuery, values);

    // Return success response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_name,
      user_email,
      password,
      user_role,
      is_verified,
      account_status,
    } = req.body;

    // Check if user exists
    const checkUserQuery = `SELECT * FROM public."users" WHERE user_id = $1`;
    const checkUserResult = await con.query(checkUserQuery, [id]);

    if (checkUserResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prepare update fields
    const updateFields = [];
    const values = [];
    let paramCounter = 1;

    if (user_name) {
      updateFields.push(`user_name = $${paramCounter}`);
      values.push(user_name);
      paramCounter++;
    }

    if (user_email) {
      // Check if email is already taken by another user
      if (user_email !== checkUserResult.rows[0].user_email) {
        const emailCheckQuery = `SELECT * FROM public."users" WHERE user_email = $1 AND user_id != $2`;
        const emailCheckResult = await con.query(emailCheckQuery, [
          user_email,
          id,
        ]);

        if (emailCheckResult.rows.length > 0) {
          return res.status(409).json({
            success: false,
            message: "Email is already in use by another user",
          });
        }
      }

      updateFields.push(`user_email = $${paramCounter}`);
      values.push(user_email);
      paramCounter++;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.push(`user_password = $${paramCounter}`);
      values.push(hashedPassword);
      paramCounter++;
    }

    if (user_role) {
      updateFields.push(`user_role = $${paramCounter}`);
      values.push(user_role);
      paramCounter++;
    }

    if (is_verified !== undefined) {
      updateFields.push(`is_verified = $${paramCounter}`);
      values.push(is_verified);
      paramCounter++;
    }

    if (account_status) {
      updateFields.push(`account_status = $${paramCounter}`);
      values.push(account_status);
      paramCounter++;
    }

    // If no fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update provided",
      });
    }

    // Add ID to values array for WHERE clause
    values.push(id);

    // Construct and execute update query
    const updateQuery = `
      UPDATE public."users" 
      SET ${updateFields.join(", ")}
      WHERE user_id = $${paramCounter}
      RETURNING user_id, user_name, user_email, user_role, is_verified, account_status
    `;

    const result = await con.query(updateQuery, values);

    // Return success response
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// Check this implementation in your UsersController.js
export const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userCheck = await con.query(
      'SELECT * FROM public."users" WHERE user_id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update the status to inactive
    const query = `
      UPDATE public."users" 
      SET account_status = 'inactive'
      WHERE user_id = $1 
      RETURNING user_id, user_name, user_email, account_status
    `;

    const result = await con.query(query, [id]);

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deactivating user:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error deactivating user",
      error: error.message,
    });
  }
};
