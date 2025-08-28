import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getSchedules,
  addSchedule,
  getSchedule,
  updateSchedule,
  deleteSchedule,
} from "../controllers/scheduleController.js";

const router = express.Router();

router.get("/", authMiddleware, getSchedules);
router.post("/add", authMiddleware, addSchedule);
router.get("/:id", authMiddleware, getSchedule);
router.put("/:id", authMiddleware, updateSchedule);
router.delete("/:id", authMiddleware, deleteSchedule);

export default router;
