import express from "express";
import cors from "cors";
import pool from "./db.js";
import colorsRouter from "./routes/colors.js";
import tokensRouter from "./routes/tokens.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/colors", colorsRouter);
app.use("/api/tokens", tokensRouter);

// Serve frontend build (single service mode)
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});