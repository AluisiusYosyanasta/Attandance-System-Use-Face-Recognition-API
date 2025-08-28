import User from "./models/User.js";
import bcrypt from "bcrypt";
import connectToDatabase from "./db/db.js";

const userRegister = async () => {
  await connectToDatabase();

  try {
    const existing = await User.findOne({ email: "admin@gmail.com" });
    if (existing) {
      console.log("Admin already exists");
      return;
    }

    const hashPassword = await bcrypt.hash("admin", 10);
    const newUser = new User({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashPassword,
      role: "admin",
    });

    await newUser.save();
    console.log("Admin created successfully");
  } catch (error) {
    console.error("Error registering admin:", error.message);
  }
};

userRegister();
