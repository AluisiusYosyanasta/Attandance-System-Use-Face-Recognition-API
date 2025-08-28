import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import { getColumns } from "../../utils/GuruColumns";
import { HiChevronRight } from "react-icons/hi";
import { FaUser } from "react-icons/fa";

const GuruList = () => {
  const [gurus, setGurus] = useState([]);
  const [guruLoading, setGuruLoading] = useState(false);
  const [filteredGuru, setFilteredGuru] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
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
        justifyContent: "center",
        textAlign: "center",
      },
    },
  };

  const fetchGurus = useCallback(async () => {
    setGuruLoading(true);
    try {
      const response = await axios.get(`${baseURL}/api/guru`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        let sno = 1;
        const data = response.data.gurus.map((guru) => {
          const hasProfileImage = guru.userId?.profileImage;

          return {
            ...guru,
            sno: sno++,
            profileImage: hasProfileImage ? (
              <img
                src={`${baseURL}/${guru.userId.profileImage}`}
                alt={`Foto ${guru.userId?.name || "Guru"}`}
                className="w-12 h-12 object-cover rounded-full border bg-gray-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-profile.png";
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 border rounded-full flex items-center justify-center">
                <FaUser className="w-6 h-6 text-gray-300" />
              </div>
            ),
          };
        });

        setGurus(data);
        setFilteredGuru(data);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Gagal mengambil data guru");
    } finally {
      setGuruLoading(false);
    }
  }, [baseURL]);

  useEffect(() => {
    document.title = "Guru | Sistem Kehadiran";
    fetchGurus();
  }, [fetchGurus]);

  const onGuruDelete = () => {
    fetchGurus();
  };

  useEffect(() => {
    const lowerKeyword = searchTerm.toLowerCase();
    const result = gurus.filter((guru) => {
      const name = guru.userId?.name || "";
      const email = guru.userId?.email || "";
      const role = guru.userId?.role || "";
      const title = guru.title || "";
      const gender = guru.gender || "";
      const pos = guru.position || "";
      const sta = guru.staGuru || "";
      const city = guru.dob_city || "";
      const subjects = (guru.subject || []).map((s) => s.sub_name).join(", ");
      const rooms = (guru.rooms || []).map((r) => r.room_name).join(", ");
      const searchString =
        `${name} ${email} ${role} ${title} ${gender} ${pos} ${sta} ${city} ${subjects} ${rooms}`.toLowerCase();

      return searchString.includes(lowerKeyword);
    });

    setFilteredGuru(result);
  }, [searchTerm, gurus]);

  return (
    <>
      {guruLoading ? (
        <div className="flex items-center justify-center h-36">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-color5"></div>
          <span className="ml-3 text-color5 font-semibold">Loading...</span>
        </div>
      ) : (
        <div className="p-5 mt-10 max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Daftar Guru
          </h1>

          <div className="flex items-center text-sm text-gray-500 space-x-1 mb-4">
            <Link to="/admin-dashboard">
              <span className="hover:underline hover:text-color5 cursor-pointer">
                Dashboard
              </span>
            </Link>
            <HiChevronRight className="text-gray-400" />
            <Link to="/admin-dashboard/guru-guru">
              <span className="hover:underline text-color5 cursor-pointer">
                List
              </span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-6">
            <input
              type="text"
              placeholder="Cari Guru Berdasarkan Semua Data"
              className="w-full sm:w-1/3 px-3 py-2 text-sm border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Link
              to="/admin-dashboard/add-guru"
              className="w-full sm:w-auto px-3 py-2 text-sm bg-color5 hover:bg-color4 rounded text-white text-center"
            >
              Tambah Guru
            </Link>
          </div>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded ${
                activeTab === "all" ? "bg-color5 text-white" : "bg-gray-200"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-2 rounded ${
                activeTab === "admin" ? "bg-color5 text-white" : "bg-gray-200"
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setActiveTab("guru")}
              className={`px-4 py-2 rounded ${
                activeTab === "guru" ? "bg-color5 text-white" : "bg-gray-200"
              }`}
            >
              Guru
            </button>
          </div>
          <div className="rounded-lg shadow-md overflow-hidden">
            <DataTable
              columns={getColumns(onGuruDelete)}
              data={
                activeTab === "all"
                  ? filteredGuru
                  : filteredGuru.filter(
                      (guru) => (guru.userId?.role || "lainnya") === activeTab
                    )
              }
              customStyles={customStyles}
              pagination
              highlightOnHover
              responsive
              striped
              noDataComponent={
                <div className="py-6 text-gray-500">Data tidak ditemukan.</div>
              }
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GuruList;
