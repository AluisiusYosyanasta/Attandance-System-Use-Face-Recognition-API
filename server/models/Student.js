import mongoose from "mongoose";
import { Schema } from "mongoose";

const studentSchema = new Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  nik: { type: String },
  name: { type: String },
  gender: { type: String },
  dob: { type: String },
  religion: { type: String },
  address: { type: String },
  parentStd: { type: String },
  parentJob: { type: String },
  faceEnrolled: { type: Boolean, default: false },
  faceImagePath: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Student = mongoose.model("Student", studentSchema);
export default Student;
