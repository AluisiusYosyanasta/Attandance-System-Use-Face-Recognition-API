import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { HiChevronRight } from "react-icons/hi";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const AddRoom = () => {
  const [guruList, setGuruList] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [formData, setFormData] = useState({
    edu_level: "",
    room_name: "",
    guruId: "",
    school_year: "",
  });

  const [students, setStudents] = useState([
    {
      nik: "",
      name: "",
      gender: "",
      dob: null,
      religion: "",
      address: "",
      parentStd: "",
      parentJob: "",
    },
  ]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const baseURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "edu_level") {
      let options = [];
      if (value === "SD") options = ["1", "2", "3", "4", "5", "6"];
      else if (value === "SMP") options = ["7", "8", "9"];
      else if (value === "SMA") options = ["10", "11", "12"];

      setRoomOptions(options);

      setFormData((prev) => ({
        ...prev,
        edu_level: value,
        room_name: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const handleDobChange = (index, value) => {
    const updated = [...students];
    updated[index].dob = value;
    setStudents(updated);
  };

  const handleStudentChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...students];
    updated[index][name] = value;
    setStudents(updated);
  };

  const addStudentField = () => {
    setStudents([
      ...students,
      {
        nik: "",
        name: "",
        gender: "",
        dob: null,
        religion: "",
        address: "",
        parentStd: "",
        parentJob: "",
      },
    ]);
  };

  const removeStudentField = (index) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchGurus = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/guru`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          setGuruList(response.data.gurus);
        }
      } catch (error) {
        console.error("Gagal mengambil data guru:", error);
      }
    };

    fetchGurus();
  }, [baseURL]);

  useEffect(() => {
    if (startDate && endDate) {
      const startYear = dayjs(startDate).year();
      const endYear = dayjs(endDate).year();
      setFormData((prev) => ({
        ...prev,
        school_year: `${startYear}/${endYear}`,
      }));
    }
  }, [startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (startDate && endDate && dayjs(endDate).isBefore(startDate)) {
      alert("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }
    try {
      const payload = {
        ...formData,
        students,
        guruId: formData.guruId === "" ? null : formData.guruId,
        startDate: startDate ? dayjs(startDate).format("YYYY-MM-DD") : null,
        endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : null,
      };
      const response = await axios.post(`${baseURL}/api/room/add`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        navigate("/admin-dashboard/rooms");
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
          Ruang Kelas
        </h1>
        <div className="max-w-4xl mx-auto flex items-center text-sm text-gray-500 space-x-1">
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
          <Link to="/admin-dashboard/add-room">
            <span className="hover:underline text-color5 cursor-pointer">
              Kelas
            </span>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto mt-5 bg-white p-8 rounded-md shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="border-b-2 border-gray-500 pb-1 mb-3">
              <label className="font-semibold text-gray-700 text-base">
                Data Kelas
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 space-y-0 gap-2">
              {/* Jenjang */}
              <div>
                <label className="font-semibold text-gray-700">
                  Jenjang Pendidikan
                </label>
                <select
                  name="edu_level"
                  value={formData.edu_level}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Pilih Jenjang</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>

              {/* Kelas */}
              <div>
                <label className="font-semibold text-gray-700">Kelas</label>
                <select
                  name="room_name"
                  value={formData.room_name}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                  disabled={roomOptions.length === 0}
                >
                  <option value="">Pilih Kelas</option>
                  {roomOptions.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guru */}
              <div>
                <label className="font-semibold text-gray-700">
                  Wali Kelas
                </label>
                <select
                  name="guruId"
                  value={formData.guruId}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                >
                  <option value="">Pilih Guru</option>
                  {guruList.map((guru) => (
                    <option key={guru._id} value={guru._id}>
                      {guru.userId?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-b-2 border-gray-500 pb-1 mb-3 mt-6">
              <label className="font-semibold text-gray-700 text-base">
                Tahun Pelajaran
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 space-y-0 gap-2">
              {/* Tanggal Ajaran */}
              <div>
                <label className="font-semibold text-gray-700">
                  Tanggal Mulai
                </label>
                <DatePicker
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  format="DD-MM-YYYY"
                  className="mt-1 w-full"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Tanggal Selesai
                </label>
                <DatePicker
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  format="DD-MM-YYYY"
                  className="mt-1 w-full"
                />
              </div>
              {/* Tahun Ajaran */}
              <div>
                <label className="font-semibold text-gray-700">
                  Tahun Pelajaran
                </label>
                <input
                  type="text"
                  name="school_year"
                  value={formData.school_year}
                  disabled
                  className="mt-1 p-2 block w-full border border-gray-300 bg-gray-100 rounded-md"
                />
              </div>
            </div>
            {/* Siswa */}
            <div className="mt-6">
              <label className="font-semibold text-gray-700">Data Siswa</label>
              {students.map((student, index) => (
                <div
                  key={index}
                  className="border border-color7 p-3 mt-2 rounded space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-800">
                      Siswa {index + 1}
                    </h2>
                    {students.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStudentField(index)}
                        className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                      >
                        Hapus Siswa
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="nik"
                      placeholder="Nomor Induk"
                      value={student.nik}
                      onChange={(e) => handleStudentChange(index, e)}
                      className="p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      name="name"
                      placeholder="Nama"
                      value={student.name}
                      onChange={(e) => handleStudentChange(index, e)}
                      className="p-2 border border-gray-300 rounded"
                    />

                    <select
                      name="gender"
                      value={student.gender}
                      onChange={(e) => handleStudentChange(index, e)}
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="">Jenis Kelamin</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>

                    <DatePicker
                      name="dob"
                      value={student.dob}
                      onChange={(value) => handleDobChange(index, value)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                        },
                      }}
                    />
                    <select
                      name="religion"
                      value={student.religion}
                      onChange={(e) => handleStudentChange(index, e)}
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="">Agama</option>
                      <option value="Islam">Islam</option>
                      <option value="Kristen Protestan">
                        Kristen Protestan
                      </option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                      <option value="Yang lainnya">Yang lainnya</option>
                    </select>
                    <input
                      type="text"
                      name="address"
                      placeholder="Alamat"
                      value={student.address}
                      onChange={(e) => handleStudentChange(index, e)}
                      className="p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      name="parentStd"
                      placeholder="Nama Orang Tua"
                      value={student.parentStd}
                      onChange={(e) => handleStudentChange(index, e)}
                      className="p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      name="parentJob"
                      placeholder="Pekerjaan Orang Tua"
                      value={student.parentJob}
                      onChange={(e) => handleStudentChange(index, e)}
                      className="p-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addStudentField}
                className="font-semibold text-sm text-white bg-color5 hover:bg-color4 rounded-md p-2 mt-4"
              >
                + Tambah Siswa
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-color5 hover:bg-color4 text-white font-bold py-2 px-4 rounded"
            >
              Tambahkan Kelas & Siswa
            </button>
          </form>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default AddRoom;
