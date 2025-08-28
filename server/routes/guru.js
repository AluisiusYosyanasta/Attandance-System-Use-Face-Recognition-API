import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addGuru,
  upload,
  getGurus,
  getGuru,
  updateGuru,
  deleteGuru,
  getGuruBySubject,
} from "../controllers/guruController.js";

const router = express.Router();

router.get("/", authMiddleware, getGurus);
router.post("/add", authMiddleware, upload.single("image"), addGuru);
router.get("/:id", authMiddleware, getGuru);
router.put("/:id", authMiddleware, upload.single("profileImage"), updateGuru);
router.delete("/:id", authMiddleware, deleteGuru);
router.get("/by-subject/:subjectId", authMiddleware, getGuruBySubject);

export default router;
