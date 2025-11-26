import { Router } from "express";
import { pool } from "../config/db.js";
import { upload } from "../middleware/upload.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET semua produk
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("GET /products error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET detail produk
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /products/:id error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ADMIN: tambah produk
router.post(
  "/admin",
  upload.single("image"), // FormData diparse dulu
  requireAdmin, // lalu cek user_id di req.body
  async (req, res) => {
    try {
      const { name, description, price, stock } = req.body;

      if (!name || !price || stock === undefined) {
        return res
          .status(400)
          .json({ message: "name, price, dan stock wajib diisi" });
      }

      const image_url = req.file ? "/uploads/" + req.file.filename : null;

      const [result] = await pool.query(
        "INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)",
        [name, description || null, price, stock, image_url]
      );

      res.status(201).json({
        id: result.insertId,
        name,
        description,
        price,
        stock,
        image_url,
      });
    } catch (err) {
      console.error("POST /products/admin error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ADMIN: update produk
router.put(
  "/admin/:id",
  upload.single("image"),
  requireAdmin,
  async (req, res) => {
    try {
      const { name, description, price, stock } = req.body;
      const id = req.params.id;

      const [oldRows] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [id]
      );

      if (oldRows.length === 0) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }

      let image_url = oldRows[0].image_url;
      if (req.file) {
        image_url = "/uploads/" + req.file.filename;
      }

      await pool.query(
        "UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ? WHERE id = ?",
        [name, description || null, price, stock, image_url, id]
      );

      res.json({ message: "Produk berhasil diupdate" });
    } catch (err) {
      console.error("PUT /products/admin/:id error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.delete("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // coba hapus
    await pool.query("DELETE FROM products WHERE id = ?", [id]);

    return res.json({ message: "Produk dihapus" });
  } catch (err) {
    console.error("DELETE /products/admin/:id error:", err);

    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.errno === 1451) {
      return res.status(400).json({
        message:
          "Produk ini sudah pernah dipakai di transaksi (order), jadi tidak bisa dihapus.",
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
