import mongoose from "mongoose";
import { Schema } from "mongoose";
import Student from "./Student.js";
import Schedule from "./Schedule.js";

const roomSchema = new mongoose.Schema({
  room_name: { type: String, required: true },
  edu_level: { type: String },
  guruId: {
    type: Schema.Types.ObjectId,
    ref: "Guru",
    required: false,
    default: null,
  },
  startDate: { type: Date },
  endDate: { type: Date },
  school_year: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

roomSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const roomId = this._id;

      await Student.deleteMany({ roomId: roomId });
      await Schedule.deleteMany({ room_cls: roomId });

      next();
    } catch (error) {
      next(error);
    }
  }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;
