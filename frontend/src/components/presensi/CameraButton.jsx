import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { HiChevronRight } from "react-icons/hi";

const CameraButton = () => {
  const [student, setStudent] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadImage, setUploadImage] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [mode, setMode] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/student/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.data.success) {
          setStudent(res.data.student);
        }
      } catch {
        setAlert({ type: "error", message: "Gagal mengambil data siswa." });
      }
    };

    fetchStudent();
    return () => stopCamera();
  }, [id, baseURL]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      setAlert({ type: "error", message: "Gagal mengakses kamera." });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  };

  const sendEnroll = async (imageData) => {
    if (!student || !imageData) return;

    try {
      setIsEnrolling(true);
      const res = await axios.post(
        `${baseURL}/api/presensi/enroll`,
        {
          studentId: student._id,
          image: imageData,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        setAlert({
          type: "success",
          message: "✅ Mengunggah foto wajah berhasil !!",
        });
        setTimeout(() => navigate("/admin-dashboard/students"), 1000);
      } else {
        setAlert({
          type: "error",
          message: "❌ Gagal enroll wajah: " + res.data.error,
        });
      }
    } catch {
      setAlert({
        type: "error",
        message: "Terjadi kesalahan saat mengirim gambar.",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const captureAndEnroll = async () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) {
      return alert("⚠️ Kamera belum siap.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg");

    setCapturedImage(imageData);
    await sendEnroll(imageData);
  };

  return (
    <div className="mt-10 p-5">
      <h1 className="max-w-4xl mx-auto text-xl font-semibold text-gray-800 mb-2">
        Tambahkan Wajah Siswa
      </h1>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto flex items-center text-sm text-gray-500 space-x-1">
        <Link to="/admin-dashboard">
          <span className="hover:underline hover:text-color5 cursor-pointer">
            Dashboard
          </span>
        </Link>
        <HiChevronRight className="text-gray-400" />
        <Link to="/admin-dashboard/students">
          <span className="hover:underline hover:text-color5 cursor-pointer">
            List
          </span>
        </Link>
        <HiChevronRight className="text-gray-400" />
        <Link to={`/admin-dashboard/add-studentFace/${id}`}>
          <span className="hover:underline text-color5 cursor-pointer">
            Edit
          </span>
        </Link>
      </div>

      {/* Alert */}
      {alert.message && (
        <div
          className={`max-w-2xl w-full mx-auto mt-6 mb-4 px-4 py-3 rounded shadow ${
            alert.type === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {alert.message}
        </div>
      )}
      <div className="max-w-4xl mx-auto mt-5">
        <Link
          to="/admin-dashboard/students"
          className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded shadow transition"
        >
          ⬅ Kembali ke Daftar Siswa
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center px-4 mt-7">
        <div className="max-w-4xl w-full flex flex-col items-center text-center bg-white p-5 rounded-md shadow-md">
          {student && (
            <p className="text-md text-gray-700 mb-4">
              👤 Siswa : <span className="font-semibold">{student.name}</span>
            </p>
          )}

          {/* Pilihan metode input */}
          {!mode && (
            <div className="flex flex-col items-center gap-3 mb-6">
              <p className="text-gray-700 mt-10">Pilih metode input wajah:</p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setMode("camera");
                    startCamera();
                  }}
                  className="bg-color5 hover:bg-color4 text-white hover:font-semibold  px-2 py-1 lg:px-4 lg:py-2 rounded text-sm lg:text-base"
                >
                  📷 Gunakan Kamera
                </button>
                <button
                  onClick={() => setMode("upload")}
                  className="bg-gray-500 hover:bg-gray-600 text-white hover:font-semibold px-2 py-1 lg:px-4 lg:py-2 rounded text-sm lg:text-base"
                >
                  🖼️ Upload Gambar
                </button>
              </div>
            </div>
          )}

          {/* Mode Kamera */}
          {mode === "camera" && (
            <>
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-center w-full">
                <div className="w-full lg:w-1/2 flex flex-col items-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => videoRef.current?.play()}
                    className="w-full max-w-md rounded border shadow-md"
                  />
                  {!cameraOn && (
                    <p className="text-sm text-gray-500 mt-3">
                      🎥 Kamera belum aktif.
                    </p>
                  )}
                </div>

                {capturedImage && (
                  <div className="w-full lg:w-1/2 flex flex-col items-center">
                    <label className="text-sm text-gray-600">
                      Hasil Tangkapan:
                    </label>
                    <img
                      src={capturedImage}
                      alt="Preview wajah"
                      className="w-full max-w-md mt-2 border rounded shadow-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                <button
                  onClick={() => {
                    stopCamera();
                    setCapturedImage(null);
                    setMode(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white hover:font-semibold px-2 py-1 lg:px-4 lg:py-2 rounded text-sm lg:text-base"
                >
                  ❌ Ganti Metode
                </button>

                <button
                  onClick={stopCamera}
                  className="bg-red-600 hover:bg-red-700 text-white hover:font-semibold px-2 py-1 lg:px-4 lg:py-2 rounded text-sm lg:text-base"
                >
                  🛑 Matikan Kamera
                </button>

                <button
                  onClick={captureAndEnroll}
                  disabled={isEnrolling || !cameraOn}
                  className={`${
                    isEnrolling ? "bg-color6" : "bg-color5 hover:bg-color4"
                  } text-white hover:font-semibold px-2 py-1 lg:px-4 lg:py-2 rounded text-sm lg:text-base`}
                >
                  {isEnrolling ? "⏳ Enrolling..." : "📸 Ambil Wajah"}
                </button>
              </div>
            </>
          )}

          {/* Mode Upload */}
          {mode === "upload" && (
            <div className="flex flex-col items-center gap-4 mt-6 w-full">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setUploadImage(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="text-sm"
              />

              {uploadImage && (
                <img
                  src={uploadImage}
                  alt="Preview"
                  className="max-w-sm w-full border rounded shadow"
                />
              )}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => {
                    setUploadImage(null);
                    setMode(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white hover:font-semibold px-2 py-1 lg:px-4 lg:py-2 rounded text-sm lg:text-base"
                >
                  ❌ Ganti Metode
                </button>

                <button
                  onClick={() => sendEnroll(uploadImage)}
                  disabled={!uploadImage || isEnrolling}
                  className={`${
                    isEnrolling ? "bg-color6" : "bg-color5 hover:bg-color4"
                  } text-white hover:font-semibold px-2 py-1 lg:px-4 lg:py-2 rounded text-sm lg:text-base`}
                >
                  {isEnrolling ? "⏳ Mengupload..." : "✅ Kirim Gambar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraButton;
