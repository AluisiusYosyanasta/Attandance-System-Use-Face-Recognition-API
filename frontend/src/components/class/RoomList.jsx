import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { getColumns } from "../../utils/RoomColumns.jsx";
import axios from "axios";
import { HiChevronRight } from "react-icons/hi";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const baseURL = import.meta.env.VITE_API_URL;

  const customStyles = {
    rows: {
      style: {
        minHeight: "56px",
        fontSize: "13px",
      },
    },
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
      },
    },
  };

  const onRoomDelete = () => {
    fetchRooms();
  };
  const fetchRooms = useCallback(async () => {
    setRoomLoading(true);
    try {
      const response = await axios.get(`${baseURL}/api/room`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        const data = response.data.rooms.map((room, index) => ({
          _id: room._id,
          room_name: room.room_name,
          edu_level: room.edu_level,
          guruId: room.guruId,
          school_year: room.school_year,
          sno: index + 1,
        }));
        setRooms(data);
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    } finally {
      setRoomLoading(false);
    }
  }, [baseURL]);
  const handleRowSelected = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  const handleDeleteSelected = async () => {
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedRows.map((row) =>
          axios.delete(`${baseURL}/api/room/${row._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setToggleCleared(!toggleCleared);
      fetchRooms();
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  useEffect(() => {
    document.title = "Kelas | Attendance System";
    fetchRooms();
  }, [fetchRooms]);

  const filteredRooms = rooms.filter(
    (room) =>
      room.room_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.guruId?.userId?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      room.school_year?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.edu_level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {roomLoading ? (
        <div className="flex items-center justify-center h-36">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-color5"></div>
          <span className="ml-3 text-color5 font-semibold">Loading...</span>
        </div>
      ) : (
        <div className="p-5 mt-10 max-w-5xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Daftar Kelas
          </h1>

          <div className="flex items-center text-sm text-gray-500 space-x-1 mb-4">
            <Link to="/admin-dashboard">
              <span className="hover:underline hover:text-color5 cursor-pointer">
                Dashboard
              </span>
            </Link>
            <HiChevronRight className="text-gray-400" />
            <Link to="/admin-dashboard/rooms">
              <span className="hover:underline text-color5 cursor-pointer">
                List
              </span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-6">
            <input
              type="text"
              placeholder="Cari Kelas"
              className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Link
              to="/admin-dashboard/add-room"
              className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base bg-color5 hover:bg-color4 rounded text-white text-center"
            >
              Tambah Kelas
            </Link>
          </div>
          {selectedRows.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 rounded text-white font-semibold bg-red-500 hover:bg-red-600"
              >
                Hapus Terpilih
              </button>
              <span className="text-sm font-semibold text-red-500">
                {selectedRows.length} dipilih
              </span>
            </div>
          )}

          <div className="rounded-lg shadow-md overflow-hidden">
            <DataTable
              columns={getColumns(onRoomDelete)}
              data={filteredRooms}
              progressPending={roomLoading}
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
              Apakah Anda yakin ingin menghapus {selectedRows.length} kelas?
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

export default RoomList;
