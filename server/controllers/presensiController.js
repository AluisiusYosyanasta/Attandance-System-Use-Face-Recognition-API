import fs from "fs";
import path from "path";
import Student from "../models/Student.js";
import axios from "axios";
import SystemConfig from "../models/SystemConfig.js";
import { fileURLToPath } from "url";
import Guru from "../models/Guru.js";
import Schedule from "../models/Schedule.js";
import Presensi from "../models/Presensi.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Ambil daftar siswa dengan nama kelas
const getStudentsByClass = async (req, res) => {
  try {
    const students = await Student.find().populate("roomId", "room_name");
    return res.status(200).json({ success: true, students });
  } catch (error) {
    console.error("getStudentsByClass error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Terjadi kesalahan saat mengambil data siswa berdasarkan kelas",
    });
  }
};

// ✅ Enroll wajah ke Biznet NEO
const enrollFaceToBiznet = async (req, res) => {
  try {
    const { studentId, image } = req.body;

    if (!studentId || !image) {
      return res.status(400).json({
        success: false,
        error: "Data tidak lengkap",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Siswa tidak ditemukan",
      });
    }

    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Image, "base64");

    const filename = `${student.name}_${Date.now()}.jpg`;
    const filepath = path.join(__dirname, "../public/images", filename);

    fs.writeFileSync(filepath, buffer);
    console.log("✅ Gambar disimpan di:", filepath);

    const payload = {
      user_id: student._id.toString(),
      user_name: student.name,
      facegallery_id: process.env.BIZNET_GALLERY_ID,
      image: base64Image,
      trx_id: process.env.BIZNET_TRX_ID,
    };

    const response = await axios.post(
      "https://fr.neoapi.id/risetai/face-api/facegallery/enroll-face",
      payload,
      {
        headers: {
          Accesstoken: process.env.BIZNET_API_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    student.faceEnrolled = true;
    student.faceImagePath = `/images/${filename}`;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "✅ Enroll wajah berhasil",
      data: response.data,
    });
  } catch (err) {
    console.error("❌ Enroll error:", err.message);
    console.error("❌ Response:", err.response?.data);
    return res.status(500).json({
      success: false,
      error: err.response?.data?.error || "Gagal enroll ke Biznet.",
    });
  }
};

const recognizeFaceFromBiznet = async (req, res) => {
  try {
    const { image, scheduleIds = [] } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "Gambar wajah tidak dikirim",
      });
    }

    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");
    const facegalleryId = process.env.BIZNET_GALLERY_ID;
    const trxId = process.env.BIZNET_TRX_ID;

    const payload = {
      facegallery_id: facegalleryId,
      image: base64Image,
      trx_id: trxId,
    };

    const response = await axios.post(
      "https://fr.neoapi.id/risetai/face-api/facegallery/identify-face",
      payload,
      {
        headers: {
          Accesstoken: process.env.BIZNET_API_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const match = response.data?.risetai?.return?.[0];

    if (
      !match ||
      match.user_id === "unregistered" ||
      parseFloat(match.confidence_level) < 0.75
    ) {
      return res.status(200).json({
        success: false,
        message: "❌ Wajah tidak dikenali atau confidence terlalu rendah",
        similarity: match?.confidence_level || 0,
        raw: match,
      });
    }

    // ✅ Cek apakah siswa ada di database
    const student = await Student.findById(match.user_id).populate("roomId");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "⚠️ Wajah dikenali tetapi siswa tidak ditemukan di sistem",
        studentId: match.user_id,
      });
    }

    const results = [];

    for (const scheduleId of scheduleIds) {
      const schedule = await Schedule.findById(scheduleId)
        .populate("room_cls subject guruId")
        .populate({
          path: "guruId",
          populate: { path: "userId", select: "name" },
        });

      if (!schedule) {
        results.push({
          scheduleId,
          valid: false,
          reason: "❌ Jadwal tidak ditemukan",
        });
        continue;
      }

      // ✅ Cek apakah siswa memang berada di kelas yang sesuai
      const isSameClass = student.roomId?._id.equals(schedule.room_cls._id);
      if (!isSameClass) {
        results.push({
          scheduleId,
          valid: false,
          reason: `⚠️ Jadwal untuk kelas ${schedule.room_cls.room_name}, tapi siswa dari kelas ${student.roomId?.room_name}`,
        });
        continue;
      }

      const alreadyAbsen = await Presensi.findOne({
        student: student._id,
        schedule: schedule._id,
      });

      const now = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      results.push({
        scheduleId,
        valid: true,
        alreadyAbsen: !!alreadyAbsen,
        subject: schedule.subject?.sub_name || "-",
        room: schedule.room_cls?.room_name || "-",
        guru: schedule.guruId?.userId?.name || "-",
        time: now,
      });
    }

    const anyValidSchedule = results.some((s) => s.valid);

    return res.status(200).json({
      success: anyValidSchedule,
      message: anyValidSchedule
        ? "✅ Wajah dikenali !!!"
        : "⚠️ Wajah dikenali, tapi tidak sesuai jadwal atau kelas",
      student: {
        _id: student._id,
        name: student.name,
        class: student.roomId?.room_name || "-",
      },
      similarity: parseFloat(match.confidence_level),
      schedules: results,
    });
  } catch (err) {
    console.error(
      "❌ Error saat pengenalan wajah:",
      err.response?.data || err.message
    );
    return res.status(500).json({
      success: false,
      error:
        err.response?.data?.error || "Terjadi kesalahan saat pengenalan wajah",
    });
  }
};

// ✅ Cek apakah gallery sudah dibuat
const getGalleryStatus = async (req, res) => {
  try {
    const config = await SystemConfig.findOne({ key: "faceGalleryCreated" });
    const isCreated = config?.value === true;
    return res.json({ success: true, created: isCreated });
  } catch (err) {
    console.error("❌ Gagal cek status face gallery:", err.message);
    return res.status(500).json({
      success: false,
      error: "Gagal memeriksa status face gallery.",
    });
  }
};

// ✅ Buat face gallery jika belum ada
const createFaceGallery = async (req, res) => {
  try {
    const existing = await SystemConfig.findOne({ key: "faceGalleryCreated" });
    if (existing?.value === true) {
      return res.status(400).json({
        success: false,
        message: "Face gallery sudah pernah dibuat.",
      });
    }

    const trxId = process.env.BIZNET_TRX_ID;
    const facegalleryId = process.env.BIZNET_GALLERY_ID;

    const response = await axios.post(
      "https://fr.neoapi.id/risetai/face-api/facegallery/create-facegallery",
      {
        facegallery_id: facegalleryId,
        trx_id: trxId,
      },
      {
        headers: {
          Accesstoken: process.env.BIZNET_API_TOKEN,
        },
      }
    );

    await SystemConfig.findOneAndUpdate(
      { key: "faceGalleryCreated" },
      { key: "faceGalleryCreated", value: true },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "✅ Face gallery berhasil dibuat",
      data: response.data,
    });
  } catch (err) {
    console.error(
      "❌ Gagal buat face gallery:",
      err.response?.data || err.message
    );
    return res.status(500).json({
      success: false,
      error: err.response?.data?.error || "Gagal membuat face gallery.",
    });
  }
};

const getMyFaceGalleries = async (req, res) => {
  try {
    const response = await axios.get(
      "https://fr.neoapi.id/risetai/face-api/facegallery/my-facegalleries",
      {
        headers: {
          Accesstoken: process.env.BIZNET_API_TOKEN,
        },
      }
    );

    return res.status(200).json({
      success: true,
      galleries: response.data,
    });
  } catch (err) {
    console.error(
      "❌ Gagal ambil daftar gallery:",
      err.response?.data || err.message
    );
    return res.status(500).json({
      success: false,
      error:
        err.response?.data?.error || "Gagal mengambil daftar face gallery.",
    });
  }
};

const getGuruSchedules = async (req, res) => {
  try {
    const userId = req.user.id;

    const guru = await Guru.findOne({ userId }).populate("subject");
    if (!guru) {
      return res.status(404).json({
        success: false,
        error: "Guru tidak ditemukan.",
      });
    }

    const schedules = await Schedule.find({ guruId: guru._id })
      .populate("subject")
      .populate("room_cls")
      .populate("guruId");

    // Ambil tanggal hari ini tanpa waktu
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Ambil presensi hari ini berdasarkan schedule
    const presensiToday = await Presensi.find({
      schedule: { $in: schedules.map((s) => s._id) },
      date: { $gte: today, $lt: tomorrow },
    });

    const schedulePresensiMap = new Map();
    presensiToday.forEach((p) => {
      schedulePresensiMap.set(p.schedule.toString(), true);
    });

    // Per jadwal dengan tambahan isPresensiDone
    const scheduleList = schedules.map((sch) => ({
      _id: sch._id,
      subject: sch.subject,
      room_cls: sch.room_cls,
      guruId: sch.guruId,
      day: sch.day,
      startTime: sch.startTime,
      endTime: sch.endTime,
      isPresensiDone: schedulePresensiMap.has(sch._id.toString()),
    }));

    // Grup berdasarkan subject + hari
    const groupedMap = new Map();
    schedules.forEach((sch) => {
      const key = `${sch.subject._id.toString()}_${sch.day}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          subject: sch.subject,
          day: sch.day,
          scheduleIds: [sch._id],
        });
      } else {
        groupedMap.get(key).scheduleIds.push(sch._id);
      }
    });

    const grouped = Array.from(groupedMap.values());

    return res.status(200).json({
      success: true,
      guru: `${guru.title} ${guru.name}`,
      subjects: guru.subject,
      schedules: scheduleList,
      groupedTimes: grouped,
    });
  } catch (error) {
    console.error("❌ Error getGuruSchedules:", error);
    return res.status(500).json({
      success: false,
      error: "Gagal mengambil jadwal guru.",
    });
  }
};

const submitPresensi = async (req, res) => {
  try {
    const { presensiList = [], scheduleIds = [] } = req.body;

    if (!presensiList.length || !scheduleIds.length) {
      return res.status(400).json({
        success: false,
        message: "Data presensi atau scheduleId kosong.",
      });
    }

    let inserted = 0;

    for (const scheduleId of scheduleIds) {
      const schedule = await Schedule.findById(scheduleId);
      if (!schedule) {
        console.warn(`⚠️ Schedule dengan ID ${scheduleId} tidak ditemukan.`);
        continue;
      }

      for (const item of presensiList) {
        const { studentId, status, time } = item;

        if (!studentId || !status) {
          console.warn("⚠️ Data presensi tidak lengkap:", item);
          continue;
        }

        const existing = await Presensi.findOne({
          student: studentId,
          schedule: schedule._id,
        });

        if (existing) {
          continue;
        }

        await Presensi.create({
          student: studentId,
          schedule: schedule._id,
          status,
          time: time || null,
        });
        inserted++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `✅ ${inserted} presensi berhasil disimpan.`,
      inserted,
    });
  } catch (err) {
    console.error("❌ Error saat menyimpan presensi:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server.",
    });
  }
};

const studentConfirm = async (req, res) => {
  try {
    const { scheduleIds = [], detectedStudentIds = [] } = req.body;

    const schedules = await Schedule.find({
      _id: { $in: scheduleIds },
    }).populate("room_cls");
    const allStudentsMap = new Map();

    for (const sch of schedules) {
      const siswa = await Student.find({ roomId: sch.room_cls._id }).populate(
        "roomId"
      );
      siswa.forEach((s) => {
        allStudentsMap.set(String(s._id), s);
      });
    }

    const siswaKonfirmasi = [];
    for (const [id, siswa] of allStudentsMap) {
      siswaKonfirmasi.push({
        id,
        name: siswa.name,
        class: siswa.roomId?.room_name || "-",
        status: detectedStudentIds.includes(id) ? "hadir" : "tidak hadir",
      });
    }

    res.status(200).json({
      success: true,
      siswa: siswaKonfirmasi,
    });
  } catch (err) {
    console.error("❌ Error konfirmasi siswa:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data siswa.",
    });
  }
};

const fetchPresensiBySchedule = async (req, res) => {
  try {
    const { scheduleIds = [] } = req.body;

    if (!scheduleIds.length) {
      return res.status(400).json({
        success: false,
        message: "scheduleIds tidak boleh kosong.",
      });
    }

    const presensis = await Presensi.find({ schedule: { $in: scheduleIds } })
      .populate({
        path: "student",
        select: "name roomId",
        populate: {
          path: "roomId",
          select: "room_name",
        },
      })
      .populate({
        path: "schedule",
        select: "subject",
        populate: {
          path: "subject",
          select: "sub_name",
        },
      });

    // ✅ Gabungkan berdasarkan studentId
    const mergedMap = new Map();

    presensis.forEach((p) => {
      const key = p.student._id.toString();

      if (!mergedMap.has(key)) {
        mergedMap.set(key, {
          id: p._id, // bisa ambil salah satu ID
          studentId: p.student._id,
          name: p.student.name,
          class: p.student.roomId?.room_name || "-",
          status: p.status,
          time: p.time,
          subject: p.schedule.subject?.sub_name || "-",
          presensiIds: [p._id], // simpan semua id yang digabung
        });
      } else {
        const existing = mergedMap.get(key);
        existing.presensiIds.push(p._id);

        // Ambil status dan waktu terbaru (atau pertahankan yang valid)
        existing.status = existing.status === "hadir" ? "hadir" : p.status;
        existing.time = p.time || existing.time;
      }
    });

    const mergedData = Array.from(mergedMap.values());

    return res.status(200).json({
      success: true,
      data: mergedData,
    });
  } catch (err) {
    console.error("❌ Error fetchPresensiBySchedule:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data presensi.",
    });
  }
};

const updatePresensi = async (req, res) => {
  try {
    const { updates = [] } = req.body;

    if (!updates.length) {
      return res.status(400).json({
        success: false,
        message: "Data update kosong.",
      });
    }

    for (const item of updates) {
      const { presensiIds = [], status, time } = item;

      if (!presensiIds.length || !status) continue;

      await Presensi.updateMany(
        { _id: { $in: presensiIds } },
        {
          $set: {
            status,
            time: time || null,
            updatedAt: new Date(),
          },
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "✅ Semua presensi berhasil diperbarui.",
    });
  } catch (err) {
    console.error("❌ Error updatePresensi:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui data presensi.",
    });
  }
};

const getSchedules = async (req, res) => {
  const { roomId } = req.query;

  if (!roomId) {
    return res
      .status(400)
      .json({ success: false, error: "roomId wajib diisi" });
  }

  try {
    const schedules = await Schedule.find({ room_cls: roomId })
      .populate("subject", "sub_name")
      .lean();

    const mapelMap = new Map();
    for (const sch of schedules) {
      if (sch.subject?._id) {
        mapelMap.set(sch.subject._id.toString(), {
          _id: sch.subject._id,
          label: sch.subject.sub_name,
        });
      }
    }

    return res.status(200).json({
      success: true,
      mapel: Array.from(mapelMap.values()),
    });
  } catch (err) {
    console.error("get schedules error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const loadSiswaEdit = async (req, res) => {
  try {
    const { roomId, subjectId, date } = req.body;

    if (!roomId || !subjectId || !date) {
      return res.status(400).json({
        success: false,
        message: "Data tidak lengkap (roomId, subjectId, date).",
      });
    }

    const schedules = await Schedule.find({
      room_cls: roomId,
      subject: subjectId,
    }).populate("room_cls");

    if (!schedules.length) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada jadwal untuk kombinasi room dan subject.",
      });
    }

    const scheduleIds = schedules.map((s) => s._id);

    const studentSet = new Map();
    for (const sch of schedules) {
      const siswa = await Student.find({ roomId: sch.room_cls._id }).populate(
        "roomId"
      );
      siswa.forEach((s) => {
        studentSet.set(String(s._id), s);
      });
    }
    const allPresensi = await Presensi.find({
      schedule: { $in: scheduleIds },
    }).populate("student");

    const filteredPresensi = allPresensi.filter((p) => {
      const presensiDate = new Date(p.date).toISOString().slice(0, 10);
      return presensiDate === date;
    });

    const presensiMap = new Map();
    filteredPresensi.forEach((p) => {
      const sid = String(p.student._id);
      if (!presensiMap.has(sid)) {
        presensiMap.set(sid, {
          presensiIds: [p._id],
          status: p.status,
          time: p.time,
        });
      } else {
        const existing = presensiMap.get(sid);
        existing.presensiIds.push(p._id);
        existing.status = existing.status === "hadir" ? "hadir" : p.status;
        if (!existing.time && p.time) {
          existing.time = p.time;
        }
      }
    });

    const result = [];
    for (const [sid, siswa] of studentSet.entries()) {
      if (presensiMap.has(sid)) {
        result.push({
          _id: sid,
          name: siswa.name,
          room: siswa.roomId?.room_name || "-",
          status: presensiMap.get(sid)?.status || "",
          time: presensiMap.get(sid)?.time || "",
          finalStatus: presensiMap.get(sid)?.status || "",
          presensiIds: presensiMap.get(sid)?.presensiIds || [],
        });
      }
    }

    return res.status(200).json({ success: true, students: result });
  } catch (err) {
    console.error("❌ Error load siswa edit:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data siswa.",
    });
  }
};

const updatePresensiUbah = async (req, res) => {
  try {
    const { roomId, subjectId, date, presensiList = [] } = req.body;

    if (!roomId || !subjectId || !date || !presensiList.length) {
      return res.status(400).json({
        success: false,
        message: "Data tidak lengkap (roomId, subjectId, date, presensiList).",
      });
    }
    const schedules = await Schedule.find({
      room_cls: roomId,
      subject: subjectId,
    });

    if (!schedules.length) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada jadwal yang sesuai.",
      });
    }

    const scheduleIds = schedules.map((s) => s._id.toString());

    // 🎯 Rentang tanggal
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);

    let updated = 0;

    for (const item of presensiList) {
      const { studentId, status } = item;

      if (!studentId || !status) continue;

      // 🔄 Update semua presensi siswa ini untuk semua jadwal yang cocok di tanggal itu
      const updateResult = await Presensi.updateMany(
        {
          student: studentId,
          schedule: { $in: scheduleIds },
          date: { $gte: startDate, $lte: endDate },
        },
        { $set: { status } }
      );

      updated += updateResult.modifiedCount;
    }

    res.status(200).json({
      success: true,
      message: `${updated} data presensi berhasil diperbarui.`,
    });
  } catch (err) {
    console.error("❌ Error saat update presensi edit:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server.",
    });
  }
};

export {
  getStudentsByClass,
  enrollFaceToBiznet,
  recognizeFaceFromBiznet,
  getGalleryStatus,
  createFaceGallery,
  getMyFaceGalleries,
  getGuruSchedules,
  submitPresensi,
  studentConfirm,
  fetchPresensiBySchedule,
  updatePresensi,
  getSchedules,
  loadSiswaEdit,
  updatePresensiUbah,
};
