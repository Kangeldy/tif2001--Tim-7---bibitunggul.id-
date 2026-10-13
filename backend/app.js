
const express = require("express");
const productRoutes = require("./routes/productRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API Bibit Tanaman berjalan"
    });
});

app.use("/api/products", productRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint tidak ditemukan"
    });
});

app.use(errorMiddleware);

module.exports = app;
