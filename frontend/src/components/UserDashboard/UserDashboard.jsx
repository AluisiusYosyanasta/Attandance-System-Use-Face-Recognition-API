import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, GraduationCap, Users } from "lucide-react";
import useAuth from "../../context/useAuth";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./dashboard.css";
import { Briefcase, BookOpen } from "lucide-react";

const UserDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [value, setValue] = useState(new Date());
  const [eduFilter, setEduFilter] = useState("all");
  const { user } = useAuth();
  const [guruInfo, setGuruInfo] = useState([]);
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    document.title = "Dashboard | Sistem Kehadiran";

    const fetchSummary = async () => {
      try {
        const query = eduFilter !== "all" ? `?edu=${eduFilter}` : "";
        const response = await axios.get(
          `${baseURL}/api/dashboard/summary${query}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setSummary(response.data);
      } catch (error) {
        console.error(error.message);
        if (error.response) {
          alert(error.response.data.error);
        }
      }
    };

    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/room`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setRooms(response.data.rooms);
        if (response.data.rooms.length > 0) {
          setSelectedRoom(response.data.rooms[0]._id);
        }
      } catch (error) {
        console.error("Fetch rooms error:", error.message);
      }
    };

    const fetchGuruInfo = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/dashboard/guru-info`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: eduFilter !== "all" ? { edu: eduFilter } : {},
        });
        setGuruInfo(response.data.data);
      } catch (err) {
        console.error("Fetch guru info error:", err.message);
      }
    };

    fetchSummary();
    fetchRooms();
    fetchGuruInfo();
  }, [baseURL, eduFilter]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/dashboard/schedules`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: selectedRoom ? { room: selectedRoom } : {},
        });
        setSchedules(response.data.schedules);
      } catch (error) {
        console.error("Fetch schedules error:", error.message);
      }
    };

    if (selectedRoom) {
      fetchSchedules();
    }
  }, [baseURL, selectedRoom]);

  const buildScheduleTable = (schedules, selectedRoom) => {
    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
    const timeSet = new Set();
    const scheduleMap = {};
    const defaultBreaks = [
      { startTime: "08:45", endTime: "09:00", label: "ISTIRAHAT" },
      { startTime: "10:10", endTime: "10:25", label: "ISTIRAHAT 2" },
    ];
    defaultBreaks.forEach(({ startTime, endTime, label }) => {
      const timeKey = `${startTime} - ${endTime}`;
      timeSet.add(timeKey);
      if (!scheduleMap[timeKey]) scheduleMap[timeKey] = {};
      days.forEach((day) => {
        scheduleMap[timeKey][day] = { value: label, teacherId: null };
      });
    });

    schedules.forEach((item) => {
      const timeKey = `${item.startTime} - ${item.endTime}`;
      const day = item.day;
      if (!day || !days.includes(day)) return;

      timeSet.add(timeKey);
      if (!scheduleMap[timeKey]) scheduleMap[timeKey] = {};

      const label = item.label?.toUpperCase() || "";
      const value = item.label || item.subject?.sub_name || "-";
      const isSpecialLabel = [
        "UPACARA",
        "ISTIRAHAT",
        "ISTIRAHAT 2",
        "UJIAN",
      ].includes(label);
      const isGlobal = !item.room_cls;
      const teacherId = item.guruId?.userId?._id || null;

      if (isGlobal && isSpecialLabel) {
        scheduleMap[timeKey][day] = { value, teacherId };
      }
    });

    schedules.forEach((item) => {
      const timeKey = `${item.startTime} - ${item.endTime}`;
      const day = item.day;
      if (!day || !days.includes(day)) return;

      if (!scheduleMap[timeKey]) scheduleMap[timeKey] = {};

      const isForSelectedRoom = item.room_cls?._id === selectedRoom;
      const value = item.label || item.subject?.sub_name || "-";
      const teacherId = item.guruId?.userId?._id || null;

      if (isForSelectedRoom) {
        scheduleMap[timeKey][day] = { value, teacherId };
      }
    });

    const sortedTimes = Array.from(timeSet).sort();
    return { scheduleMap, sortedTimes, days };
  };

  const isClassHasSchedule = () => {
    return schedules.some((item) => item.room_cls?._id === selectedRoom);
  };

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-36">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-color5"></div>
        <span className="ml-3 text-color5 font-semibold">Loading...</span>
      </div>
    );
  }

  const stats = [
    {
      icon: <Users className="w-8 h-8 text-red-600" />,
      label: `Total Pegawai ${eduFilter !== "all" ? `(${eduFilter})` : ""}`,
      value: summary.totalStaff || 0,
      borderColor: "border-l-8 border-red-500",
    },
    {
      icon: <User className="w-8 h-8 text-color5" />,
      label: `Guru ${eduFilter !== "all" ? `(${eduFilter})` : ""}`,
      value: summary.totalGuru || 0,
      borderColor: "border-l-8 border-color5",
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-green-600" />,
      label: `Siswa${eduFilter !== "all" ? ` (${eduFilter})` : ""}`,
      value: summary.totalStudent || 0,
      borderColor: "border-l-8 border-green-500",
    },
  ];

  const filteredGuru =
    eduFilter === "all"
      ? summary.guru
      : summary.guru.filter((g) => g.edu_level === eduFilter);

  const getTodayName = () => {
    const now = new Date();
    const dayIndex = now.getDay();
    const dayNames = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return dayNames[dayIndex];
  };

  const today = getTodayName();

  return (
    <div className="p-6 min-h-screen">
      <h3 className="text-2xl font-bold">Sekolah Impian Bunda</h3>
      <h3 className="text-xl mb-6">Halo, {user.user.name} 👋</h3>

      {guruInfo && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
          {/* Wali Kelas */}
          <div className="flex items-center bg-white rounded-lg shadow-sm px-6 py-4 w-full border-l-8 border-blue-500">
            <div className="mr-4">
              <Briefcase className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Wali Kelas</p>
              <p className="text-xl font-semibold text-black">
                {guruInfo.room_name || "-"}
              </p>
            </div>
          </div>

          {/* Mata Pelajaran */}
          <div className="flex items-center bg-white rounded-lg shadow-sm px-6 py-4 w-full border-l-8 border-green-500">
            <div className="mr-4">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Mengajar</p>
              <p className="text-xl font-semibold text-black">
                {guruInfo.subjectList?.length > 0
                  ? guruInfo.subjectList.join(", ")
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`flex items-center bg-white rounded-lg shadow-sm px-6 py-4 w-full ${stat.borderColor}`}
          >
            <div className="mr-4">{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold text-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {summary.guru && (
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow self-start">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-semibold text-gray-700">
                Daftar Pegawai
              </h4>
              <select
                className="border border-gray-200 rounded-md px-3 py-1 text-sm"
                value={eduFilter}
                onChange={(e) => setEduFilter(e.target.value)}
              >
                <option value="all">Semua</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
              </select>
            </div>
            <hr className="border-t border-color7 mb-5" />
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full table-auto border border-color5 text-sm sm:text-[13px] rounded-lg overflow-hidden">
                <thead className="bg-color5 text-white font-semibold">
                  <tr>
                    <th className="border border-color5 px-4 py-3 text-center">
                      No
                    </th>
                    <th className="border border-color5 px-4 py-3 text-center">
                      Nama
                    </th>
                    <th className="border border-color5 px-4 py-3 text-center">
                      Jabatan
                    </th>
                    <th className="border border-color5 px-4 py-3 text-center">
                      Wali Kelas
                    </th>
                    <th className="border border-color5 px-4 py-3 text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuru.map((guru, idx) => (
                    <tr
                      key={guru._id}
                      className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <td className="border border-color9 px-4 py-2 text-center">
                        {idx + 1}
                      </td>
                      <td className="border border-color9 px-4 py-2 text-left">
                        <span className="font-medium">
                          {guru.userId?.name || "-"}
                        </span>{" "}
                        <span className="text-gray-500">{guru.title}</span>
                      </td>
                      <td className="border border-color9 px-4 py-2 text-center">
                        {guru.position}
                      </td>
                      <td className="border border-color9 px-4 py-2 text-center">
                        {guru.room_name || "-"}
                      </td>
                      <td className="border border-color9 px-4 py-2 text-center">
                        {guru.staGuru}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow flex flex-col self-start max-h-[1000px]">
          <h4 className="text-lg font-semibold text-gray-700 text-center">
            Kalender
          </h4>
          <div className="w-full max-w-[300px] mx-auto text-center text-md scale-[1]">
            <Calendar
              value={value}
              onChange={setValue}
              tileClassName={({ date }) => {
                const today = new Date();
                if (
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()
                ) {
                  return "react-calendar__tile--now";
                }
                return "";
              }}
            />
          </div>
        </div>
      </div>

      {rooms.length > 0 && (
        <div className="mt-6 max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Kelas:
          </label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
          >
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.room_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {isClassHasSchedule() ? (
        <div className="mt-5 bg-white p-6 rounded-2xl shadow overflow-x-auto">
          <h4 className="text-lg font-semibold text-gray-700 text-center">
            Jadwal Pelajaran
          </h4>
          <div className="mb-4 flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
              <span className="text-green-700">Anda mengajar</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-color9 border border-color5"></div>
              <span className="text-color5">Hari ini</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
              <span className="text-yellow-400">Upacara / Istirahat</span>
            </div>
          </div>

          <table className="min-w-[800px] w-full table-auto border border-color5 text-sm sm:text-[13px] rounded-lg overflow-hidden">
            <thead className="bg-color5 text-white font-semibold">
              <tr>
                <th className="border border-color5 px-9 py-3 text-center">
                  WAKTU
                </th>
                {["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].map((day) => (
                  <th
                    key={day}
                    className="border border-color5 px-4 py-3 text-center"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const { scheduleMap, sortedTimes, days } = buildScheduleTable(
                  schedules,
                  selectedRoom
                );

                return sortedTimes.map((time) => (
                  <tr key={time} className="even:bg-gray-50 transition-colors">
                    <td className="border border-color9 px-4 py-2 text-center">
                      {time}
                    </td>
                    {days.map((day) => {
                      const slot = scheduleMap[time]?.[day];
                      const value = slot?.value;
                      const teacherId = slot?.teacherId;

                      const upper = value?.toString().toUpperCase();

                      const isUpacara = upper === "UPACARA";
                      const isIstirahat = upper === "ISTIRAHAT";
                      const isIstirahat2 = upper === "ISTIRAHAT 2";
                      const isUjian =
                        upper === "UJIAN" || upper?.startsWith("UJIAN");
                      const isToday = day === today;
                      const isTaughtByMe = teacherId === user.user._id;

                      const displayValue =
                        value !== undefined && value !== null && value !== ""
                          ? value
                          : "-";

                      let bgClass = "";
                      let textClass = "";

                      if (isUpacara) {
                        bgClass = "bg-yellow-100";
                        textClass = "text-yellow-700";
                      } else if (isIstirahat || isIstirahat2) {
                        bgClass = "bg-yellow-100";
                        textClass = "text-yellow-700";
                      } else if (isUjian) {
                        bgClass = "bg-red-100";
                        textClass = "text-red-700";
                      } else if (isTaughtByMe) {
                        bgClass = "bg-green-100";
                        textClass = "text-green-700";
                      } else if (isToday) {
                        bgClass = "bg-color9";
                        textClass = "text-color5";
                      }

                      return (
                        <td
                          key={day}
                          className={`border border-color9 px-4 py-2 text-center font-medium ${bgClass} ${textClass}`}
                        >
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 bg-yellow-50 text-yellow-800 border border-yellow-300 px-4 py-3 rounded-lg">
          <p className="text-sm text-center">
            Kelas ini belum memiliki jadwal.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
