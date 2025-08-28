import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getRooms,
  addRoom,
  getRoom,
  updateRoom,
  getStudentsByClass,
  deleteRoom,
} from "../controllers/roomController.js";

const router = express.Router();

router.get("/", authMiddleware, getRooms);
router.post("/add", authMiddleware, addRoom);
router.get("/:id", authMiddleware, getRoom);
router.get("/students/:id", authMiddleware, getStudentsByClass);
router.put("/:id", authMiddleware, updateRoom);
router.delete("/:id", authMiddleware, deleteRoom);

export default router;
