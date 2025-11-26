import { pool } from "../config/db.js";

// Cek user biasa
export const requireUser = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.query.user_id;

    if (!userId) return res.status(400).json({ message: "user_id diperlukan" });

    const [rows] = await pool.query("SELECT id, role FROM users WHERE id = ?", [
      userId,
    ]);

    if (rows.length === 0)
      return res.status(401).json({ message: "User tidak ditemukan" });

    if (rows[0].role !== "user")
      return res.status(403).json({ message: "Hanya user yang diizinkan" });

    req.currentUser = rows[0];
    next();
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Cek admin
export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.query.user_id;

    if (!userId) return res.status(400).json({ message: "user_id diperlukan" });

    const [rows] = await pool.query("SELECT id, role FROM users WHERE id = ?", [
      userId,
    ]);

    if (rows.length === 0)
      return res.status(401).json({ message: "User tidak ditemukan" });

    if (rows[0].role !== "admin")
      return res.status(403).json({ message: "Hanya admin yang diizinkan" });

    req.currentUser = rows[0];
    next();
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
