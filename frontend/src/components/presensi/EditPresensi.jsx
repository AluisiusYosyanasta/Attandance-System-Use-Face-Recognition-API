import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const EditPresensi = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const baseURL = import.meta.env.VITE_API_URL;

  const [scheduleIds, setScheduleIds] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ids = params.getAll("id");
    setScheduleIds(ids);
  }, [location.search]);

  useEffect(() => {
    document.title = "Edit Presensi | Sistem Kehadiran";
    const fetchPresensi = async () => {
      if (!scheduleIds.length) return;

      try {
        setLoading(true);
        const res = await axios.post(
          `${baseURL}/api/presensi/fetch-presensi-by-schedule`,
          { scheduleIds },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.success) {
          setStudentData(
            res.data.data.map((s) => ({
              ...s,
              finalStatus: s.status,
              time: s.time,
            }))
          );
        }
      } catch (err) {
        console.error("❌ Error fetch presensi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPresensi();
  }, [scheduleIds, baseURL]);

  const updateStatus = (studentId, status) => {
    setStudentData((prev) =>
      prev.map((s) =>
        s.studentId === studentId
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
    try {
      setLoading(true);
      const payload = studentData.map((s) => ({
        presensiIds: s.presensiIds,
        status: s.finalStatus,
        time: s.time,
      }));

      await axios.put(
        `${baseURL}/api/presensi/update-presensi`,
        { updates: payload },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("✅ Presensi berhasil diperbarui.");
      navigate("/guru-dashboard/guru-schedule");
    } catch (err) {
      console.error("❌ Gagal update:", err);
      alert("Gagal memperbarui data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        ✏️ Edit Presensi
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
            {studentData.map((s, index) => (
              <tr key={s.studentId || index} className="hover:bg-gray-50">
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
                    {s.finalStatus || "Belum dipilih"}
                  </span>
                </td>
                <td className="px-4 py-2 border">
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                    <button
                      onClick={() => updateStatus(s.studentId, "hadir")}
                      className={`px-3 py-1 rounded font-medium w-full sm:w-auto transition ${
                        s.finalStatus === "hadir"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 hover:bg-green-100"
                      }`}
                    >
                      Hadir
                    </button>
                    <button
                      onClick={() => updateStatus(s.studentId, "tidak hadir")}
                      className={`px-3 py-1 rounded font-medium w-full sm:w-auto transition ${
                        s.finalStatus === "tidak hadir"
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 hover:bg-red-100"
                      }`}
                    >
                      Tidak Hadir
                    </button>
                    <button
                      onClick={() => updateStatus(s.studentId, "sakit")}
                      className={`px-3 py-1 rounded font-medium w-full sm:w-auto transition ${
                        s.finalStatus === "sakit"
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-200 hover:bg-yellow-100"
                      }`}
                    >
                      Sakit
                    </button>
                    <button
                      onClick={() => updateStatus(s.studentId, "izin")}
                      className={`px-3 py-1 rounded font-medium w-full sm:w-auto transition ${
                        s.finalStatus === "izin"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 hover:bg-blue-100"
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

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => navigate("/guru-dashboard/guru-schedule")}
          className="px-6 py-2 rounded text-gray-700 bg-gray-200 hover:bg-gray-300 font-medium transition"
        >
          Kembali
        </button>

        <button
          disabled={loading}
          onClick={handleSubmit}
          className={`px-6 py-2 rounded text-white font-medium transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-color5 hover:bg-color4"
          }`}
        >
          {loading ? "⏳ Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
};

export default EditPresensi;
