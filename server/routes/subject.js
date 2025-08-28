import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getSubjects,
  addSubject,
  getSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";

const router = express.Router();

router.get("/", authMiddleware, getSubjects);
router.post("/add", authMiddleware, addSubject);
router.get("/:id", authMiddleware, getSubject);
router.put("/:id", authMiddleware, updateSubject);
router.delete("/:id", authMiddleware, deleteSubject);

export default router;
