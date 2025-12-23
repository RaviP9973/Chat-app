import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import {connect} from "./config/database.js"
import authRoutes from "./routes/AuthRoutes.js"
import contactRoute from "./routes/ContactRoutes.js"
import setupSocket from "./socket.js"
import messageRoutes from "./routes/MessagesRoute.js"
import channelRoute from "./routes/channelRoutes.js"
import { toNodeHandler } from "better-auth/node";


dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
app.set('trust proxy', true);
app.use(cors({
    origin: [process.env.ORIGIN, "https://chat-app-lime-delta.vercel.app"],
    methods: ["GET", "POST", "PUT","PATCH","DELETE"],
    credentials: true,
}))

app.use('/uploads/profiles', express.static('uploads/profiles'));
app.use('/uploads/files', express.static('uploads/files'));

app.use(cookieParser());
app.use(express.json());

// Connect to database FIRST
await connect();

// Import auth AFTER database connection
const { auth } = await import("./config/auth.js");

// Better-auth routes (fixed pattern)
app.all('/api/auth/*', toNodeHandler(auth));

// User management routes
app.use("/api/users", authRoutes);
app.use("/api/contacts", contactRoute);
app.use("/api/messages", messageRoutes);
app.use("/api/channel", channelRoute);

const server = app.listen(port, () => {
    console.log(`server is running at port ${port}`)
})

setupSocket(server)