const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const http = require("http");
const { execSync } = require("child_process");
const app = express();
const connectDB = require("./config/db");

const userRoutes = require("./Routes/userRoutes");
const productRoutes = require("./Routes/productRoutes");
const orderRoutes = require("./Routes/orderRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const adminOrderRoutes = require("./Routes/adminOrderRoutes");
const cartRoutes = require("./Routes/cartRoutes");
const checkoutRoutes = require("./Routes/checkoutRoutes");
const uploadRoutes = require("./Routes/uploadRoutes");

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

app.use(express.json());
app.use(cors());

const PORT = parseInt(process.env.PORT, 10) || 9000;

connectDB();

app.get("/", (req, res) => {
  res.send("WELCOME TO RABBIT API!");
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/upload", uploadRoutes);

function freePort(port) {
  if (process.platform !== "win32") return;

  try {

    execSync(
      `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { if ($_.OwningProcess -ne $PID) { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"`
    );
  } catch (_) {}

  try {
    const output = execSync(`netstat -ano | findstr :${port}`).toString();
    const lines = output.trim().split("\n");
    const killedPids = new Set();

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const localAddress = parts[1];
        if (localAddress.endsWith(`:${port}`)) {
          const pid = parseInt(parts[parts.length - 1], 10);
          if (pid && pid !== process.pid && !killedPids.has(pid)) {
            killedPids.add(pid);
            try {
              execSync(`taskkill /F /T /PID ${pid}`);
            } catch (_) {}
          }
        }
      }
    }
  } catch (_) {}
}

freePort(PORT);

const server = http.createServer(app);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.warn(`[Port ${PORT} in use] Releasing port ${PORT} and retrying...`);
    freePort(PORT);

    setTimeout(() => {
      server.close();
      server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    }, 1200);
  } else {
    console.error("Server error:", err);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const handleShutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
process.once("SIGUSR2", () => {
  server.close(() => {
    process.kill(process.pid, "SIGUSR2");
  });
});

module.exports = app;