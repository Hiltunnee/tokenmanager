import express from "express";
import pool from "../db.js";

const router = express.Router();

// Hae kaikki värit
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM colors");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// Lisää väri
router.post("/", async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO colors (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

//Poistetaan väri
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM colors WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "Deleted", data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// Muokataan värejä
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const result = await pool.query(
      "UPDATE colors SET name = $2 WHERE id = $1;",
      [id, name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

export default router;