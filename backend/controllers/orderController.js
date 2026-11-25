const orderService = require("../services/orderService");

const createOrder = async (req, res, next) => {
  try {
    const orderData = req.body;

    if (req.user && req.user.email && (!orderData.customer || !orderData.customer.email)) {
      orderData.customer = {
        ...(orderData.customer || {}),
        email: req.user.email,
        name: orderData.customer?.name || req.user.user_metadata?.name || req.user.email.split("@")[0],
      };
    }

    const created = await orderService.createOrder(orderData);

    return res.status(201).json({
      success: true,
      message: "Pesanan berhasil dibuat dan tersimpan di database Supabase",
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const email = req.query.email || (req.user ? req.user.email : null);
    const { status, search, page, limit, offset } = req.query;

    const result = await orderService.getAllOrders({
      email,
      status,
      search,
      page,
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data pesanan dari Supabase",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { status, payment_method, paymentMethod } = req.body;
    const payload = {
      status,
      payment_method: payment_method ?? paymentMethod,
    };

    const hasUpdates = Object.values(payload).some((v) => v !== undefined);
    if (!hasUpdates) {
      return res.status(400).json({ success: false, message: "Tidak ada data yang diperbarui" });
    }

    const order = await orderService.updateOrder(req.params.id, payload);
    if (!order) {
      return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      message: "Pesanan berhasil diperbarui",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const deleted = await orderService.deleteOrder(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      message: "Pesanan berhasil dihapus",
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
