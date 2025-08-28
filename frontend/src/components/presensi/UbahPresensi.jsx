import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { HiChevronRight } from "react-icons/hi";

const UbahPresensi = () => {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [mapelList, setMapelList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [noDataWarning, setNoDataWarning] = useState("");

  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    document.title = "Ubah Data Presensi | Sistem Kehadiran";

    const fetchKelas = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/room`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setKelasList(res.data.rooms);
      } catch (err) {
        console.error("❌ Gagal memuat kelas:", err);
        alert("Gagal memuat data kelas.");
      }
    };

    fetchKelas();
  }, [baseURL]);

  useEffect(() => {
    if (!selectedKelas) return;

    const fetchMapel = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/presensi/schedules`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: { roomId: selectedKelas },
        });
        setMapelList(res.data.mapel || []);
      } catch (err) {
        console.error("❌ Gagal memuat mapel:", err);
        alert("Gagal memuat data pelajaran.");
      }
    };

    fetchMapel();
  }, [baseURL, selectedKelas]);

  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const res = await axios.post(
          `${baseURL}/api/presensi/load-siswa-edit`,
          {
            roomId: selectedKelas,
            subjectId: selectedMapel,
            date: selectedDate,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.success) {
          if (res.data.students.length === 0) {
            setNoDataWarning(
              "Kelas ini belum melakukan presensi pada tanggal tersebut."
            );
          } else {
            setNoDataWarning("");
          }
          setStudentList(res.data.students);
        }
      } catch (err) {
        console.error("❌ Gagal memuat siswa:", err);
        alert("Gagal memuat data siswa.");
      }
    };

    if (selectedKelas && selectedMapel && selectedDate) {
      fetchSiswa();
    }
  }, [baseURL, selectedKelas, selectedMapel, selectedDate]);

  const updateStatus = (id, status) => {
    setStudentList((prev) =>
      prev.map((s) => (s._id === id ? { ...s, finalStatus: status } : s))
    );
  };
  const handleSubmit = async () => {
    if (!selectedKelas || !selectedMapel || !selectedDate) {
      alert("Lengkapi semua data terlebih dahulu.");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        roomId: selectedKelas,
        subjectId: selectedMapel,
        date: selectedDate,
        presensiList: studentList.map((s) => ({
          studentId: s._id,
          status: s.finalStatus,
          time: s.time || null,
        })),
      };

      const res = await axios.put(
        `${baseURL}/api/presensi/update-ubah`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        alert("✅ Perubahan presensi berhasil disimpan.");
        navigate("/guru-dashboard/guru-schedule");
      } else {
        alert("❌ Gagal menyimpan presensi.");
      }
    } catch (err) {
      console.error("❌ Gagal submit presensi:", err);
      alert("Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 px-4 md:px-6 lg:px-10">
      <h1 className="max-w-4xl mx-auto text-lg md:text-xl font-semibold text-gray-800 mb-2">
        Ubah Data Presensi
      </h1>

      <div className="max-w-4xl mx-auto flex flex-wrap items-center text-xs sm:text-sm text-gray-500 space-x-1">
        <Link to="/guru-dashboard">
          <span className="hover:underline hover:text-color5 cursor-pointer">
            Dashboard
          </span>
        </Link>
        <HiChevronRight className="text-gray-400" />
        <Link to="/guru-dashboard/guru-schedule">
          <span className="hover:underline hover:text-color5 cursor-pointer">
            Jadwal Mengajar
          </span>
        </Link>
        <HiChevronRight className="text-gray-400" />
        <Link to="/guru-dashboard/presensi/ubahPresensi">
          <span className="hover:underline text-color5 cursor-pointer">
            Ubah Presensi
          </span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto mt-5 bg-white p-6 sm:p-8 rounded-md shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pilih Kelas:
          </label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={selectedKelas}
            onChange={(e) => {
              setSelectedKelas(e.target.value);
              setSelectedMapel("");
              setSelectedDate("");
            }}
          >
            <option value="">-- Pilih Kelas --</option>
            {kelasList.map((kelas) => (
              <option key={kelas._id} value={kelas._id}>
                {kelas.room_name}
              </option>
            ))}
          </select>
        </div>

        {selectedKelas && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Mata Pelajaran:
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={selectedMapel}
              onChange={(e) => {
                setSelectedMapel(e.target.value);
                setSelectedDate("");
              }}
            >
              <option value="">-- Pilih Mata Pelajaran --</option>
              {mapelList.map((mapel) => (
                <option key={mapel._id} value={mapel._id}>
                  {mapel.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedMapel && (
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Tanggal:
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        )}

        {noDataWarning && (
          <div className="mt-2 text-red-600 text-sm font-medium">
            ⚠️ {noDataWarning}
          </div>
        )}
      </div>

      {studentList.length > 0 && (
        <div className="max-w-5xl mx-auto mt-8 overflow-x-auto bg-white rounded-md ">
          <h4 className="text-md font-semibold text-gray-700 mb-3 px-4 pt-4">
            Daftar Siswa
          </h4>
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-color5 text-white">
              <tr>
                <th className="px-4 py-2 border text-center">Nama</th>
                <th className="px-1 py-2 border text-center">Kelas</th>
                <th className="px-1 py-2 border text-center">Jam</th>
                <th className="px-4 py-2 border text-center">Status</th>
                <th className="px-4 py-2 border text-center">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {studentList.map((s, idx) => (
                <tr key={`${s._id}-${idx}`} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">{s.name}</td>
                  <td className="px-1 py-2 border text-center">{s.room}</td>
                  <td className="px-1 py-2 border text-center">
                    {s.time || "-"}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        s.finalStatus === "hadir"
                          ? "bg-green-100 text-green-700"
                          : s.finalStatus === "tidak hadir"
                          ? "bg-red-100 text-red-700"
                          : s.finalStatus === "sakit"
                          ? "bg-yellow-100 text-yellow-800"
                          : s.finalStatus === "izin"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {s.finalStatus || "belum dipilih"}
                    </span>
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="flex flex-wrap justify-center gap-2">
                      {["hadir", "tidak hadir", "sakit", "izin"].map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => updateStatus(s._id, status)}
                            className={`px-3 py-1 rounded font-medium transition text-xs sm:text-sm ${
                              s.finalStatus === status
                                ? {
                                    hadir: "bg-green-600 text-white",
                                    "tidak hadir": "bg-red-600 text-white",
                                    sakit: "bg-yellow-500 text-white",
                                    izin: "bg-blue-500 text-white",
                                  }[status]
                                : "bg-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {status}
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-4 text-right">
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-color5 text-white px-4 py-2 rounded hover:bg-color4 disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UbahPresensi;
