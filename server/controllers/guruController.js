import multer from "multer";
import Guru from "../models/Guru.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import { generateGuruId } from "./generateGuruId.js";
import Room from "../models/Room.js";
import { fileURLToPath } from "url";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const addGuru = async (req, res) => {
  try {
    const {
      name,
      email,
      dob_city,
      dob,
      gender,
      title,
      position,
      staGuru,
      subject,
      password,
      role,
      edu_level,
    } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, error: "Email Sudah Terdaftar" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role,
      profileImage: req.file ? req.file.filename : "",
    });
    const savedUser = await newUser.save();

    const guruId = await generateGuruId(role);

    let subjectArray = [];
    if (subject) {
      subjectArray = Array.isArray(subject) ? subject : [subject];
    }

    const newGuru = new Guru({
      userId: savedUser._id,
      guruId,
      dob_city,
      dob,
      gender,
      title,
      position,
      staGuru,
      edu_level,
      subject: subjectArray,
    });

    await newGuru.save();

    return res.status(200).json({ success: true, message: "Guru Ditambahkan" });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, error: "server error in adding guru" });
  }
};

const getGurus = async (req, res) => {
  try {
    const gurus = await Guru.find()
      .populate({ path: "userId", select: "name profileImage email role" })
      .populate("subject");

    const enrichedGurus = await Promise.all(
      gurus.map(async (guru) => {
        const rooms = await Room.find(
          { guruId: guru._id },
          "room_name edu_level"
        );
        return {
          ...guru.toObject(),
          rooms,
        };
      })
    );

    return res.status(200).json({ success: true, gurus: enrichedGurus });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "get guru server error" });
  }
};

const getGuru = async (req, res) => {
  const { id } = req.params;

  try {
    let guru = await Guru.findById(id)
      .populate({ path: "userId", select: "name profileImage email role" })
      .populate({ path: "subject", select: "sub_name" });

    if (!guru) {
      guru = await Guru.findOne({ userId: id })
        .populate({ path: "userId", select: "name profileImage email role" })
        .populate({ path: "subject", select: "sub_name" });

      if (!guru) {
        return res
          .status(404)
          .json({ success: false, error: "Guru tidak ditemukan" });
      }
    }

    const rooms = await Room.find({ guruId: guru._id }, "room_name edu_level");

    return res.status(200).json({
      success: true,
      guru: {
        ...guru.toObject(),
        rooms,
      },
    });
  } catch (error) {
    console.error("getGuru error:", error);
    return res
      .status(500)
      .json({ success: false, error: "get guru server error" });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const updateGuru = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      password,
      role,
      title,
      position,
      subject,
      gender,
      dob,
      dob_city,
      staGuru,
      edu_level,
    } = req.body;

    const guru = await Guru.findById(id);
    if (!guru) {
      return res
        .status(404)
        .json({ success: false, error: "Guru tidak ditemukan" });
    }

    const user = await User.findById(guru.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User tidak ditemukan" });
    }

    const updateUserData = {
      name,
      email,
      role,
    };

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateUserData.password = hashedPassword;
    }

    if (req.file) {
      if (user.profileImage) {
        const oldImagePath = path.join(
          __dirname,
          "../public/uploads",
          user.profileImage
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("Foto lama dihapus:", oldImagePath);
        } else {
          console.log("File lama tidak ditemukan:", oldImagePath);
        }
      }

      updateUserData.profileImage = req.file.filename;
    }

    await User.findByIdAndUpdate(user._id, updateUserData);

    const updateGuruData = {
      title,
      position,
      subject,
      gender,
      dob: dob === "null" || dob === "" ? null : dob,
      dob_city,
      staGuru,
      edu_level,
    };

    await Guru.findByIdAndUpdate(id, updateGuruData);

    return res
      .status(200)
      .json({ success: true, message: "Guru updated successfully" });
  } catch (error) {
    console.error("Update Guru Error:", error);
    return res.status(500).json({
      success: false,
      error: "Update guru server error",
    });
  }
};

const deleteGuru = async (req, res) => {
  try {
    const { id } = req.params;

    const guru = await Guru.findById(id);
    if (!guru) {
      return res
        .status(404)
        .json({ success: false, error: "Guru tidak ditemukan" });
    }

    await guru.deleteOne();

    return res
      .status(200)
      .json({ success: true, message: "Guru berhasil dihapus" });
  } catch (error) {
    console.error("Delete Guru Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error saat menghapus guru" });
  }
};

const getGuruBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const gurus = await Guru.find({ subject: subjectId }).populate("userId");
    res.status(200).json({ success: true, gurus });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengambil guru" });
  }
};

export {
  addGuru,
  upload,
  getGurus,
  getGuru,
  updateGuru,
  deleteGuru,
  getGuruBySubject,
};
