const productModel = require("../models/product.model");

const getAllProducts = async (req, res, next) => {
  try {
    const products = await productModel.getAllProducts();

    return res.status(200).json({
      success: true,
      message: "Data produk berhasil diambil",
      total: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts
};
