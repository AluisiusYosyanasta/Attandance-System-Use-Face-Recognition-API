import mongoose from "mongoose";
import { Schema } from "mongoose";

const presensiSchema = new mongoose.Schema({
  schedule: { type: Schema.Types.ObjectId, ref: "Schedule" },
  student: { type: Schema.Types.ObjectId, ref: "Student" },
  date: { type: Date, default: Date.now },
  time: { type: String },
  status: {
    type: String,
    enum: ["hadir", "sakit", "tidak hadir", "izin"],
    default: "tidak hadir",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Presensi = mongoose.model("Presensi", presensiSchema);
export default Presensi;
