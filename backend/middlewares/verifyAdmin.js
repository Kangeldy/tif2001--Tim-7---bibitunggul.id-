const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Silakan login terlebih dahulu",
    });
  }

  const role = req.user.role || req.user.app_metadata?.role;
  const isEmailAdmin = req.user.email?.toLowerCase().includes("admin");

  if (role !== "admin" && !isEmailAdmin) {
    return res.status(403).json({
      success: false,
      message: "Endpoint ini hanya dapat diakses admin",
    });
  }

  next();
};

module.exports = verifyAdmin;