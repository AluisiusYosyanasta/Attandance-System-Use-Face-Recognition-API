import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getSummary,
  getSchedules,
  getGuruInfo,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", authMiddleware, getSummary);
router.get("/schedules", authMiddleware, getSchedules);
router.get("/guru-info", authMiddleware, getGuruInfo);

export default router;
