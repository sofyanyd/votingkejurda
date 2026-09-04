import "dotenv/config";
import express from "express";
import cors from "cors";
import categoryRoute from "./routes/categoryRoute.js";
import speakerRoute from "./routes/speakerRoute.js";
import eventRoute from "./routes/eventRoute.js";    
import authRoute from "./routes/authRoute.js";
import voteRoute from "./routes/voteRoute.js";
import qrRoute from "./routes/qrRoute.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Backend berjalan");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", time: new Date().toISOString() });
});

app.use("/categories", categoryRoute);
app.use("/speakers", speakerRoute);  
app.use("/events", eventRoute);      
app.use("/auth", authRoute);
app.use("/votes", voteRoute);
app.use("/qrcodes", qrRoute);

// Global error handling middleware so uncaught route exceptions don't crash Express
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express Error Handler caught:", err);
  res.status(500).json({ message: "Server error", error: err?.message || String(err) });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} (0.0.0.0)`);
});