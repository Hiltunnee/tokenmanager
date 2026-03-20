import express from "express";
import cors from "cors";
import pool from "./db.js";
import colorsRouter from "./routes/colors.js";
import tokensRouter from "./routes/tokens.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/colors", colorsRouter);
app.use("/api/tokens", tokensRouter);

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from back!" });
});

app.get("/api/test", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows[0]);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});