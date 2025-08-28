import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { getColumns } from "../../utils/StudentColumns.jsx";
import axios from "axios";
import { HiChevronRight } from "react-icons/hi";

const StudentList = () => {
  const [students, setstudents] = useState([]);
  const [studentLoading, setstudentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");

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
        justifyContent: "center",
        textAlign: "center",
      },
    },
  };

  const onstudentDelete = () => {
    fetchstudents();
  };
  const fetchstudents = useCallback(async () => {
    setstudentLoading(true);
    try {
      const response = await axios.get(`${baseURL}/api/student`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        const data = response.data.students.map((student, index) => ({
          _id: student._id,
          nik: student.nik,
          name: student.name,
          gender: student.gender,
          room_cls: student.roomId?.room_name || "-",
          faceEnrolled: student.faceEnrolled,
          sno: index + 1,
        }));
        setstudents(data);
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    } finally {
      setstudentLoading(false);
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
          axios.delete(`${baseURL}/api/student/${row._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setToggleCleared(!toggleCleared);
      fetchstudents();
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  useEffect(() => {
    document.title = "Wajah Siswa | Sistem Kehadiran";

    const fetchKelas = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/room`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setKelasList(res.data.rooms);
      } catch (err) {
        console.error("Gagal mengambil daftar kelas:", err);
      }
    };

    fetchKelas();
  }, [baseURL]);

  useEffect(() => {
    fetchstudents();
  }, [fetchstudents]);

  const filteredstudents = students.filter(
    (student) =>
      (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.gender?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedKelas === "" || student.room_cls === selectedKelas)
  );

  return (
    <>
      {studentLoading ? (
        <div className="flex items-center justify-center h-36">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-color5"></div>
          <span className="ml-3 text-color5 font-semibold">Loading...</span>
        </div>
      ) : (
        <div className="p-5 mt-10 max-w-5xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Daftar Siswa
          </h1>

          <div className="flex items-center text-sm text-gray-500 space-x-1 mb-4">
            <Link to="/admin-dashboard">
              <span className="hover:underline hover:text-color5 cursor-pointer">
                Dashboard
              </span>
            </Link>
            <HiChevronRight className="text-gray-400" />
            <Link to="/admin-dashboard/students">
              <span className="hover:underline text-color5 cursor-pointer">
                List
              </span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-6">
            <input
              type="text"
              placeholder="Cari Siswa"
              className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base border rounded"
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
            >
              <option value="">Semua Kelas</option>
              {kelasList.map((kelas) => (
                <option key={kelas._id} value={kelas.room_name}>
                  {kelas.room_name}
                </option>
              ))}
            </select>
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
              columns={getColumns(onstudentDelete)}
              data={filteredstudents}
              progressPending={studentLoading}
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
              Apakah Anda yakin ingin menghapus {selectedRows.length} siswa?
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

export default StudentList;
