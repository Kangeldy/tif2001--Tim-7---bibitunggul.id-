
const productService = require("../services/productService");

const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data produk",
      data: products,
    });
  } catch (error) {
    console.error("Gagal mengambil produk:", error.message);
    next(error);
  }
};

module.exports = {
  getProducts,
};

