const orderService = require("../services/orderService");

const createOrder = async (req, res, next) => {
  try {
    const orderData = req.body;
    
    // Jika user sedang login dengan token Supabase, gunakan email user jika customer.email kosong
    if (req.user && req.user.email && (!orderData.customer || !orderData.customer.email)) {
      orderData.customer = {
        ...(orderData.customer || {}),
        email: req.user.email,
        name: orderData.customer?.name || req.user.user_metadata?.name || req.user.email.split("@")[0]
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
    const orders = await orderService.getAllOrders({ email });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data pesanan dari Supabase",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
};
