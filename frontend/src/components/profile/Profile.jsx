import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaUser } from "react-icons/fa";

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    document.title = "Profile | Sistem Kehadiran";
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/auth/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          setUser(response.data.profile);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchUser();
  }, [id, baseURL]);

  return (
    <>
      {user ? (
        <div className="max-w-3xl mx-auto mt-20 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
          {/* Header biru atas */}
          <div className="bg-color5 py-3 px-6">
            <h2 className="text-white font-bold text-center text-lg">
              KARTU IDENTITAS USER
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center p-6 gap-6">
            {/* Foto Profil */}
            <div className="flex-shrink-0">
              {user.user.profileImage ? (
                <img
                  src={`${baseURL}/${user.user.profileImage}`}
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
                {user.guru.guruId || ""}
              </div>
              <div className="w-full justify-center items-start text-center font-semibold">
                {user.guru.position || "-"}
              </div>
            </div>

            {/* Informasi */}
            <div className="w-full text-sm text-gray-800 space-y-2 ml-5">
              <p>
                <span className="font-semibold w-40 inline-block">
                  Nama Lengkap
                </span>
                : {user.user.name}{" "}
                {user.guru.title && (
                  <span className="text-gray-700">({user.guru.title})</span>
                )}
              </p>
              <p>
                <span className="font-semibold w-40 inline-block">Email</span>:{" "}
                {user.user.email}
              </p>
              <p>
                <span className="font-semibold w-40 inline-block">
                  {user.guru.dob_city
                    ? "Tempat, Tanggal Lahir"
                    : "Tanggal Lahir"}
                </span>
                : {user.guru.dob_city && `${user.guru.dob_city}, `}
                {user.guru.dob
                  ? (() => {
                      const date = new Date(user.guru.dob);
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
                : {user.guru.gender}
              </p>
              <p>
                <span className="font-semibold w-40 inline-block">
                  Status Kepegawaian
                </span>
                : {user.guru.staGuru}
              </p>
              <p>
                <span className="font-semibold w-40 inline-block">Jabatan</span>
                : {user.guru.position || "-"}
              </p>
              <p>
                <span className="font-semibold w-40 inline-block">
                  Mengajar
                </span>
                :{" "}
                {user.guru?.subject?.length > 0
                  ? user.guru?.subject.map((sub) => sub.sub_name).join(", ")
                  : "-"}
              </p>
              <p>
                <span className="font-semibold w-40 inline-block">
                  Wali Kelas
                </span>
                :{" "}
                {user.rooms?.length > 0
                  ? user.rooms.map((room) => room.room_name).join(", ")
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

export default Profile;
