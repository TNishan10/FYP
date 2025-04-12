import con from "../db/config.js";

// Get admin dashboard statistics
export const getAdminDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsersQuery = "SELECT COUNT(*) FROM users";
    const totalUsersResult = await con.query(totalUsersQuery);

    // Get active users count
    const activeUsersQuery =
      "SELECT COUNT(*) FROM users WHERE is_active = true";
    const activeUsersResult = await con.query(activeUsersQuery);

    // Get total plans count
    const totalPlansQuery = "SELECT COUNT(*) FROM plan";
    const totalPlansResult = await con.query(totalPlansQuery);

    // Get total supplements count
    const totalSupplementsQuery = "SELECT COUNT(*) FROM supplement";
    const totalSupplementsResult = await con.query(totalSupplementsQuery);

    res.status(200).json({
      success: true,
      data: {
        totalUsers: parseInt(totalUsersResult.rows[0].count),
        activeUsers: parseInt(activeUsersResult.rows[0].count),
        totalPlans: parseInt(totalPlansResult.rows[0].count),
        totalSupplements: parseInt(totalSupplementsResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error("Error getting admin stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin statistics",
      error: error.message,
    });
  }
};

// Get user registration stats for chart
export const getUserRegistrationStats = async (req, res) => {
  try {
    // Get user registrations by date (last 30 days)
    const query = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') AS date, 
        COUNT(*) as count 
      FROM 
        users 
      WHERE 
        created_at >= NOW() - INTERVAL '30 days' 
      GROUP BY 
        date 
      ORDER BY 
        date ASC
    `;

    const result = await con.query(query);

    // Prepare data for the chart
    const dates = result.rows.map((row) => row.date);
    const counts = result.rows.map((row) => parseInt(row.count));

    res.status(200).json({
      success: true,
      data: {
        dates,
        counts,
      },
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
};

