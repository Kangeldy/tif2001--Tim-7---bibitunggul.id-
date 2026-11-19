
const productService = require("../services/productService");

const getProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const products = await productService.getAllProducts({ category, search });
    return res.status(200).json({ success: true, message: "Berhasil mengambil data produk", data: products });
  } catch (error) { next(error); }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    return res.status(200).json({ success: true, data: product });
  } catch (error) { next(error); }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, image_url } = req.body;
    if (!name || !price) return res.status(400).json({ success: false, message: "Nama dan harga wajib diisi" });
    const product = await productService.createProduct({ name, description, price, stock: stock || 0, category, image_url });
    return res.status(201).json({ success: true, message: "Produk berhasil ditambahkan", data: product });
  } catch (error) { next(error); }
};

const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, image_url } = req.body;
    const product = await productService.updateProduct(req.params.id, { name, description, price, stock, category, image_url });
    if (!product) return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    return res.status(200).json({ success: true, message: "Produk berhasil diperbarui", data: product });
  } catch (error) { next(error); }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    return res.status(200).json({ success: true, message: "Produk berhasil dihapus" });
  } catch (error) { next(error); }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };

