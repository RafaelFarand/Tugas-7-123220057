import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/route.js";
import db from "./config/database.js";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORS config yang benar:
const allowedOrigins = [
  "https://febagastugas7-dot-b-01-450713.uc.r.appspot.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization"
}));

// ✅ Pastikan OPTIONS dijawab
app.options("*", cors());

// Body parser
app.use(express.json());

// Router
app.use(router);

// Serve static
app.use(express.static(path.join(__dirname, "../frontend")));

// DB check
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

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
