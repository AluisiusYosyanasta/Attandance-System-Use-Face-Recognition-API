import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, GraduationCap, Presentation, Users } from "lucide-react";
import useAuth from "../../context/useAuth";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./dashboard.css";

const AdminSummary = () => {
  const [summary, setSummary] = useState(null);
  const [value, setValue] = useState(new Date());
  const [eduFilter, setEduFilter] = useState("all");
  const { user } = useAuth();
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
    fetchSummary();
  }, [baseURL, eduFilter]);

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

  return (
    <div className="p-6 min-h-screen">
      <h3 className="text-2xl font-bold">Sekolah Impian Bunda</h3>
      <h3 className="text-xl mb-6">Halo, {user.user.name} 👋</h3>

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start min-h-[400px]">
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
          <div className="w-full max-w-[300px] mx-auto text-center text-md  scale-[1]">
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
              tileContent={({ date }) => {
                const events = [];
                if (events.includes(date.getDate())) {
                  return (
                    <div className="w-1 h-1 bg-pink-500 rounded-full mx-auto mt-1"></div>
                  );
                }
                return null;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSummary;
