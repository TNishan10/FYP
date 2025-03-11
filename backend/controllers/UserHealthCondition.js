import con from "../server.js";

export const UserHealthCondition = async (req, res) => {
  try {
    const query = 'SELECT * FROM public."HealthConditions"';
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
