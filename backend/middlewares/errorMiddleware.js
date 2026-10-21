function errorMiddleware(err, req, res, next) {
  console.error(err.message);

  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server"
  });
}

module.exports = errorMiddleware;