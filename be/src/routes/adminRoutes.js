import { Router } from "express";
import { pool } from "../config/db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/reports/sales", requireAdmin, async (req, res) => {
  const { from, to } = req.query;

  const [rows] = await pool.query(
    `SELECT DATE(created_at) as tanggal, SUM(total_amount) as total 
     FROM orders 
     WHERE created_at BETWEEN ? AND ? 
     GROUP BY DATE(created_at)`,
    [from, to]
  );

  res.json(rows);
});

export default router;
