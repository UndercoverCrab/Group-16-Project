import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", ""); // Extract token from Authorization header

  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied, no token provided" });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || "your_jwt_secret_key"
    );

    // Log the decoded token to verify its contents
    console.log("Decoded JWT:", decoded);

    // Attach the decoded user data to the request
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

export default verifyToken;
