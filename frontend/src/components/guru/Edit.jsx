import React, { useState, useEffect } from "react";
import { fetchSubjects } from "../../utils/GuruHelper";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { HiChevronRight } from "react-icons/hi";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Select from "react-select";
import dayjs from "dayjs";
import useAuth from "../../context/useAuth";

const Edit = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: null,
    dob_city: "",
    gender: "",
    title: "",
    position: "",
    staGuru: "",
    edu_level: "",
    subject: [],
    role: "",
    password: "",
  });
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [image, setImage] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_API_URL;
  const { refreshUser } = useAuth();

  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/guru/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.data.success) {
          const data = res.data.guru;
          setFormData({
            name: data.userId?.name || "",
            email: data.userId?.email || "",
            dob: data.dob ? dayjs(data.dob) : null,
            dob_city: data.dob_city || "",
            gender: data.gender || "",
            title: data.title || "",
            position: data.position || "",
            staGuru: data.staGuru || "",
            edu_level: data.edu_level || "",
            subject: data.subject?.map((sub) => sub._id) || [],
            role: data.userId?.role || "",
            password: "",
          });
        }
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil data guru");
      }
    };

    const fetchSubjectOptions = async () => {
      const subs = await fetchSubjects();
      setSubjectOptions(subs.map((s) => ({ value: s._id, label: s.sub_name })));
    };

    fetchGuru();
    fetchSubjectOptions();
  }, [id, baseURL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      dob: date === "" ? null : date,
    }));
  };

  const handleSubjectChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      subject: selected ? selected.map((opt) => opt.value) : [],
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((item) => payload.append(key, item));
      } else {
        payload.append(key, formData[key]);
      }
    });

    if (image) {
      payload.append("profileImage", image);
    }

    try {
      const res = await axios.put(`${baseURL}/api/guru/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        await refreshUser();
        navigate("/admin-dashboard/guru-guru");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Gagal memperbarui data guru");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="mt-10 p-5">
        <h1 className="max-w-4xl mx-auto text-xl font-semibold text-gray-800 mb-2">
          Edit Guru
        </h1>
        <div className="max-w-4xl mx-auto flex items-center text-sm text-gray-500 space-x-1">
          <Link to="/admin-dashboard">
            <span className="hover:underline hover:text-color5 cursor-pointer">
              Dashboard
            </span>
          </Link>
          <HiChevronRight className="text-gray-400" />
          <Link to="/admin-dashboard/guru-guru">
            <span className="hover:underline hover:text-color5 cursor-pointer">
              List
            </span>
          </Link>
          <HiChevronRight className="text-gray-400" />
          <Link to={`/admin-dashboard/edit-guru/${id}`}>
            <span className="hover:underline text-color5 cursor-pointer">
              Edit
            </span>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto mt-5 bg-white p-8 rounded-md shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center font-semibold text-gray-700">
                  <span>Nama Guru</span>
                  <span className="text-xs text-red-400 font-normal italic ml-2">
                    *Masukkan Nama Tanpa Gelar
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Masukkan Nama"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="Masukkan Email"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  name="dob_city"
                  value={formData.dob_city}
                  placeholder="Masukkan Tempat Lahir"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 mb-1 block">
                  Tanggal Lahir
                </label>
                <DatePicker
                  value={formData.dob}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      className: "w-full border border-gray-300 rounded-md",
                    },
                  }}
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Jenis Kelamin
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-Laki">Laki-Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Ijazah Terakhir
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Masukkan Gelar"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Jabatan</label>
                <input
                  type="text"
                  name="position"
                  placeholder="Masukkan Jabatan"
                  value={formData.position}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Status Kepegawaian
                </label>
                <select
                  name="staGuru"
                  value={formData.staGuru}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                >
                  <option value="">Pilih Status</option>
                  <option value="Tetap">Tetap</option>
                  <option value="Tidak Tetap">Tidak Tetap</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Jenjang Mengajar
                </label>
                <select
                  name="edu_level"
                  value={formData.edu_level}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                >
                  <option value="">Pilih Jenjang</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Mata Pelajaran
                </label>
                <Select
                  options={subjectOptions}
                  isMulti
                  value={subjectOptions.filter((opt) =>
                    formData.subject.includes(opt.value)
                  )}
                  onChange={handleSubjectChange}
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password (Optional)"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Pilih Role</option>
                  <option value="admin">Admin</option>
                  <option value="guru">Guru</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Unggah Foto
                </label>
                <input
                  type="file"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-color5 hover:bg-color4 text-white font-bold py-2 px-4 rounded"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default Edit;
