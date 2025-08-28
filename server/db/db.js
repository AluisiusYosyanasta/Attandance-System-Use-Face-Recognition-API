import mongoose from "mongoose";

const connectToDatabase = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        return conn;
    } catch (error) {
        console.log("MongoDB Connection Error:", error);
        throw error;
    }
};


export default connectToDatabase