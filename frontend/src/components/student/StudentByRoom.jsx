import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { HiChevronRight } from "react-icons/hi";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { TbMoodEmpty } from "react-icons/tb";

const StudentByRoom = () => {
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [room, setRoom] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortByNikAsc, setSortByNikAsc] = useState(true);
  const [sortByNik, setSortByNik] = useState(true);

  const itemsPerPage = 10;

  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStudentsAndRoom = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/room/students/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          setStudents(response.data.students);
        }

        const roomRes = await axios.get(`${baseURL}/api/room/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (roomRes.data.success) {
          setRoom(roomRes.data.room);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.data?.error) {
          alert(error.response.data.error);
        }
      }
    };

    fetchStudentsAndRoom();
  }, [id, baseURL]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleSortDob = () => {
    setSortAsc(!sortAsc);
    setSortByNik(false);
  };
  const handleSortNik = () => {
    setSortByNikAsc(!sortByNikAsc);
    setSortByNik(true);
    setSortAsc(true);
  };

  const filteredStudents = students
    .filter((s) =>
      Object.values(s)
        .concat(
          s?.dob ? new Date(s.dob).toLocaleDateString("id-ID") : "",
          s?.parentStd || "",
          s?.parentJob || ""
        )
        .join(" ")
        .toLowerCase()
        .includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortByNik) {
        const nikA = a.nik || "";
        const nikB = b.nik || "";
        return sortByNikAsc
          ? nikA.localeCompare(nikB)
          : nikB.localeCompare(nikA);
      } else {
        if (!a.dob || !b.dob) return 0;
        const dateA = new Date(a.dob);
        const dateB = new Date(b.dob);
        return sortAsc ? dateA - dateB : dateB - dateA;
      }
    });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredStudents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-5 mt-10 max-w-7xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-800 mb-2">
        Daftar Siswa Kelas {room?.room_name || ""}
      </h1>

      <div className="mx-auto flex items-center text-sm text-gray-500 space-x-1 mb-4">
        <Link to="/admin-dashboard">
          <span className="hover:underline hover:text-color5 cursor-pointer">
            Dashboard
          </span>
        </Link>
        <HiChevronRight className="text-gray-400" />
        <Link to="/admin-dashboard/rooms">
          <span className="hover:underline hover:text-color5 cursor-pointer">
            List
          </span>
        </Link>
        <HiChevronRight className="text-gray-400" />
        <span className="text-color5 cursor-default">Daftar Siswa</span>
      </div>

      <input
        type="text"
        placeholder="Cari Siswa"
        className="mb-4 p-2 border border-gray-300 rounded w-full max-w-sm"
        onChange={handleSearch}
      />

      {currentData.length > 0 ? (
        <>
          <div className="bg-white shadow-xl rounded-xl overflow-auto max-w-full">
            <div className="min-w-[900px]">
              <table className="w-full table-auto text-left border-collapse">
                <thead className="bg-gradient-to-r from-color6 to-color4 text-white text-xs uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 w-[50px] text-center">S No</th>
                    <th className="px-4 py-3 w-[150px]">Nama</th>
                    <th
                      className="px-4 py-3 w-[140px] text-center cursor-pointer select-none"
                      onClick={handleSortNik}
                      title="Urutkan NIK"
                    >
                      NIK{" "}
                      {sortByNik ? (
                        sortByNikAsc ? (
                          <FiChevronUp className="inline-block" />
                        ) : (
                          <FiChevronDown className="inline-block" />
                        )
                      ) : null}
                    </th>

                    <th className="px-4 py-3 w-[120px] text-center">
                      Jenis Kelamin
                    </th>
                    <th
                      className="px-4 py-3 w-[140px] text-center cursor-pointer select-none"
                      onClick={handleSortDob}
                      title="Urutkan"
                    >
                      Tanggal Lahir{" "}
                      {sortAsc ? (
                        <FiChevronUp className="inline-block" />
                      ) : (
                        <FiChevronDown className="inline-block" />
                      )}
                    </th>
                    <th className="px-4 py-3 w-[100px] text-center">Agama</th>
                    <th className="px-4 py-3 w-[200px] text-center">Alamat</th>
                    <th className="px-4 py-3 w-[140px] text-center">
                      Orang Tua
                    </th>
                    <th className="px-4 py-3 w-[160px] text-center">
                      Pekerjaan Orang Tua
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 divide-y divide-gray-100">
                  {currentData.map((s, index) => (
                    <tr
                      key={s._id}
                      className="hover:bg-gray-50 transition duration-200"
                    >
                      <td className="px-4 py-3 text-center">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-3 font-medium">{s.name || "-"}</td>
                      <td className="px-4 py-3 text-center">{s.nik || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        {s.gender || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {s.dob
                          ? new Date(s.dob).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {s.religion || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {s.address || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {s.parentStd || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {s.parentJob || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 ? "bg-color6 text-white" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="mt-10 text-center text-gray-600">
          <div className="inline-block bg-gray-100 rounded-full p-3">
            <TbMoodEmpty className="text-gray-400 w-12 h-12" />
          </div>
          <p className="text-lg font-medium text-gray-700">
            Data siswa tidak ditemukan
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Silakan periksa pencarian atau tambahkan data baru.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentByRoom;
