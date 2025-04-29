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
import authMiddleware from "./middleware/authMiddleware";

const app = express();

const PORT = process.env.PORT || 5000;

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
app.use("/api/video", authMiddleware, videoRouter);
app.use("/api/admin", authMiddleware, adminRouter);

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
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("App crashed:", error);
}
