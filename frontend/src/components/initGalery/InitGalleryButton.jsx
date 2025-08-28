import axios from "axios";
import { useEffect, useState } from "react";

const InitGalleryButton = () => {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [message, setMessage] = useState("");
  const [galleries, setGalleries] = useState([]);
  const baseURL = import.meta.env.VITE_API_URL;

  // Mengecek apakah gallery sudah dibuat dan ambil daftar facegallery
  useEffect(() => {
    const checkStatusAndFetch = async () => {
      try {
        const [statusRes, listRes] = await Promise.all([
          axios.get(`${baseURL}/api/presensi/gallery-status`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`${baseURL}/api/presensi/my-facegalleries`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        setCreated(statusRes.data.created);

        if (listRes.data.success && listRes.data.galleries?.facegallery_list) {
          setGalleries(listRes.data.galleries.facegallery_list);
        }
      } catch (err) {
        console.error(err);
        setMessage("Gagal memuat status atau daftar gallery.");
      }
    };

    checkStatusAndFetch();
  }, [baseURL]);

  const handleInit = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(
        `${baseURL}/api/presensi/init-gallery`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        setMessage("✅ Gallery berhasil dibuat.");
        setCreated(true);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Gagal membuat gallery.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {created === null && <p>🔄 Memuat status gallery...</p>}

      {created && (
        <p className="text-green-600">✅ Face Gallery sudah dibuat.</p>
      )}

      {!created && (
        <button
          onClick={handleInit}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Memproses..." : "🔄 Inisialisasi Face Gallery"}
        </button>
      )}

      {message && <p className="text-sm text-gray-700">{message}</p>}

      {/* Tampilkan daftar facegallery */}
      {galleries.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">📂 Daftar Face Gallery:</h3>
          <ul className="list-disc ml-6 mt-2">
            {galleries.map((gal) => (
              <li key={gal.facegallery_id}>
                <span className="font-mono text-blue-700">
                  {gal.facegallery_id}
                </span>{" "}
                —{" "}
                <span className="text-gray-700">
                  {gal.subject_count} subject terdaftar
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InitGalleryButton;
