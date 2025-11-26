import { Router } from "express";
import { pool } from "../config/db.js";

const router = Router();

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Lengkapi data!" });

    const [exist] = await pool.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (exist.length > 0)
      return res.status(400).json({ message: "Email sudah dipakai" });

    const [result] = await pool.query(
      "INSERT INTO users (name,email,password,role) VALUES (?,?,?,'user')",
      [name, email, password]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      role: "user",
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// LOGIN USER & ADMIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT id,name,email,role FROM users WHERE email=? AND password=?",
      [email, password]
    );

    if (rows.length === 0)
      return res.status(401).json({ message: "Email atau password salah" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
