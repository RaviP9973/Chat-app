import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

export const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        
        // Wait a bit for the connection to fully establish
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log("Db connection successful");
        console.log("Database name:", mongoose.connection.db?.databaseName);
        console.log("Connection readyState:", mongoose.connection.readyState);
        
        // Ensure we have a valid db instance
        if (!mongoose.connection.db) {
            throw new Error("Database instance not available after connection");
        }
        
        return mongoose.connection.db;
    } catch (error) {
        console.log("Db connection failed");
        console.error(error);
        process.exit(1);
    }
}
