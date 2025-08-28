import mongoose from "mongoose";
import Schedule from "./Schedule.js";
import Guru from "./Guru.js";

const subjectSchema = new mongoose.Schema({
  sub_code: { type: String, required: true },
  sub_name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

subjectSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const subjectId = this._id;

      await Schedule.deleteMany({ subject: subjectId });

      await Guru.updateMany(
        { subject: subjectId },
        { $pull: { subject: subjectId } }
      );

      next();
    } catch (error) {
      next(error);
    }
  }
);

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;
