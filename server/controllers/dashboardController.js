import Guru from "../models/Guru.js";
import Room from "../models/Room.js";
import Schedule from "../models/Schedule.js";
import Student from "../models/Student.js";

// Dashboard Admin
const getSummary = async (req, res) => {
  try {
    const { edu } = req.query;
    const filter = edu && edu !== "all" ? { edu_level: edu } : {};

    const guruFiltered = await Guru.find(filter).populate("userId");
    const totalGuru = guruFiltered.filter(
      (g) => g.userId?.role === "guru"
    ).length;
    const totalStaff = guruFiltered.length;

    const rooms = await Room.find({
      guruId: { $in: guruFiltered.map((g) => g._id) },
    });

    const totalStudent = await Student.countDocuments({
      roomId: { $in: rooms.map((r) => r._id) },
    });

    const guruWithRoom = guruFiltered.map((guru) => {
      const relatedRoom = rooms.find(
        (room) => room.guruId?.toString() === guru._id.toString()
      );
      return {
        ...guru.toObject(),
        room_name: relatedRoom ? relatedRoom.room_name : null,
      };
    });

    return res.status(200).json({
      success: true,
      totalGuru,
      totalStaff,
      totalStudent,
      guru: guruWithRoom,
    });
  } catch (error) {
    console.error("Summary error:", error);
    return res.status(500).json({
      success: false,
      error: "dashboard summary error",
    });
  }
};

// Dashboard User/Guru
const getSchedules = async (req, res) => {
  try {
    const { room } = req.query;

    const query = {};
    if (room) {
      query.$or = [{ room_cls: room }, { room_cls: null }];
    }

    const schedules = await Schedule.find(query)
      .populate("subject", "sub_name")
      .populate("room_cls", "room_name")
      .populate({
        path: "guruId",
        model: "Guru",
        populate: {
          path: "userId",
          model: "User",
          select: "name",
        },
      });

    const mappedSchedules = schedules.map((item) => {
      const obj = item.toObject();

      const subjectName = obj.subject?.sub_name?.toUpperCase?.() || "";

      // === Penandaan label ===
      if (["UPACARA", "ISTIRAHAT", "ISTIRAHAT 2"].includes(subjectName)) {
        obj.label = subjectName;
      } else if (!obj.subject && obj.isExam && obj.examType) {
        obj.label = obj.examType.toUpperCase();
      }

      return obj;
    });

    return res.status(200).json({ success: true, schedules: mappedSchedules });
  } catch (error) {
    console.error("getSchedules error:", error);
    return res
      .status(500)
      .json({ success: false, error: "get schedule server error" });
  }
};

const getGuruInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const guru = await Guru.findOne({ userId })
      .populate("userId", "name")
      .lean();

    if (!guru) {
      return res.status(404).json({
        success: false,
        error: "Akun ini tidak terdaftar sebagai guru.",
      });
    }

    // Ambil room tempat guru ini menjadi wali kelas
    const waliKelasRoom = await Room.findOne({ guruId: guru._id }).lean();

    // Ambil mapel yang diajar
    const schedules = await Schedule.find({ guruId: guru._id })
      .populate("subject", "sub_name")
      .lean();

    const subjectList = Array.from(
      new Set(schedules.map((item) => item.subject?.sub_name).filter(Boolean))
    );

    const result = {
      ...guru,
      room_name: waliKelasRoom?.room_name || null,
      subjectList,
    };

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("getGuruInfo error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export { getSummary, getSchedules, getGuruInfo };
