import JWT from "jsonwebtoken";

export const requireSignIn = async (req, res, next) => {
  try {
    // Get token from various sources
    const token =
      req.cookies.token ||
      req.headers.authorization?.split(" ")[1] ||
      req.headers["x-access-token"];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    // Verify token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    // Add user data to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Invalid or expired token.",
    });
  }
};

// Middleware to check if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    const { user_id } = req.user;

    // Query to check user role
    const query = "SELECT role FROM users WHERE user_id = $1";
    const result = await con.query(query, [user_id]);

    if (!result.rows.length || result.rows[0].role !== "admin") {
      return res.status(401).send({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Error in admin middleware",
    });
  }
};
