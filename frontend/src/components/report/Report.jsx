import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { HiChevronRight } from "react-icons/hi";

const Report = () => {
  const navigate = useNavigate();

  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    document.title = "Laporan Presensi | Sistem Kehadiran";

    const fetchKelas = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/report`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setKelas(res.data);
      } catch (err) {
        console.error("❌ Gagal memuat kelas:", err);
        setError("Terjadi kesalahan saat memuat data kelas.");
      } finally {
        setLoading(false);
      }
    };

    fetchKelas();
  }, [baseURL]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-36">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-color5"></div>
        <span className="ml-3 text-color5 font-semibold">Loading...</span>
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-5 mt-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Laporan Presensi
      </h1>

      <div className="flex items-center text-sm text-gray-500 space-x-1 mb-6">
        <Link to="/admin-dashboard">
          <span className="hover:underline hover:text-color5 cursor-pointer">
            Dashboard
          </span>
        </Link>
        <HiChevronRight className="text-gray-400" />
        <Link to="/admin-dashboard/report">
          <span className="hover:underline text-color5 cursor-pointer">
            List
          </span>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        <table className="min-w-full text-sm text-gray-700 text-center border border-gray-200">
          <thead className="bg-color5 uppercase text-white">
            <tr>
              <th className="px-5 py-3">Kelas</th>
              <th className="px-5 py-3">Wali Kelas</th>
              <th className="px-5 py-3">Tahun Ajaran</th>
              <th className="px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {kelas.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-5 py-3">{item.room_name}</td>
                <td className="px-5 py-3 text-left">
                  {item.guruId && item.guruId.userId
                    ? `${item.guruId.userId.name} ${item.guruId.title || ""} `
                    : "-"}
                </td>
                <td className="px-5 py-3">{item.school_year || "-"}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() =>
                      navigate(`/admin-dashboard/report/${item._id}`)
                    }
                    className="inline-block px-4 py-1.5 text-sm bg-color5 text-white rounded hover:bg-color4 transition"
                  >
                    Lihat Laporan
                  </button>
                </td>
              </tr>
            ))}
            {kelas.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  Tidak ada data kelas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Report;
