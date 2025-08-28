import mongoose from "mongoose";
import { Schema } from "mongoose";
import Schedule from "./Schedule.js";
import Room from "./Room.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const guruSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  guruId: { type: String, required: true, unique: true },
  dob_city: { type: String },
  dob: { type: Date, default: null },
  gender: { type: String },
  title: { type: String },
  position: { type: String },
  staGuru: { type: String },
  subject: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
  edu_level: { type: String },
  createAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

guruSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const guruId = this._id;

      await Schedule.deleteMany({ guruId: guruId });

      await Room.updateMany({ guruId: guruId }, { $set: { guruId: null } });

      const guru = await this.model("Guru").findById(guruId).populate("userId");

      if (guru?.userId?.profileImage) {
        const imagePath = path.join(
          __dirname,
          "../public/uploads",
          guru.userId.profileImage
        );

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log("Foto profil dihapus:", imagePath);
        }
      }

      if (guru?.userId) {
        await guru.userId.deleteOne();
      }

      next();
    } catch (error) {
      next(error);
    }
  }
);

const Guru = mongoose.model("Guru", guruSchema);
export default Guru;
