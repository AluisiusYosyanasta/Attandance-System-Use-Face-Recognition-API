import User from "../models/User.js";
import bcrypt from "bcryptjs";

const changePassword = async (req, res) => {
  try {
    // Gunakan user ID dari JWT, bukan dari body
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // Cek user ada
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User tidak ditemukan" });
    }

    // Cek password lama
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, error: "Password awal salah" });
    }

    // Validasi kekuatan password (opsional tapi direkomendasikan)
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{5,}$/;
    if (!strongRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error:
          "Password baru terlalu lemah. Gunakan kombinasi huruf besar, kecil, angka dan simbol.",
      });
    }

    // Hash dan simpan
    const hashPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashPassword });

    return res
      .status(200)
      .json({ success: true, message: "Password berhasil diubah." });
  } catch (error) {
    console.error("Change password error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Terjadi kesalahan pada server." });
  }
};

export { changePassword };
