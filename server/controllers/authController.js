import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateGuruId } from "./generateGuruId.js";
import Guru from "../models/Guru.js";
import Room from "../models/Room.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User tidak ditemukan" });
    }

    // Bandingkan password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(405)
        .json({ success: false, error: "Kata Sandi Salah!" });
    }

    // Buat token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "10d" }
    );
    let guru = await Guru.findOne({ userId: user._id }).populate(
      "subject",
      "subject_name"
    );

    if (!guru) {
      guru = null;
    }

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        profileImage: user.profileImage || null,
      },
      guru,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const register = async (req, res) => {
  try {
    const { Email, UserName, Password, Role } = req.body;

    if (!Email || !UserName || !Password || !Role) {
      return res.status(400).json({ message: "Silahkan Isi Semua Kolom." });
    }

    const existingUser = await User.findOne({ email: Email });
    if (existingUser) {
      return res.status(409).json({ message: "Email Sudah Terdaftar!." });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{5,}$/;
    if (!passwordRegex.test(Password)) {
      return res.status(400).json({
        message:
          "Kata sandi harus mengandung huruf besar, huruf kecil, angka, simbol, dan minimal 5 karakter.",
      });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const newUser = new User({
      email: Email,
      name: UserName,
      password: hashedPassword,
      role: Role,
    });

    const savedUser = await newUser.save();

    if (Role === "guru") {
      const generatedGuruId = await generateGuruId(Role);

      const newGuru = new Guru({
        userId: savedUser._id,
        guruId: generatedGuruId,
        dob: null,
        gender: "",
        title: "",
        position: "",
        staGuru: "",
        subject: [],
      });

      await newGuru.save();
    }

    return res.status(201).json({ message: "Pengguna berhasil terdaftar." });
  } catch (error) {
    console.error("Register error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const forgotPass = async (req, res) => {
  try {
    const { ForgotEmail } = req.body;

    if (!ForgotEmail) {
      return res.status(400).json({ message: "Email diperlukan." });
    }

    const user = await User.findOne({ email: ForgotEmail });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Email tidak ditemukan di Sistem!" });
    }

    return res
      .status(200)
      .json({ message: "Email ditemukan, lanjutkan untuk mengatur ulang." });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
};

const resetPass = async (req, res) => {
  try {
    const { email, NewPassword } = req.body;

    if (!email || !NewPassword) {
      return res
        .status(400)
        .json({ message: "Email and new password are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with that email." });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{5,}$/;
    if (!passwordRegex.test(NewPassword)) {
      return res.status(400).json({
        message:
          "Password must contain uppercase, lowercase, number, symbol, and be at least 5 characters.",
      });
    }
    const hashed = await bcrypt.hash(NewPassword, 10);
    user.password = hashed;
    await user.save();

    return res.status(200).json({ message: "Password successfully updated." });
  } catch (error) {
    console.error("Reset password error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};
const getProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("name email role profileImage");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User tidak ditemukan" });
    }
    const guru = await Guru.findOne({ userId: id }).populate({
      path: "subject",
      select: "sub_name",
    });

    if (!guru) {
      return res
        .status(404)
        .json({ success: false, error: "Guru tidak ditemukan" });
    }
    const rooms = await Room.find({ guruId: guru._id }, "room_name edu_level");

    return res.status(200).json({
      success: true,
      profile: {
        user,
        guru: guru.toObject(),
        rooms,
      },
    });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while getting profile",
    });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const updateProfile = async (req, res) => {
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
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const guru = await Guru.findOne({ userId: id });
    if (!guru) {
      return res.status(404).json({ success: false, error: "Guru not found" });
    }

    const updateUserData = { name, email, role };

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
        }
      }
      updateUserData.profileImage = req.file.filename;
    }

    await User.findByIdAndUpdate(id, updateUserData);

    const updateGuruData = {
      title,
      position,
      subject,
      gender,
      dob,
      dob_city,
      staGuru,
    };

    await Guru.findOneAndUpdate({ userId: id }, updateGuruData);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while updating profile",
    });
  }
};

const verify = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "name email role profileImage"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User tidak ditemukan" });
    }

    const guru = await Guru.findOne({ userId }).populate("subject", "sub_name");
    const rooms = await Room.find({ guruId: guru?._id }, "room_name edu_level");

    return res.status(200).json({
      success: true,
      user: {
        user,
        guru: guru?.toObject() || null,
        rooms,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error saat verifikasi." });
  }
};

export {
  login,
  verify,
  register,
  forgotPass,
  resetPass,
  getProfile,
  updateProfile,
  upload,
};
