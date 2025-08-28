import Presensi from "../models/Presensi.js";
import Room from "../models/Room.js";
import Student from "../models/Student.js";
import dayjs from "dayjs";

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate({
      path: "guruId",
      select: "title position userId",
      populate: {
        path: "userId",
        select: "name",
      },
    });

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data kelas" });
  }
};

const getStudentsByClass = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { start, end } = req.query;

    const room = await Room.findById(roomId).populate({
      path: "guruId",
      populate: {
        path: "userId",
        select: "name",
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Kelas tidak ditemukan" });
    }

    const roomStart = dayjs(room.startDate).startOf("day");
    const roomEnd = dayjs(room.endDate).endOf("day");

    if (!roomStart.isValid() || !roomEnd.isValid()) {
      return res
        .status(400)
        .json({ error: "Tanggal aktif kelas belum diatur." });
    }

    // Gunakan query tanggal, tapi batasi sesuai rentang di Room
    const startDate = start
      ? dayjs(start).startOf("day").isBefore(roomStart)
        ? roomStart
        : dayjs(start).startOf("day")
      : roomStart;

    const endDate = end
      ? dayjs(end).endOf("day").isAfter(roomEnd)
        ? roomEnd
        : dayjs(end).endOf("day")
      : roomEnd;

    const students = await Student.find({ roomId });

    const presensi = await Presensi.find({
      student: { $in: students.map((s) => s._id) },
      date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    }).populate({
      path: "schedule",
      populate: {
        path: "room_cls",
        select: "_id",
      },
    });

    const statusPriority = {
      hadir: 3,
      izin: 2,
      sakit: 1,
      "tidak hadir": 0,
    };

    const laporan = students.map((siswa) => {
      const dataPresensi = presensi.filter((p) => {
        const scheduleRoomId = p.schedule?.room_cls?._id?.toString();
        return (
          p.student.toString() === siswa._id.toString() &&
          scheduleRoomId === roomId
        );
      });

      const dailyStatusMap = {};

      dataPresensi.forEach((p) => {
        const tanggal = dayjs(p.date).format("YYYY-MM-DD");
        const current = dailyStatusMap[tanggal];
        const incoming = p.status;

        if (!current || statusPriority[incoming] > statusPriority[current]) {
          dailyStatusMap[tanggal] = incoming;
        }
      });

      const count = {
        hadir: 0,
        izin: 0,
        sakit: 0,
        "tidak hadir": 0,
      };

      Object.values(dailyStatusMap).forEach((status) => {
        count[status] += 1;
      });

      return {
        siswa: {
          _id: siswa._id,
          name: siswa.name,
          nik: siswa.nik,
        },
        rekap: count,
      };
    });

    return res.json({
      room: {
        _id: room._id,
        room_name: room.room_name,
        school_year: room.school_year,
        edu_level: room.edu_level,
        wali_kelas: room.guruId?.userId?.name || "-",
        startDate: room.startDate,
        endDate: room.endDate,
      },
      siswa: laporan,
    });
  } catch (err) {
    console.error("❌ Error getStudentsByClass:", err);
    return res.status(500).json({ error: "Gagal mengambil data laporan" });
  }
};

export { getRooms, getStudentsByClass };
