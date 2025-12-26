import express from "express";
import cors from "cors";
import "./firebaseAdmin.js";
import dotenv from "dotenv";
import usersRoute from "./routes/auth.js";
import schoolRoute from "./routes/school.js";
import pharmacyRoute from "./routes/pharmacy.js";
import inventoryRoute from "./routes/inventory.js";
import officeRoute from "./routes/office.js";
import adminRoute from "./routes/admin.js";

dotenv.config();

const app = express();

// Body Parser MUST come first - before any middleware that accesses req.body
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Sanitization Middleware - now that body is parsed
app.use((req, res, next) => {
  // Sanitize request to prevent NoSQL injection
  if (typeof req.body === "object") {
    req.body = JSON.parse(JSON.stringify(req.body));
  }
  next();
});

// CORS Configuration - Strict
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-auth-token", "Authorization"],
    maxAge: 86400, // 24 hours
  })
);

// Security Middleware
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import rateLimit from "express-rate-limit";

// Set security HTTP headers with strict configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "data:"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" }, // Prevent clickjacking
    noSniff: true, // Prevent MIME sniffing
    xssFilter: true, // Enable XSS filter
  })
);

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Rate Limiting - General API
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict Rate Limiting for Login/Register (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

app.use("/api", limiter);
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);
app.use("/api/forgot-password", authLimiter);

// Routes
app.use("/api", usersRoute);
app.use("/api/school", schoolRoute);
app.use("/api/pharmacy", pharmacyRoute);
app.use("/api/inventory", inventoryRoute);
app.use("/api/office", officeRoute);
app.use("/api/admin", adminRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

app.get("/", (req, res) => {
  res.send("Inshaa Allah this is my first biggest system that will heat me up");
});
