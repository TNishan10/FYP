import con from "../server.js";

export const getHealthConditionController = async (req, res) => {
  try {
    const query = 'SELECT * FROM public."health_condition"';
    const result = await con.query(query);
    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      message: "Error fetching data",
      error: error.message,
    });
  }
};

// Get health condition by ID
export const getHealthConditionByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const query =
      'SELECT * FROM public."health_condition" WHERE condition_id = $1';
    const result = await con.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Health condition not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      message: "Error fetching health condition",
      error: error.message,
    });
  }
};

// Create new health condition
export const createHealthConditionController = async (req, res) => {
  try {
    const { condition_name } = req.body;

    if (!condition_name) {
      return res.status(400).json({
        success: false,
        message: "Condition name is required",
      });
    }

    const query =
      'INSERT INTO public."health_condition" (condition_name) VALUES ($1) RETURNING *';
    const result = await con.query(query, [condition_name]);

    res.status(201).json({
      success: true,
      message: "Health condition created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      message: "Error creating health condition",
      error: error.message,
    });
  }
};

// Update health condition
export const updateHealthConditionController = async (req, res) => {
  try {
    const { id } = req.params;
    const { condition_name } = req.body;

    if (!condition_name) {
      return res.status(400).json({
        success: false,
        message: "Condition name is required",
      });
    }

    const query =
      'UPDATE public."health_condition" SET condition_name = $1 WHERE condition_id = $2 RETURNING *';
    const result = await con.query(query, [condition_name, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Health condition not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Health condition updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      message: "Error updating health condition",
      error: error.message,
    });
  }
};

// Delete health condition
export const deleteHealthConditionController = async (req, res) => {
  try {
    const { id } = req.params;

    const query =
      'DELETE FROM public."health_condition" WHERE condition_id = $1 RETURNING *';
    const result = await con.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Health condition not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Health condition deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      message: "Error deleting health condition",
      error: error.message,
    });
  }
};
