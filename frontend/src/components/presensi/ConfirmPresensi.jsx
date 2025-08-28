import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const ConfirmPresensi = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentList = [], scheduleIds = [] } = location.state || {};

  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const detectedIds = studentList.map((s) => s.id);

        const res = await axios.post(
          `${baseURL}/api/presensi/student-confirm`,
          {
            scheduleIds,
            detectedStudentIds: detectedIds,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.success) {
          setStudentData(
            res.data.siswa.map((s) => ({
              ...s,
              finalStatus: s.status === "hadir" ? "hadir" : null,
              time:
                s.status === "hadir"
                  ? new Date().toLocaleTimeString("id-ID")
                  : null,
            }))
          );
        }
      } catch (err) {
        console.error("❌ Error fetch siswa:", err);
        alert("Gagal memuat data siswa.");
      }
    };

    if (scheduleIds.length > 0) fetchSiswa();
  }, [baseURL, scheduleIds, studentList]);

  const updateStatus = (id, status) => {
    setStudentData((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              finalStatus: status,
              time: new Date().toLocaleTimeString("id-ID"),
            }
          : s
      )
    );
  };

  const handleSubmit = async () => {
    const presensiList = studentData
      .filter((s) => s.finalStatus)
      .map((s) => ({
        studentId: s.id,
        status: s.finalStatus,
        time: s.time,
      }));

    if (presensiList.length === 0) {
      return alert("⚠️ Tidak ada data presensi yang dipilih.");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${baseURL}/api/presensi/submit-presensi`,
        {
          presensiList,
          scheduleIds,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        alert(`✅ Pesensi berhasil disimpan.`);
        navigate("/guru-dashboard/guru-schedule");
      } else {
        alert("⚠️ Gagal menyimpan presensi.");
      }
    } catch (err) {
      console.error("❌ Gagal menyimpan:", err);
      alert("Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        📋 Konfirmasi Presensi
      </h2>

      <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        <table className="w-full text-sm text-gray-700 bg-white">
          <thead className="bg-color5 text-white">
            <tr>
              <th className="px-4 py-2 border text-center">Nama</th>
              <th className="px-4 py-2 border text-center">Kelas</th>
              <th className="px-4 py-2 border text-center">Jam</th>
              <th className="px-4 py-2 border text-center">Status</th>
              <th className="px-4 py-2 border text-center">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {studentData.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border text-center">{s.name}</td>
                <td className="px-4 py-2 border text-center">{s.class}</td>
                <td className="px-4 py-2 border text-center">
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
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                    <button
                      onClick={() => updateStatus(s.id, "hadir")}
                      className={`px-3 py-1 rounded font-medium w-full sm:w-auto transition ${
                        s.finalStatus === "hadir"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 hover:bg-green-100"
                      }`}
                    >
                      Hadir
                    </button>
                    <button
                      onClick={() => updateStatus(s.id, "tidak hadir")}
                      className={`px-3 py-1 rounded font-medium w-full sm:w-auto transition ${
                        s.finalStatus === "tidak hadir"
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 hover:bg-red-100"
                      }`}
                    >
                      Tidak Hadir
                    </button>
                    <button
                      onClick={() => updateStatus(s.id, "sakit")}
                      className={`px-3 py-1 rounded font-medium w-full sm:w-auto transition ${
                        s.finalStatus === "sakit"
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-200 hover:bg-yellow-200"
                      }`}
                    >
                      Sakit
                    </button>
                    <button
                      onClick={() => updateStatus(s.id, "izin")}
                      className={`px-3 py-1 rounded font-medium w-full sm:w-auto transition ${
                        s.finalStatus === "izin"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-blue-200"
                      }`}
                    >
                      Izin
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          disabled={loading}
          onClick={handleSubmit}
          className={`px-6 py-2 rounded text-white font-medium transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-color5 hover:bg-color4"
          }`}
        >
          {loading ? "⏳ Menyimpan..." : "Simpan Presensi"}
        </button>
      </div>
    </div>
  );
};

export default ConfirmPresensi;
