import con from "../server.js";

export const getPlanController = async (req, res) => {
  try {
    const query = 'SELECT * FROM public."plan"';
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

export const createPlanController = async (req, res) => {
  const {
    plan_name,
    plan_duration,
    plan_type,
    health_condition,
    working_days,
    permium,
    url,
    genders,
    age_group,
  } = req.body;

  try {
    const query = `
      INSERT INTO public."plan" (
        plan_name,
        plan_duration,
        plan_type,
        health_condition,
        working_days,
        permium,
        url,
        genders,
        age_group
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
    const values = [
      plan_name,
      plan_duration,
      plan_type,
      health_condition,
      working_days,
      permium,
      url,
      genders,
      age_group,
    ];
    const result = await con.query(query, values);
    res.status(201).json({
      message: "Plan created successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).json({
      message: "Error creating plan",
      error: error.message,
    });
  }
};
