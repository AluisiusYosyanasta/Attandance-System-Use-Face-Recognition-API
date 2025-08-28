import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaUser } from "react-icons/fa";

const View = () => {
  const { id } = useParams();
  const [guru, setGuru] = useState(null);
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    document.title = "Profile Guru | Sistem Kehadiran";
    const fetchGuru = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/guru/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          setGuru(response.data.guru);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchGuru();
  }, [id, baseURL]);

  return (
    <>
      {guru ? (
        <div className="max-w-3xl mx-auto mt-20 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
          {/* Header biru atas */}
          <div className="bg-color5 py-3 px-6">
            <h2 className="text-white font-bold text-center text-lg">
              KARTU IDENTITAS GURU
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center p-6 gap-6">
            {/* Foto Profil */}
            <div className="flex-shrink-0">
              {guru.userId.profileImage ? (
                <img
                  src={`${baseURL}/${guru.userId.profileImage}`}
                  alt="Foto Guru"
                  className="w-40 h-52 object-cover border border-gray-400 rounded-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-profile.png";
                  }}
                />
              ) : (
                <div className="w-40 h-52 bg-gray-200 border border-gray-200 rounded-md flex items-center justify-center">
                  <FaUser className="w-20 h-20 text-gray-300" />
                </div>
              )}

              <div className="w-full justify-center items-start text-center font-semibold mt-2">
                {guru.guruId || ""}
              </div>
              <div className="w-full justify-center items-start text-center font-semibold">
                {guru.position || "-"}
              </div>
            </div>

            {/* Infromasi */}
            <div className="w-full text-sm text-gray-800 space-y-2 ml-5">
              <p>
                <span className="font-semibold w-40 inline-block">
                  Nama Lengkap
                </span>
                : {guru.userId.name}{" "}
                {guru.title && (
                  <span className="text-gray-700">({guru.title})</span>
                )}
              </p>
              <p>
                <span className="font-semibold w-40 inline-block">Email</span>:{" "}
                {guru.userId.email}
              </p>
              <p>
                <span className="font-semibold w-40 inline-block">
                  {guru.dob_city ? "Tempat, Tanggal Lahir" : "Tanggal Lahir"}
                </span>
                : {guru.dob_city && `${guru.dob_city}, `}
                {guru.dob
                  ? (() => {
                      const date = new Date(guru.dob);
                      const day = String(date.getDate()).padStart(2, "0");
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const year = date.getFullYear();
                      return `${day}-${month}-${year}`;
                    })()
                  : "-"}
              </p>

              <p>
                <span className="font-semibold w-40 inline-block">
                  Jenis Kelamin
                </span>
                : {guru.gender || "-"}
              </p>
              <p>
                <span className="font-semibold w-40 inline-block">
                  Status Kepegawaian
                </span>
                : {guru.staGuru || "-"}
              </p>
              <p>
                <span className="font-semibold w-40 inline-block">Jabatan</span>
                : {guru.position || "-"}
              </p>
              <p>
                <span className="font-semibold w-40 inline-block">
                  Mengajar
                </span>
                :{" "}
                {guru.subject?.length > 0
                  ? guru.subject.map((sub) => sub.sub_name).join(", ")
                  : "-"}
              </p>
              <p>
                <span className="font-semibold w-40 inline-block">
                  Wali Kelas
                </span>
                :{" "}
                {guru.rooms?.length > 0
                  ? guru.rooms.map((room) => room.room_name).join(", ")
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-36">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-color5"></div>
          <span className="ml-3 text-color5 font-semibold">Loading...</span>
        </div>
      )}
    </>
  );
};

export default View;
