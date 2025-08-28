import express from "express";
import {
  login,
  verify,
  register,
  forgotPass,
  resetPass,
  getProfile,
  updateProfile,
  upload,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/verify", authMiddleware, verify);
router.post("/register", register);
router.post("/forgotPass", forgotPass);
router.post("/resetPass", resetPass);
router.get("/profile/:id", getProfile);
router.put(
  "/profile/:id",
  authMiddleware,
  upload.single("profileImage"),
  updateProfile
);

export default router;
