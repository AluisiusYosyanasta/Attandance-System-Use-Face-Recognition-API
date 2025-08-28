import mongoose from "mongoose";
import { Schema } from "mongoose";

const scheduleSchema = new Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  room_cls: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  day: { type: String },
  startTime: { type: String },
  endTime: { type: String },
  guruId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guru",
  },
  isExam: {
    type: Boolean,
    default: false,
  },
  examType: {
    type: String,
    enum: ["UTS", "UAS", ""],
    default: "",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;
