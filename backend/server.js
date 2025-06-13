import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/route.js";
import db from "./config/database.js";

const app = express();
const PORT = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: 'https://fe-040-dot-b-02-451105.uc.r.appspot.com',
  credentials: true
}));
app.use(express.json());
app.use(router);
app.use(express.static(path.join(__dirname, "../frontend"))); 

// Cek koneksi database
(async () => {
    try {
        await db.authenticate();
        console.log("Database connected");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
})();

// Default route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
