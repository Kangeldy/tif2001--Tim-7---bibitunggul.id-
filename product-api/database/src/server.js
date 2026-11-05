require("dotenv").config();

const express = require("express");
const pool = require("./config/database");
const productRoutes = require("./routes/product.routes");
const {
  notFound,
  errorHandler
} = require("./middlewares/error.middleware");

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Middleware untuk membaca request JSON
app.use(express.json());

// Endpoint pemeriksaan sederhana
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running"
  });
});

// Route produk
app.use("/products", productRoutes);

// Middleware 404 harus setelah semua route
app.use(notFound);

// Middleware error harus paling akhir
app.use(errorHandler);

const startServer = async () => {
  try {
    // Memastikan database dapat diakses
    await pool.query("SELECT 1");

    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(`Products: http://localhost:${PORT}/products`);
    });
  } catch (error) {
    console.error("Gagal terhubung ke MySQL:", error.message);
    process.exit(1);
  }
};

startServer();
