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


app.use("/categories", categoryRoute);
app.use("/speakers", speakerRoute);  
app.use("/events", eventRoute);      
app.use("/auth", authRoute);
app.use("/votes", voteRoute);
app.use("/qrcodes", qrRoute);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running di port ${PORT} on 0.0.0.0`);
});