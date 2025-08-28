import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getStudentsByClass,
  enrollFaceToBiznet,
  recognizeFaceFromBiznet,
  createFaceGallery,
  getGalleryStatus,
  getMyFaceGalleries,
  getGuruSchedules,
  submitPresensi,
  studentConfirm,
  fetchPresensiBySchedule,
  updatePresensi,
  getSchedules,
  loadSiswaEdit,
  updatePresensiUbah,
} from "../controllers/presensiController.js";

const router = express.Router();

// Ambil siswa berdasarkan kelas
router.get("/students", authMiddleware, getStudentsByClass);

// Enroll wajah ke Biznet NEO
router.post("/enroll", authMiddleware, enrollFaceToBiznet);

// Recognize wajah dari kamera
router.post("/recognize", authMiddleware, recognizeFaceFromBiznet);

// Inisialisasi face gallery (opsional, cukup dipanggil 1x)
router.post("/init-gallery", authMiddleware, createFaceGallery);

router.get("/gallery-status", authMiddleware, getGalleryStatus);

router.get("/my-facegalleries", authMiddleware, getMyFaceGalleries);

router.get("/guru-schedule", authMiddleware, getGuruSchedules);

router.post("/student-confirm", authMiddleware, studentConfirm);

router.post("/submit-presensi", authMiddleware, submitPresensi);

router.post("/fetch-presensi-by-schedule", fetchPresensiBySchedule);

router.put("/update-presensi", authMiddleware, updatePresensi);

router.get("/schedules", authMiddleware, getSchedules);

router.post("/load-siswa-edit", authMiddleware, loadSiswaEdit);

router.put("/update-ubah", authMiddleware, updatePresensiUbah);

export default router;
