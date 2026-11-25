const productService = require("../services/productService");

const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      q,
      minPrice,
      maxPrice,
      inStock,
      sortBy,
      sortOrder,
      page,
      limit,
      offset,
    } = req.query;

    const result = await productService.getAllProducts({
      category,
      search,
      q,
      minPrice,
      maxPrice,
      inStock,
      sortBy,
      sortOrder,
      page,
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data produk",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, image_url } = req.body;
    if (!name || !String(name).trim() || price === undefined || price === null || price === "") {
      return res.status(400).json({ success: false, message: "Nama dan harga wajib diisi" });
    }

    const numericPrice = Number(price);
    const numericStock = stock === undefined || stock === "" ? 0 : Number(stock);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ success: false, message: "Harga harus berupa angka valid (>= 0)" });
    }
    if (Number.isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({ success: false, message: "Stok harus berupa angka valid (>= 0)" });
    }

    const product = await productService.createProduct({
      name: String(name).trim(),
      description,
      price: numericPrice,
      stock: numericStock,
      category,
      image_url,
    });

    return res.status(201).json({
      success: true,
      message: "Produk berhasil ditambahkan",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, image_url } = req.body;

    if (price !== undefined && (Number.isNaN(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({ success: false, message: "Harga harus berupa angka valid (>= 0)" });
    }
    if (stock !== undefined && (Number.isNaN(Number(stock)) || Number(stock) < 0)) {
      return res.status(400).json({ success: false, message: "Stok harus berupa angka valid (>= 0)" });
    }

    const payload = {
      name: name !== undefined ? String(name).trim() : undefined,
      description,
      price: price !== undefined ? Number(price) : undefined,
      stock: stock !== undefined ? Number(stock) : undefined,
      category,
      image_url,
    };

    const hasUpdates = Object.values(payload).some((v) => v !== undefined);
    if (!hasUpdates) {
      return res.status(400).json({ success: false, message: "Tidak ada data yang diperbarui" });
    }

    const product = await productService.updateProduct(req.params.id, payload);
    if (!product) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      message: "Produk berhasil diperbarui",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await productService.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }
    return res.status(200).json({
      success: true,
      message: "Produk berhasil dihapus",
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
