import express from "express";
import pool from "../db.js";

const router = express.Router();

// Hae kaikki tokenit
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT tokens.id AS id, text, colors1.name AS base_color, colors2.name AS border_color, amount FROM tokens INNER JOIN colors colors1 ON tokens.base_id = colors1.id INNER JOIN colors colors2 ON tokens.border_id = colors2.id;");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// Lisää tokeni
router.post("/", async (req, res) => {
  const { text, base_color, border_color, amount } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO tokens (text, base_id, border_id, amount) SELECT $1, cb.id, cr.id, $4 FROM colors cb, colors cr WHERE cb.name = $2 AND cr.name = $3 RETURNING id;",
      [text, base_color, border_color, amount]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// Päivitetään teksti, värit ja määrä muokatuille tokeneille
router.put("/", async (req, res) => {
  const tokens = req.body; // Odotetaan array [{ id, text, base_color, border_color, amount }, ...]
  
  if (!Array.isArray(tokens)) {
    return res.status(400).json({ error: "Body must be an array of tokens" });
  }

  try {
    const updatePromises = tokens.map(token => {
      const { id, text, base_color, border_color, amount } = token;
      return pool.query(
        "UPDATE tokens t SET text = $2, base_id = cb.id, border_id = cr.id, amount = $5 FROM colors cb, colors cr WHERE t.id = $1 AND cb.name = $3 AND cr.name = $4 RETURNING t.id, t.text, t.amount, cb.name AS base_color, cr.name AS border_color;",
        [id, text, base_color, border_color, amount]
      );
    });

    const results = await Promise.all(updatePromises);
    res.json(results.map(result => result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// Päivitetään teksti ja värit
// router.put("/:id", async (req, res) => {
//   const { id } = req.params;
//   const { text, base_color, border_color } = req.body;

//   try {
//     const result = await pool.query(
//       "UPDATE tokens t SET text = $2, base_id = cb.id, border_id = cr.id, FROM colors cb, colors cr WHERE t.id = $1 AND cb.name = $3 AND cr.name = $4;",
//       [id, text, base_color, border_color]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Not found" });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "DB error" });
//   }
// });

// Päivitetään määrä
// router.patch("/:id", async (req, res) => {
//   const { id } = req.params;
//   const { amount } = req.body;

//   try {
//     const result = await pool.query(
//       "UPDATE tokens SET amount = $2 WHERE id = $1 RETURNING *;",
//       [id, amount]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Not found" });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "DB error" });
//   }
// });

//Poistetaan tokeni
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM tokens WHERE id = $1 RETURNING *;",
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

export default router;