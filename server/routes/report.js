import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getRooms,
  getStudentsByClass,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/", authMiddleware, getRooms);
router.get("/:roomId", authMiddleware, getStudentsByClass);

export default router;
