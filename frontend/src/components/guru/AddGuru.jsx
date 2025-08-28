import React, { useState, useEffect } from "react";
import { fetchSubjects } from "../../utils/GuruHelper";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { HiChevronRight } from "react-icons/hi";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Select from "react-select";

const AddGuru = () => {
  const [formData, setFormData] = useState({});
  const [subjectOptions, setSubjectOptions] = useState([]);
  const baseURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const getSubjects = async () => {
      const fetchedSubjects = await fetchSubjects();
      setSubjectOptions(
        (fetchedSubjects || []).map((sub) => ({
          value: sub._id,
          label: sub.sub_name,
        }))
      );
    };
    getSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleDateChange = (date) => {
    if (date && date.isValid && date.isValid()) {
      setFormData((prevData) => ({
        ...prevData,
        dob: date.toISOString(),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        dob: "",
      }));
    }
  };

  const handleSubjectChange = (selectedOptions) => {
    setFormData((prevData) => ({
      ...prevData,
      subject: selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((val) => formDataObj.append(key, val));
      } else {
        formDataObj.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post(
        `${baseURL}/api/guru/add`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        navigate("/admin-dashboard/guru-guru");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="mt-10 p-5">
        <h1 className="max-w-4xl mx-auto text-xl font-semibold text-gray-800 mb-2">
          Tambah Guru Baru
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
          <Link to="/admin-dashboard/add-guru">
            <span className="hover:underline text-color5 cursor-pointer">
              Guru
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
                  name="subject"
                  onChange={handleSubjectChange}
                  className="mt-1"
                  classNamePrefix="react-select"
                  placeholder="Pilih Mata Pelajaran"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="* * * * * *"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Role</label>
                <select
                  name="role"
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
                  onChange={handleChange}
                  accept="image/*"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-color5 hover:bg-color4 text-white font-bold py-2 px-4 rounded"
            >
              Tambahkan Guru
            </button>
          </form>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default AddGuru;
