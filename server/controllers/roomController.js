import Room from "../models/Room.js";
import Student from "../models/Student.js";

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate({
      path: "guruId",
      populate: {
        path: "userId",
        select: "name",
      },
    });

    return res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "get room server error" });
  }
};

const addRoom = async (req, res) => {
  try {
    const {
      room_name,
      edu_level,
      guruId,
      school_year,
      startDate,
      endDate,
      students,
    } = req.body;
    const newRoom = new Room({
      room_name: room_name === "null" || room_name === "" ? null : room_name,
      edu_level:
        edu_level === "null" || edu_level === "null" ? null : edu_level,
      guruId: guruId === "null" || guruId === "" ? null : guruId,
      school_year:
        school_year === "null" || school_year === "" ? null : school_year,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

    await newRoom.save();

    const validStudents = Array.isArray(students)
      ? students.filter((student) => student.name?.trim())
      : [];

    let savedStudents = [];
    if (validStudents.length > 0) {
      savedStudents = await Promise.all(
        validStudents.map(async (student) => {
          const newStudent = new Student({
            ...student,
            roomId: newRoom._id,
          });
          return await newStudent.save();
        })
      );
    }

    return res.status(200).json({
      success: true,
      room: newRoom,
      students: savedStudents,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "add room server error" });
  }
};

const getRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room)
      return res.status(404).json({ success: false, error: "Room not found" });

    const students = await Student.find({ roomId: id });

    return res.status(200).json({ success: true, room, students });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "get room server error" });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      room_name,
      edu_level,
      guruId,
      school_year,
      startDate,
      endDate,
      students,
    } = req.body;

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      {
        room_name: room_name === "null" || room_name === "" ? null : room_name,
        edu_level:
          edu_level === "null" || edu_level === "null" ? null : edu_level,
        guruId: guruId === "null" || guruId === "" ? null : guruId,
        school_year:
          school_year === "null" || school_year === "" ? null : school_year,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      { new: true }
    );

    if (!updatedRoom)
      return res.status(404).json({ success: false, error: "Room not found" });

    await Student.deleteMany({ roomId: id });

    if (Array.isArray(students) && students.length > 0) {
      const newStudents = students.map((s) => ({
        ...s,
        roomId: id,
      }));
      await Student.insertMany(newStudents);
    }

    return res
      .status(200)
      .json({ success: true, message: "Room and students updated" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "edit room server error" });
  }
};

const getStudentsByClass = async (req, res) => {
  try {
    const { id } = req.params;
    const students = await Student.find({ roomId: id }).populate(
      "roomId",
      "room_name"
    );

    return res.status(200).json({ success: true, students });
  } catch (error) {
    console.error("getStudentsByClass error:", error);
    return res
      .status(500)
      .json({ success: false, error: "get students by class error" });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteroom = await Room.findById({ _id: id });
    await deleteroom.deleteOne();
    return res.status(200).json({ success: true, deleteroom });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "delete room server error" });
  }
};

export {
  addRoom,
  getRooms,
  getRoom,
  updateRoom,
  getStudentsByClass,
  deleteRoom,
};
