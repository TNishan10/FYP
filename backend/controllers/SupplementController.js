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

// Add this function to your existing controller file

export const createSupplementController = async (req, res) => {
  const {
    name, // Will map to supplement_name
    company,
    description,
    tips,
    energy,
    protein,
    carbs,
    fat,
    image_url,
  } = req.body;

  // Validate required fields
  if (!name || !description || !company) {
    return res.status(400).json({
      success: false,
      message: "Supplement name, description, and company are required fields",
    });
  }

  try {
    // Prepare query with parameterized values - using CORRECT column names from database
    const query = `
      INSERT INTO public."supplement" 
      (supplement_name, company, description, tips, energy, protein, carbs, fat, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    // Values array for parameterized query
    const values = [
      name,
      company,
      description,
      tips || "",
      energy || "0 kcal",
      protein || "0g",
      carbs || "0g",
      fat || "0g",
      image_url || "",
    ];

    // Execute the query
    const result = await con.query(query, values);

    // Return the newly created supplement
    res.status(201).json({
      success: true,
      message: "Supplement created successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating supplement:", error);
    res.status(500).json({
      success: false,
      message: "Error creating supplement",
      error: error.message,
    });
  }
};
