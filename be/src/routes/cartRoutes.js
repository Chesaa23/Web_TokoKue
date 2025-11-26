import { Router } from "express";
import { pool } from "../config/db.js";
import { requireUser } from "../middleware/auth.js";

const router = Router();

// GET cart user
router.get("/", requireUser, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id,c.product_id,c.quantity,p.name,p.price,p.stock,p.image_url
     FROM carts c JOIN products p ON c.product_id=p.id
     WHERE c.user_id=?`,
    [req.currentUser.id]
  );
  res.json(rows);
});

// Tambah ke cart
router.post("/", requireUser, async (req, res) => {
  const { product_id, quantity } = req.body;

  const [prod] = await pool.query("SELECT * FROM products WHERE id=?", [
    product_id,
  ]);

  if (prod.length === 0)
    return res.status(404).json({ message: "Produk tidak ditemukan" });

  if (prod[0].stock <= 0)
    return res.status(400).json({ message: "Stok habis" });

  const [exist] = await pool.query(
    "SELECT * FROM carts WHERE user_id=? AND product_id=?",
    [req.currentUser.id, product_id]
  );

  if (exist.length > 0) {
    const newQty = exist[0].quantity + quantity;
    if (newQty > prod[0].stock)
      return res.status(400).json({ message: "Jumlah melebihi stok" });

    await pool.query("UPDATE carts SET quantity=? WHERE id=?", [
      newQty,
      exist[0].id,
    ]);
  } else {
    await pool.query(
      "INSERT INTO carts (user_id,product_id,quantity) VALUES (?,?,?)",
      [req.currentUser.id, product_id, quantity]
    );
  }

  res.json({ message: "Ditambahkan ke keranjang" });
});

// Update quantity
router.put("/:id", requireUser, async (req, res) => {
  const { quantity } = req.body;

  const [rows] = await pool.query(
    `SELECT c.*, p.stock FROM carts c JOIN products p ON c.product_id=p.id 
     WHERE c.id=? AND c.user_id=?`,
    [req.params.id, req.currentUser.id]
  );

  if (rows.length === 0)
    return res.status(404).json({ message: "Item tidak ditemukan" });

  if (quantity > rows[0].stock)
    return res.status(400).json({ message: "Melebihi stok" });

  await pool.query("UPDATE carts SET quantity=? WHERE id=?", [
    quantity,
    req.params.id,
  ]);

  res.json({ message: "Diperbarui" });
});

// Hapus item
router.delete("/:id", requireUser, async (req, res) => {
  await pool.query("DELETE FROM carts WHERE id=? AND user_id=?", [
    req.params.id,
    req.currentUser.id,
  ]);

  res.json({ message: "Dihapus" });
});

export default router;
