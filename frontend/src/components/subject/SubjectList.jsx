import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { getColumns } from "../../utils/SubjectColumns.jsx";
import axios from "axios";
import { HiChevronRight } from "react-icons/hi";

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [subLoading, setSubLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  const onSubjectDelete = () => {
    fetchSubjects();
  };
  const fetchSubjects = useCallback(async () => {
    setSubLoading(true);
    try {
      const response = await axios.get(`${baseURL}/api/subject`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        const data = response.data.subjects.map((sub, index) => ({
          _id: sub._id,
          sub_code: sub.sub_code,
          sub_name: sub.sub_name,
          sno: index + 1,
        }));
        setSubjects(data);
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    } finally {
      setSubLoading(false);
    }
  }, [baseURL]);

  useEffect(() => {
    document.title = "Mata Pelajaran | Sistem Kehadiran";
    fetchSubjects();
  }, [fetchSubjects]);

  const filteredSubjects = subjects.filter(
    (sub) =>
      sub.sub_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.sub_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {subLoading ? (
        <div className="flex items-center justify-center h-36">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-color5"></div>
          <span className="ml-3 text-color5 font-semibold">Loading...</span>
        </div>
      ) : (
        <div className="p-5 mt-10 max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Daftar Mata Pelajaran
          </h1>
          <div className="mx-auto flex items-center text-sm text-gray-500 space-x-1">
            <Link to="/admin-dashboard">
              <span className="hover:underline hover:text-color5 cursor-pointer">
                Dashboard
              </span>
            </Link>
            <HiChevronRight className="text-gray-400" />
            <Link to="/admin-dashboard/subjects">
              <span className="hover:underline text-color5 cursor-pointer">
                List
              </span>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center my-8 sm:my-4 space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              placeholder="Cari Mata Pelajaran"
              className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Link
              to="/admin-dashboard/add-subject"
              className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base bg-color5 hover:bg-color4 rounded text-white text-center"
            >
              Tambah Mata Pelajaran
            </Link>
          </div>
          <div className="mt-5 rounded-lg shadow-md overflow-hidden">
            <DataTable
              columns={getColumns(onSubjectDelete)}
              data={filteredSubjects}
              progressPending={subLoading}
              pagination
              highlightOnHover
              customStyles={customStyles}
              responsive
              striped
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SubjectList;
