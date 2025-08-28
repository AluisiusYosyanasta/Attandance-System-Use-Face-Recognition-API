import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { HiChevronRight } from "react-icons/hi";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";

const EditSchedule = () => {
  const { id } = useParams();
  const [gurus, setGurus] = useState([]);
  const [formData, setFormData] = useState({
    subject: "",
    room_cls: "",
    guru: "",
    day: "",
    startTime: null,
    endTime: null,
    isExam: false,
    examType: "",
  });
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [scheduleloading, setScheduleloading] = useState(false);
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [subjectRes, roomRes, scheduleRes] = await Promise.all([
          axios.get(`${baseURL}/api/subject`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`${baseURL}/api/room`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`${baseURL}/api/schedule/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        setSubjects(subjectRes.data.subjects || []);
        setRooms(roomRes.data.rooms || []);

        const schedule = scheduleRes.data.schedule;

        const subjectId = schedule.subject?._id || schedule.subject;

        const guruRes = await axios.get(
          `${baseURL}/api/guru/by-subject/${subjectId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setGurus(guruRes.data.gurus || []);

        setFormData({
          subject: schedule.subject?._id || schedule.subject || "",
          room_cls: schedule.room_cls?._id || schedule.room_cls || "",
          guruId: schedule.guruId?._id || schedule.guruId || "",
          day: schedule.day?._id || schedule.day || "",
          startTime: dayjs(schedule.startTime, "HH:mm"),
          endTime: dayjs(schedule.endTime, "HH:mm"),
          isExam: schedule.isExam || false,
          examType: schedule.examType || "",
        });
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      } finally {
        setScheduleloading(false);
      }
    };

    setScheduleloading(true);
    fetchFormData();
  }, [id, baseURL]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "subject" && { guruId: "" }),
    }));

    if (name === "subject") {
      const guruRes = await axios.get(
        `${baseURL}/api/guru/by-subject/${value}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setGurus(guruRes.data.gurus || []);
    }
  };

  const handleStartTimeChange = (value) => {
    setFormData((prev) => ({ ...prev, startTime: value }));
  };

  const handleEndTimeChange = (value) => {
    setFormData((prev) => ({ ...prev, endTime: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        startTime: formData.startTime
          ? formData.startTime.format("HH:mm")
          : null,
        endTime: formData.endTime ? formData.endTime.format("HH:mm") : null,
      };
      const response = await axios.put(
        `${baseURL}/api/schedule/${id}`,
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
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <>
      {scheduleloading ? (
        <div className="flex items-center justify-center h-36">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-color5"></div>
          <span className="ml-3 text-color5 font-semibold">Loading...</span>
        </div>
      ) : (
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
                <div className="grid mt-4 grid-cols-1 md:grid-cols-2 space-y-0 gap-2">
                  {/* Mata Pelajaran */}
                  <div>
                    <label className="font-semibold text-gray-700">
                      Mata Pelajaran
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
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
                      value={formData.guruId}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    >
                      <option value="">Pilih Guru</option>
                      {gurus.map((guru) => (
                        <option key={guru._id} value={guru._id}>
                          {guru.userId?.name || "Tanpa Nama"}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Kelas */}
                  <div>
                    <label className="font-semibold text-gray-700">Kelas</label>
                    <select
                      name="room_cls"
                      value={formData.room_cls}
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
                  {/* Hari */}
                  <div>
                    <label
                      htmlFor="day"
                      className="font-semibold text-gray-700"
                    >
                      Hari
                    </label>
                    <select
                      name="day"
                      value={formData.day}
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
                      value={formData.startTime}
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
                      value={formData.endTime}
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
                        checked={formData.isExam}
                        onChange={(e) =>
                          setFormData((prev) => ({
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

                  {/* Jenis Ujian */}
                  {formData.isExam && (
                    <div className="mt-4">
                      <label className="font-semibold text-gray-700">
                        Jenis Ujian
                      </label>
                      <select
                        name="examType"
                        value={formData.examType}
                        onChange={(e) =>
                          setFormData((prev) => ({
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
                  Simpan Perubahan
                </button>
              </form>
            </div>
          </div>
        </LocalizationProvider>
      )}
    </>
  );
};

export default EditSchedule;
