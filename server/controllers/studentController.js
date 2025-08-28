import fs from "fs";
import path from "path";
import axios from "axios";
import Student from "../models/Student.js";

const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("roomId");
    return res.status(200).json({
      success: true,
      students,
    });
  } catch (err) {
    console.error("❌ Gagal mengambil data siswa:", err);
    return res.status(500).json({
      success: false,
      error: "Gagal mengambil data siswa dari database.",
    });
  }
};

const getStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student)
      return res
        .status(404)
        .json({ success: false, error: "student not found" });

    return res.status(200).json({ success: true, student });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "get student server error" });
  }
};

const updateStudent = async (req, res) => {};

const deleteFaceStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Siswa tidak ditemukan.",
      });
    }

    const filename = student.faceImagePath?.split("/").pop();
    const imagePath = path.join(
      process.cwd(),
      "public",
      "images",
      filename || ""
    );

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log("🗑️ Gambar berhasil dihapus:", imagePath);
    }

    const payload = {
      user_id: student._id.toString(),
      facegallery_id: process.env.BIZNET_GALLERY_ID,
      trx_id: process.env.BIZNET_TRX_ID,
    };

    const biznetResponse = await axios.request({
      method: "DELETE",
      url: "https://fr.neoapi.id/risetai/face-api/facegallery/delete-face",
      headers: {
        Accesstoken: process.env.BIZNET_API_TOKEN,
        "Content-Type": "application/json",
      },
      data: payload,
    });

    student.faceEnrolled = false;
    student.faceImagePath = null;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "✅ Wajah berhasil dihapus.",
      data: biznetResponse.data,
    });
  } catch (err) {
    console.error("❌ Gagal hapus wajah:", err.message);
    console.error("❌ Detail:", err.response?.data || err);
    return res.status(500).json({
      success: false,
      error:
        err.response?.data?.error ||
        err.response?.data?.errors?.message ||
        "Gagal menghapus wajah.",
    });
  }
};

export { getStudents, getStudent, updateStudent, deleteFaceStudent };
