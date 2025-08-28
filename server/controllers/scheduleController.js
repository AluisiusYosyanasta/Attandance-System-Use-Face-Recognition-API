import Room from "../models/Room.js";
import Schedule from "./../models/Schedule.js";

const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
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

    return res.status(200).json({ success: true, schedules });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "get schedule server error" });
  }
};

const addSchedule = async (req, res) => {
  try {
    const {
      subject,
      room_cls,
      day,
      startTime,
      endTime,
      guruId,
      isExam = false,
      examType = "",
    } = req.body;
    if (isExam && !["UTS", "UAS"].includes(examType)) {
      return res.status(400).json({
        success: false,
        error: "Jenis ujian tidak valid. Pilih antara 'UTS' atau 'UAS'.",
      });
    }
    const newSch = new Schedule({
      subject: subject === "" ? null : subject,
      room_cls: room_cls === "" ? null : room_cls,
      day: day === "" ? null : day,
      startTime: startTime === "" || startTime === "null" ? null : startTime,
      endTime: endTime === "" || endTime === "null" ? null : endTime,
      guruId: guruId === "" ? null : guruId,
      isExam: !!isExam,
      examType: isExam ? examType : "",
    });

    await newSch.save();

    return res.status(200).json({ success: true, schedule: newSch });
  } catch (error) {
    console.error("Add Schedule Error:", error);
    return res.status(500).json({
      success: false,
      error: "add schedule server error",
    });
  }
};

const getSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findById(id)
      .populate("subject", "sub_name")
      .populate("room_cls", "room_name")
      .populate({
        path: "guruId",
        populate: {
          path: "userId",
          select: "name",
        },
      });

    if (!schedule) {
      return res
        .status(404)
        .json({ success: false, error: "Schedule not found" });
    }

    return res.status(200).json({ success: true, schedule });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "get schedule server error" });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, room_cls, day, startTime, endTime, guruId } = req.body;
    const updateSchedule = await Schedule.findByIdAndUpdate(
      { _id: id },
      {
        subject: subject === "" ? null : subject,
        room_cls: room_cls === "" ? null : room_cls,
        day: day === "" ? null : day,
        startTime: startTime === "" || startTime === "null" ? null : startTime,
        endTime: endTime === "" || endTime === "null" ? null : endTime,
        guruId: guruId === "" ? null : guruId,
      }
    );
    return res.status(200).json({ success: true, updateSchedule });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "edit schedule server error" });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const deletesch = await Schedule.findById({ _id: id });
    await deletesch.deleteOne();
    return res.status(200).json({ success: true, deletesch });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "delete schedule server error" });
  }
};

export {
  addSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
};
