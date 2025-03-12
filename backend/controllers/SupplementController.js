import con from "../server.js";

export const getSupplementController = async (req, res) => {
  try {
    const query = 'SELECT * FROM public."supplement"';
    const result = await con.query(query);

    res.status(200).json({
      message: "Data fetched successfully!",
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

// New controller function to get supplement by ID
export const getSupplementByIdController = async (req, res) => {
  const { id } = req.params;

  // Validate that ID is provided and is a number
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      message: "Invalid supplement ID provided",
    });
  }

  try {
    const query = 'SELECT * FROM public."supplement" WHERE supplement_id = $1';
    const result = await con.query(query, [id]);

    // Check if any results were found
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Supplement not found",
      });
    }

    // Return the found supplement (first result)
    res.status(200).json({
      message: "Supplement fetched successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      message: "Error fetching supplement",
      error: error.message,
    });
  }
};
