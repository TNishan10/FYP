import con from "../server";

export const UserPlanController = async (req, res) => {
  try {
    const query = 'SELECT * FROM public."user_plan"';
    const result = await con.query(query); // Execute the query using the connection `con`
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
