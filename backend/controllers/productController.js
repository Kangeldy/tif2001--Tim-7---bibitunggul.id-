const productService = require("../services/productService");

async function getAllProducts(req, res, next) {
  try {
    const products = await productService.getAllProducts();

    res.status(200).json({
      success: true,
      message: "Data produk berhasil diambil",
      data: products
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllProducts };