// src/index.ts
import "dotenv/config";
import express from "express";
import authRouter from "./routes/authRoute";
import videoRouter from "./routes/videoRoute";
import adminRouter from "./routes/adminRoute";
import connection from "./connection";
import "./controllers/commanController/passportConfig.ts";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import  CookieParser from "cookie-parser";
import './controllers/commanController/passportConfig'
import cron from "node-cron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from 'node:http';
import initializeSocket from "../src/utils/socket.io"

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5000;
const io = initializeSocket(server);

app.use(cors(
  {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }
));
app.use(CookieParser())
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});
// 1. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// cron.schedule("*/10 * * * * *", async () => {
//   try {
//     const directoryPath = path.join(__dirname, "..", "uploads");
//     console.log("Running cron job to delete files older than 7 days...", directoryPath);

//     if (fs.existsSync(directoryPath)) {
//     const files = fs.readdirSync(directoryPath);

//     }
//   } catch (error) {
//     console.error("Error during cron job execution:", error);
//   }
// })
// 3. express-session (loads req.session)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

// 4. Passport init & session (relies on req.session)
app.use(passport.initialize());
app.use(passport.session());

// 5. Your routers
app.use("/api/auth", authRouter);
app.use("/api/video", videoRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
})

connection().catch((error) => {
  console.error("Database connection failed:", error);
});
process.on("uncaughtException", (err) => {
  console.error("There was an uncaught error:", err);
  process.exit(1);
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});
try {
  server.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("App crashed:", error);
}
