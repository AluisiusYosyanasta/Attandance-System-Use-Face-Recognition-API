import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import { HiChevronRight } from "react-icons/hi";
import { RiCalendarScheduleLine } from "react-icons/ri";

const GuruSchedule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseURL = import.meta.env.VITE_API_URL;

  const getTodayName = () => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return days[new Date().getDay()];
  };

  const groupByDayAndSubject = (schedules) => {
    const map = {};

    schedules.forEach((sch) => {
      const key = `${sch.day}_${sch.subject?._id}`;
      if (!map[key]) {
        map[key] = {
          day: sch.day,
          subject: sch.subject,
          scheduleIds: [sch._id],
          entries: [sch],
        };
      } else {
        map[key].scheduleIds.push(sch._id);
        map[key].entries.push(sch);
      }
    });

    const dayOrder = [
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ];

    return Object.values(map).sort(
      (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
    );
  };

  useEffect(() => {
    document.title = "Jadwal Mengajar | Sistem Kehadiran";
    const fetchSchedules = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/presensi/guru-schedule`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.data.success) {
          setSchedules(res.data.schedules);
        } else {
          setError("Gagal memuat jadwal.");
        }
      } catch (err) {
        console.error("❌ Error fetch schedules:", err);
        setError("Terjadi kesalahan saat mengambil data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [baseURL]);

  const handleFaceAbsensi = (scheduleIds) => {
    const query = scheduleIds.map((id) => `id=${id}`).join("&");
    navigate(`/guru-dashboard/presensi?${query}`);
  };
  const handleEditPresensi = (scheduleIds) => {
    const query = scheduleIds.map((id) => `id=${id}`).join("&");
    navigate(`/guru-dashboard/presensi/edit?${query}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-36">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-color5"></div>
        <span className="ml-3 text-color5 font-semibold">Loading...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="p-5 mt-10 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">
        📅 Jadwal Mengajar {user?.user?.name}
      </h1>
      <div className="flex items-center text-sm text-gray-500 space-x-1">
        <Link to="/guru-dashboard">
          <span className="hover:underline hover:text-color5 cursor-pointer">
            Dashboard
          </span>
        </Link>
        <HiChevronRight className="text-gray-400" />
        <Link to="/guru-dashboard/guru-schedule">
          <span className="hover:underline text-color5 cursor-pointer">
            Jadwal Mengajar
          </span>
        </Link>
      </div>
      <div className="flex justify-end items-center my-8 sm:my-4">
        <Link
          to="/guru-dashboard/presensi/ubahPresensi"
          className="px-3 py-2 text-sm sm:text-base bg-color5 hover:bg-color4 rounded text-white text-center"
        >
          Ubah Presensi Siswa
        </Link>
      </div>

      {schedules.length === 0 ? (
        <p className="text-gray-500 mt-5">Tidak ada jadwal ditemukan.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 pt-2">
          {groupByDayAndSubject(schedules).map((group, idx) => {
            const isToday = getTodayName() === group.day;
            const alreadyPresensi = group.entries.every(
              (item) => item.isPresensiDone
            );

            return (
              <div
                key={idx}
                className="border rounded-xl shadow bg-white px-4 py-4 flex flex-col gap-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-x-2 text-lg font-semibold text-gray-800">
                    <span>
                      <RiCalendarScheduleLine />
                    </span>
                    <span>{group.day}</span>
                    <span className="text-base font-normal text-gray-600 break-words">
                      | {group.subject?.sub_name || "-"}
                    </span>
                  </div>

                  {isToday ? (
                    alreadyPresensi ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <span className="text-sm text-green-600 font-medium flex items-center">
                          ✅ Presensi sudah dilakukan
                        </span>
                        <button
                          onClick={() => handleEditPresensi(group.scheduleIds)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white hover:font-semibold px-4 py-2 rounded-md text-sm transition"
                        >
                          ✏️ Edit Presensi
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleFaceAbsensi(group.scheduleIds)}
                        className="w-full sm:w-auto bg-color5 hover:bg-color4 text-white px-4 py-2 rounded-md text-sm transition"
                      >
                        📸 Lakukan Absensi
                      </button>
                    )
                  ) : (
                    <span className="text-sm text-gray-400 text-left sm:text-right">
                      Hanya tersedia pada hari <strong>{group.day}</strong>
                    </span>
                  )}
                </div>

                {/* List Jadwal */}
                <ul className="list-disc text-left text-sm text-gray-700 pl-5 space-y-1 w-full">
                  {group.entries.map((item) => (
                    <li key={item._id}>
                      Kelas{" "}
                      <span className="font-medium">
                        {item.room_cls?.room_name || "-"}
                      </span>{" "}
                      — {item.startTime} - {item.endTime}{" "}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GuruSchedule;
