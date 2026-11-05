const pool = require("../config/database");

const getAllProducts = async () => {
  const sql = `
    SELECT id, name, price, stock, created_at
    FROM products
    ORDER BY id ASC
  `;

  const [rows] = await pool.execute(sql);

  return rows;
};

module.exports = {
  getAllProducts
};
