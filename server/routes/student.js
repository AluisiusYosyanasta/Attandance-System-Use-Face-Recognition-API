import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getStudents,
  getStudent,
  updateStudent,
  deleteFaceStudent,
} from "../controllers/studentController.js";

const router = express.Router();

router.get("/", authMiddleware, getStudents);
router.get("/:id", authMiddleware, getStudent);
router.put("/:id", authMiddleware, updateStudent);
router.delete("/face/:id", authMiddleware, deleteFaceStudent);

export default router;
