import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  fetchSubjects,
  fetchRooms,
  fetchGurusBySubject,
} from "../../utils/ScheduleHelper.jsx";
import { HiChevronRight } from "react-icons/hi";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

const AddSchedule = () => {
  const [gurus, setGurus] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [schedule, setSchedule] = useState({
    subject: "",
    room_cls: "",
    guruId: "",
    day: "",
    startTime: null,
    endTime: null,
    isExam: false,
    examType: "",
  });
  const baseURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const getSubjects = async () => {
      const subjects = await fetchSubjects();
      setSubjects(subjects);
    };
    const getRooms = async () => {
      const rooms = await fetchRooms();
      setRooms(rooms);
    };

    getSubjects();
    getRooms();
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setSchedule((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "subject" && { guruId: "" }),
    }));

    if (name === "subject") {
      setGurus([]); // kosongkan dulu
      const guruList = await fetchGurusBySubject(value);
      setGurus(guruList);
    }
  };

  const handleStartTimeChange = (value) => {
    setSchedule((prev) => ({ ...prev, startTime: value }));
  };

  const handleEndTimeChange = (value) => {
    setSchedule((prev) => ({ ...prev, endTime: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...schedule,
        startTime: schedule.startTime
          ? schedule.startTime.format("HH:mm")
          : null,
        endTime: schedule.endTime ? schedule.endTime.format("HH:mm") : null,
      };
      const response = await axios.post(
        `${baseURL}/api/schedule/add`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        const kelas = localStorage.getItem("filterKelas") || "all";
        const hari = localStorage.getItem("filterHari") || "all";

        navigate(`/admin-dashboard/schedules?kelas=${kelas}&hari=${hari}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      if (
        error.response &&
        error.response.data &&
        !error.response.data.success
      ) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="mt-10 p-5">
        <h1 className="max-w-4xl mx-auto text-xl font-semibold text-gray-800 mb-2">
          Jadwal Pelajaran
        </h1>
        <div className="max-w-4xl mx-auto flex items-center text-sm text-gray-500 space-x-1">
          <Link to="/admin-dashboard">
            <span className="hover:underline hover:text-color5 cursor-pointer">
              Dashboard
            </span>
          </Link>
          <HiChevronRight className="text-gray-400" />
          <Link to="/admin-dashboard/schedules">
            <span className="hover:underline hover:text-color5 cursor-pointer">
              List
            </span>
          </Link>
          <HiChevronRight className="text-gray-400" />
          <Link to="/admin-dashboard/add-schedule">
            <span className="hover:underline text-color5 cursor-pointer">
              Jadwal Pelajaran
            </span>
          </Link>
        </div>
        <div className="max-w-4xl mx-auto mt-5 bg-white p-8 rounded-md shadow-md">
          <form onSubmit={handleSubmit}>
            {/* Tombol Pilih Kelas */}
            <div className="mb-3">
              <label className="font-semibold text-gray-700 block mb-1">
                Pilih Kelas
              </label>
              <div className="flex flex-wrap gap-2">
                {rooms.map((room) => (
                  <button
                    key={room._id}
                    type="button"
                    onClick={() =>
                      setSchedule((prev) => ({ ...prev, room_cls: room._id }))
                    }
                    className={`px-3 py-1 rounded border text-sm font-medium ${
                      schedule.room_cls === room._id
                        ? "bg-color5 text-white"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {room.room_name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid mt-4 grid-cols-1 md:grid-cols-2 space-y-0 gap-2">
              {/* Mata Pelajaran */}
              <div>
                <label className="font-semibold text-gray-700">
                  Mata Pelajaran
                </label>
                <select
                  name="subject"
                  value={schedule.subject}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Pilih Mata Pelajaran</option>
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.sub_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guru */}
              <div>
                <label className="font-semibold text-gray-700">Guru</label>
                <select
                  name="guruId"
                  value={schedule.guruId}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                >
                  <option value="">Pilih Guru</option>
                  {gurus.map((guru) => (
                    <option key={guru._id} value={guru._id}>
                      {guru.userId?.name || "-"}
                    </option>
                  ))}
                </select>
              </div>
              {/* Kelas */}
              <div>
                <label className="font-semibold text-gray-700">Kelas</label>
                <select
                  name="room_cls"
                  value={schedule.room_cls}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                >
                  <option value="">Pilih Kelas</option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.room_name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Day */}
              <div>
                <label htmlFor="day" className="font-semibold text-gray-700">
                  Hari
                </label>
                <select
                  name="day"
                  value={schedule.day}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                >
                  <option value="">Pilih Hari</option>
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                  <option value="Sabtu">Sabtu</option>
                  <option value="Minggu">Minggu</option>
                </select>
              </div>
            </div>
            <div className="grid mt-4 grid-cols-1 md:grid-cols-2 space-y-0 gap-2">
              {/* Start time */}
              <div>
                <label
                  htmlFor="startTime"
                  className="font-semibold text-gray-700"
                >
                  Jam Mulai
                </label>
                <TimePicker
                  name="startTime"
                  value={schedule.startTime}
                  onChange={handleStartTimeChange}
                  format="HH:mm"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
              {/* End Time */}
              <div>
                <label
                  htmlFor="endTime"
                  className="font-semibold text-gray-700"
                >
                  Jam Berakhir
                </label>
                <TimePicker
                  name="endTime"
                  value={schedule.endTime}
                  onChange={handleEndTimeChange}
                  format="HH:mm"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
              {/* Toggle Ujian */}
              <div className="mt-4">
                <label className="font-semibold text-gray-700 block mb-1">
                  Apakah ini Ujian?
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={schedule.isExam}
                    onChange={(e) =>
                      setSchedule((prev) => ({
                        ...prev,
                        isExam: e.target.checked,
                        examType: e.target.checked ? prev.examType : "",
                      }))
                    }
                  />
                  <span className="text-gray-700">
                    Ya, ini adalah jadwal ujian
                  </span>
                </div>
              </div>

              {/* Pilihan Jenis Ujian */}
              {schedule.isExam && (
                <div className="mt-4">
                  <label className="font-semibold text-gray-700">
                    Jenis Ujian
                  </label>
                  <select
                    name="examType"
                    value={schedule.examType}
                    onChange={(e) =>
                      setSchedule((prev) => ({
                        ...prev,
                        examType: e.target.value,
                      }))
                    }
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Pilih Jenis Ujian</option>
                    <option value="UTS">Ujian Tengah Semester</option>
                    <option value="UAS">Ujian Akhir Semester</option>
                  </select>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full mt-6 bg-color5 hover:bg-color4 text-white font-bold py-2 px-4 rounded"
            >
              Tambahkan Mata Pelajaran
            </button>
          </form>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default AddSchedule;
