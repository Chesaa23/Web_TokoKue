import { Router } from "express";
import { pool } from "../config/db.js";
import { requireUser } from "../middleware/auth.js";

const router = Router();

// Checkout
router.post("/checkout", requireUser, async (req, res) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const userId = req.currentUser.id;

    const [cart] = await conn.query(
      `SELECT c.*, p.price, p.stock 
       FROM carts c JOIN products p ON c.product_id=p.id
       WHERE c.user_id=?`,
      [userId]
    );

    if (cart.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: "Keranjang kosong" });
    }

    for (const item of cart) {
      if (item.quantity > item.stock) {
        await conn.rollback();
        conn.release();
        return res
          .status(400)
          .json({
            message: `Stok tidak cukup untuk produk ${item.product_id}`,
          });
      }
    }

    let total = 0;
    cart.forEach((i) => (total += i.price * i.quantity));

    const [orderRes] = await conn.query(
      "INSERT INTO orders (user_id,total_amount,status) VALUES (?,?,?)",
      [userId, total, "paid"]
    );

    const orderId = orderRes.insertId;

    for (const item of cart) {
      await conn.query(
        "INSERT INTO order_items (order_id,product_id,quantity,price) VALUES (?,?,?,?)",
        [orderId, item.product_id, item.quantity, item.price]
      );

      await conn.query("UPDATE products SET stock = stock - ? WHERE id=?", [
        item.quantity,
        item.product_id,
      ]);
    }

    await conn.query("DELETE FROM carts WHERE user_id=?", [userId]);

    await conn.commit();
    conn.release();

    res.json({ message: "Checkout berhasil", order_id: orderId });
  } catch (err) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
