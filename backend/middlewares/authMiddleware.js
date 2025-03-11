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

// Optional: Check if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
    next();
  } catch (error) {
    console.error("Admin Check Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
