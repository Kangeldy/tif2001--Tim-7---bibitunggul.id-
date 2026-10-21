const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Silakan login terlebih dahulu",
    });
  }

  if (req.user.app_metadata?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Endpoint ini hanya dapat diakses admin",
    });
  }

  next();
};

module.exports = verifyAdmin;