const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan"
  });
};

const errorHandler = (err, req, res, next) => {
  console.error("API Error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server"
  });
};

module.exports = {
  notFound,
  errorHandler
};
