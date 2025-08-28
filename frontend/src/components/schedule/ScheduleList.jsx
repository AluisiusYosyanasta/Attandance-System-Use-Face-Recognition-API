import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import { getColumns } from "../../utils/ScheduleColumns.jsx";
import axios from "axios";
import { HiChevronRight } from "react-icons/hi";

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [schLoading, setSchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const baseURL = import.meta.env.VITE_API_URL;
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rooms, setRooms] = useState([]);

  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(
    () =>
      searchParams.get("kelas") || localStorage.getItem("filterKelas") || "all"
  );

  const [selectedDay, setSelectedDay] = useState(
    () =>
      searchParams.get("hari") || localStorage.getItem("filterHari") || "all"
  );

  const customStyles = {
    rows: { style: { minHeight: "56px", fontSize: "13px" } },
    headCells: {
      style: {
        backgroundColor: "#4199E1",
        color: "white",
        fontWeight: "bold",
        fontSize: "13px",
        justifyContent: "center",
        textAlign: "center",
      },
    },
    cells: {
      style: {
        padding: "8px 12px",
        width: "200px",
        justifyContent: "center",
        textAlign: "center",
      },
    },
  };
  const onScheduleDelete = () => {
    fetchSchedules();
  };

  const fetchSchedules = useCallback(async () => {
    setSchLoading(true);
    try {
      const response = await axios.get(`${baseURL}/api/schedule`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        const data = response.data.schedules.map((sch, index) => ({
          _id: sch._id,
          subject: sch.subject,
          guruId: sch.guruId,
          room_cls: sch.room_cls,
          day: sch.day,
          startTime: sch.startTime,
          endTime: sch.endTime,
          isExam: sch.isExam,
          examType: sch.examType,
          sno: index + 1,
        }));
        setSchedules(data);
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    } finally {
      setSchLoading(false);
    }
  }, [baseURL]);

  useEffect(() => {
    document.title = "Jadwal Pelajaran | Sistem Kehadiran";
    fetchSchedules();
  }, [fetchSchedules]);

  const handleRowSelected = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  const handleDeleteSelected = async () => {
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedRows.map((row) =>
          axios.delete(`${baseURL}/api/schedule/${row._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setToggleCleared(!toggleCleared);
      fetchSchedules();
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("filterKelas", tab);
  };

  const handleDayChange = (e) => {
    const hari = e.target.value;
    setSelectedDay(hari);
    localStorage.setItem("filterHari", hari);
  };

  const filteredSchedules = schedules.filter((sch) => {
    const guruName = sch.guruId?.userId?.name || "";
    const dayStr = sch.day || "";
    const roomMatch = activeTab === "all" || sch.room_cls?._id === activeTab;
    const dayMatch = selectedDay === "all" || dayStr === selectedDay;

    return (
      roomMatch &&
      dayMatch &&
      (guruName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dayStr.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/room`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.data.success) setRooms(res.data.rooms);
      } catch (err) {
        console.error("Gagal mengambil data kelas:", err);
      }
    };
    fetchRooms();
  }, [baseURL]);

  return (
    <>
      {schLoading ? (
        <div className="flex items-center justify-center h-36">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-color5"></div>
          <span className="ml-3 text-color5 font-semibold">Loading...</span>
        </div>
      ) : (
        <div className="p-5 mt-10 max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Daftar Jadwal Kelas
          </h1>
          <div className="mx-auto flex items-center text-sm text-gray-500 space-x-1">
            <Link to="/admin-dashboard">
              <span className="hover:underline hover:text-color5 cursor-pointer">
                Dashboard
              </span>
            </Link>
            <HiChevronRight className="text-gray-400" />
            <Link to="/admin-dashboard/schedules">
              <span className="hover:underline text-color5 cursor-pointer">
                List
              </span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center my-8 sm:my-4 space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              placeholder="Cari Guru dan Tanggal"
              className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Link
              to="/admin-dashboard/add-schedule"
              className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base bg-color5 hover:bg-color4 rounded-md text-white text-center"
            >
              Tambah Jadwal
            </Link>
          </div>

          {selectedRows.length > 0 && (
            <div className="flex flex-row justify-between sm:items-center my-8 sm:my-4 space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => setShowConfirm(true)}
                className="px-3 py-1 rounded text-white font-semibold bg-red-500 hover:bg-red-600"
              >
                Hapus Terpilih
              </button>
              <span className="text-sm font-semibold text-red-500">
                {selectedRows.length} dipilih
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center my-8 sm:my-4 space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
              <button
                onClick={() => handleTabChange("all")}
                className={`px-3 py-1 rounded ${
                  activeTab === "all" ? "bg-color5 text-white" : "bg-gray-200"
                }`}
              >
                Semua Kelas
              </button>
              {rooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => handleTabChange(room._id)}
                  className={`px-3 py-1 rounded text-sm ${
                    activeTab === room._id
                      ? "bg-color5 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {room.room_name}
                </button>
              ))}
            </div>
            <select
              className="px-3 py-1.5 bg-color5 text-white rounded-md text-sm sm:text-base w-full sm:w-auto text-left"
              value={selectedDay}
              onChange={handleDayChange}
            >
              <option className="bg-white text-black" value="all">
                Semua Hari
              </option>
              <option className="bg-white text-black" value="Senin">
                Senin
              </option>
              <option className="bg-white text-black" value="Selasa">
                Selasa
              </option>
              <option className="bg-white text-black" value="Rabu">
                Rabu
              </option>
              <option className="bg-white text-black" value="Kamis">
                Kamis
              </option>
              <option className="bg-white text-black" value="Jumat">
                Jumat
              </option>
              <option className="bg-white text-black" value="Sabtu">
                Sabtu
              </option>
              <option className="bg-white text-black" value="Minggu">
                Minggu
              </option>
            </select>
          </div>

          <div className="mt-3 sm:mt-5 rounded-lg shadow-md overflow-hidden">
            <DataTable
              columns={getColumns(onScheduleDelete)}
              data={filteredSchedules}
              progressPending={schLoading}
              pagination
              highlightOnHover
              customStyles={customStyles}
              responsive
              striped
              selectableRows
              onSelectedRowsChange={handleRowSelected}
              clearSelectedRows={toggleCleared}
            />
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white w-full max-w-sm mx-4 p-6 rounded shadow-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              Konfirmasi
            </h2>
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus {selectedRows.length} jadwal
              terpilih?
            </p>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  await handleDeleteSelected();
                  setShowConfirm(false);
                }}
                className="px-4 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleList;
