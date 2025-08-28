import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { HiChevronRight } from "react-icons/hi";
import logo from "../../assets/LoginAssets/logo-impianbunda.png";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "./print.css";

const ReportDetail = () => {
  const { roomId } = useParams();
  const [kelas, setKelas] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [roomRange, setRoomRange] = useState({ start: null, end: null });

  const reportRef = useRef();
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    document.title = "Detail Laporan Presensi";

    const fetchLaporan = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/report/${roomId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setKelas(res.data.room);
        setData(res.data.siswa);

        const start = dayjs(res.data.room.startDate);
        const end = dayjs(res.data.room.endDate);

        setStartDate(start);
        setEndDate(end);
        setRoomRange({ start, end });
      } catch (err) {
        console.error("❌ Gagal mengambil detail laporan:", err);
        setError("Terjadi kesalahan saat mengambil data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLaporan();
  }, [roomId, baseURL]);
  const fetchWithFilter = async () => {
    if (!startDate || !endDate) return;

    try {
      const res = await axios.get(
        `${baseURL}/api/report/${roomId}?start=${startDate.format(
          "YYYY-MM-DD"
        )}&end=${endDate.format("YYYY-MM-DD")}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setKelas(res.data.room);
      setData(res.data.siswa);
    } catch (err) {
      console.error("❌ Gagal filter laporan:", err);
      setError("Gagal memfilter data presensi.");
    }
  };

  const handleCetakPDF = () => {
    const element = reportRef.current;

    const options = {
      margin: [10, 10, 10, 10],
      filename: `Laporan_Presensi_Kelas_${kelas?.room_name}_${kelas?.school_year}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "landscape",
      },
      pagebreak: {
        mode: ["css", "legacy"],
      },
    };

    html2pdf().set(options).from(element).save();
  };

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
        Detail Laporan Presensi
      </h1>

      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 space-x-1">
        <div className="flex items-center text-sm text-gray-500 space-x-1 mb-6">
          <Link to="/admin-dashboard">
            <span className="hover:underline hover:text-color5 cursor-pointer">
              Dashboard
            </span>
          </Link>
          <HiChevronRight className="text-gray-400" />
          <Link to="/admin-dashboard/report">
            <span className="hover:underline hover:text-color5 cursor-pointer">
              List
            </span>
          </Link>
          <HiChevronRight className="text-gray-400" />
          <Link to={`/admin-dashboard/report/${roomId}`}>
            <span className="hover:underline text-color5 cursor-pointer">
              Mata Pelajaran
            </span>
          </Link>
        </div>
      </div>

      {/* Header + Tombol Cetak */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <p className="text-gray-700 text-sm sm:text-base">
          Kelas: <strong>{kelas?.room_name}</strong> | Tahun Ajaran:{" "}
          <strong>{kelas?.school_year}</strong>
        </p>
        <button
          onClick={handleCetakPDF}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400 text-sm w-full sm:w-auto"
        >
          Cetak Laporan
        </button>
      </div>

      {/* Pilih Tanggal */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4 text-sm">
          <div className="flex-1">
            <label className="block text-gray-600 font-medium mb-1">
              Dari Tanggal
            </label>
            <DatePicker
              value={startDate}
              onChange={(date) => setStartDate(date)}
              maxDate={roomRange.end}
              minDate={roomRange.start}
              format="DD-MM-YYYY"
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-600 font-medium mb-1">
              Sampai Tanggal
            </label>
            <DatePicker
              value={endDate}
              onChange={(date) => setEndDate(date)}
              maxDate={roomRange.end}
              minDate={roomRange.start}
              format="DD-MM-YYYY"
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </div>
          <div>
            <button
              onClick={fetchWithFilter}
              className="w-full sm:w-auto mt-2 sm:mt-6 px-4 py-2 bg-color5 text-white rounded hover:bg-color4"
            >
              Tampilkan
            </button>
          </div>
        </div>
      </LocalizationProvider>

      {/* Tabel Laporan */}
      <div
        ref={reportRef}
        className="bg-white p-4 sm:p-6 border border-gray-200 rounded-lg shadow print:shadow-none print:p-4"
      >
        {/* Header Sekolah */}
        <div className="pb-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <img
              src={logo}
              alt="Logo Sekolah"
              className="w-[100px] h-[100px] object-contain"
            />
            <div className="text-center flex-1">
              <h2 className="text-lg sm:text-xl font-bold uppercase">
                {kelas?.edu_level || ""} Impian Bunda
              </h2>
              <p className="text-sm sm:text-base">
                Jl. Flamboyan Utama III No.1A 15, RT.15/RW.10
              </p>
              <p className="text-sm sm:text-base">
                Duri Kosambi, Kecamatan Cengkareng, Kota Jakarta Barat, DKI
                Jakarta 11750
              </p>
              <p className="text-sm sm:text-base">Telp: (021) 5410742</p>
            </div>
          </div>

          <hr className="my-4 border-t-2 border-black" />
          <h3 className="text-lg sm:text-xl font-semibold underline text-center mt-2">
            Laporan Rekap Presensi Siswa
          </h3>
        </div>

        {/* Informasi Kelas */}
        <div className="text-left mb-4 text-sm sm:text-base">
          <p>
            <strong>Kelas:</strong> {kelas?.room_name}
          </p>
          <p>
            <strong>Tahun Ajaran:</strong> {kelas?.school_year}
          </p>
          <p>
            <strong>Wali Kelas:</strong> {kelas?.wali_kelas}
          </p>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto print:overflow-visible page-break">
          <table className="w-full text-sm text-gray-700 text-center border border-gray-300 break-inside-auto">
            <thead className="bg-color5 text-white uppercase">
              <tr>
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">NIK</th>
                <th className="px-4 py-2">Hadir</th>
                <th className="px-4 py-2">Sakit</th>
                <th className="px-4 py-2">Izin</th>
                <th className="px-4 py-2">Tidak Hadir</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr
                  key={row.siswa._id}
                  className="hover:bg-gray-50 break-inside-avoid"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 text-left">{row.siswa.name}</td>
                  <td className="px-4 py-2">{row.siswa.nik}</td>
                  <td className="px-4 py-2 bg-green-100 font-semibold">
                    {row.rekap.hadir}
                  </td>
                  <td className="px-4 py-2 bg-red-100 font-semibold">
                    {row.rekap.sakit}
                  </td>
                  <td className="px-4 py-2 bg-yellow-100 font-semibold">
                    {row.rekap.izin}
                  </td>
                  <td className="px-4 py-2 bg-gray-100 font-semibold">
                    {row.rekap["tidak hadir"]}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    Tidak ada data presensi siswa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
