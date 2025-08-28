import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectToDatabase from "./db/db.js";
import authRouter from "./routes/auth.js";
import subjectRouter from "./routes/subject.js";
import roomRouter from "./routes/room.js";
import guruRouter from "./routes/guru.js";
import scheduleRouter from "./routes/schedule.js";
import settingRouter from "./routes/setting.js";
import dashboardRouter from "./routes/dashboard.js";
import presensiRouter from "./routes/presensi.js";
import studentRouter from "./routes/student.js";
import reportRouter from "./routes/report.js";
import path from "path";

await connectToDatabase();

const app = express();

app.use(
  cors()
  //   {
  //   origin: process.env.FRONTEND_URL || "*",
  //   credentials: true,
  // }
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json());
const __dirname = path.resolve();

app.use(express.static("public/uploads"));
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use("/api/auth", authRouter);
app.use("/api/subject", subjectRouter);
app.use("/api/room", roomRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/guru", guruRouter);
app.use("/api/setting", settingRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/presensi", presensiRouter);
app.use("/api/student", studentRouter);
app.use("/api/report", reportRouter);

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Server Jalan di Port ${process.env.PORT}`);
});
