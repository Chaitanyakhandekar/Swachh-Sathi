import cookieParser from 'cookie-parser';
import express from 'express';
import {createServer} from "http"
import {Server} from "socket.io"
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config({path:"./.env"})


const app = express();  // Create an Express application

const httpServer = createServer(app)   // Create an HTTP server

// Initialize Socket.IO with the server


app.use(cors({
    origin:process.env.CLIENT_URL || "http://localhost:5173",
    methods:["GET","POST","PUT","DELETE","PATCH"],
    credentials:true
}))
app.use(express.json({
    limit:"16kb"
}))
app.use(cookieParser())
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))
app.use(express.static("public"))


import userRouter from "./routes/user.route.js"
import messageRouter from "./routes/message.route.js"
import chatRouter from "./routes/chat.route.js"
import pingRouter from "./routes/ping.route.js"
import groupRoutes from "./routes/group.route.js"
import eventRouter from "./routes/event.route.js"
import locationRouter from "./routes/location.route.js"
import volunteerRouter from "./routes/volunteer.route.js"
import photoRouter from "./routes/photo.route.js"
import adminRouter from "./routes/admin.route.js"
import notificationRouter from "./routes/notification.route.js"
import eventChatRouter from "./routes/eventChat.route.js"

app.use("/api/groups",groupRoutes)

app.use("/api/users",userRouter)
app.use("/api/messages",messageRouter)
app.use("/api/chats",chatRouter)
app.use("/api/ping",pingRouter)
app.use("/api/events",eventRouter)
app.use("/api/locations",locationRouter)
app.use("/api/volunteers",volunteerRouter)
app.use("/api/photos",photoRouter)
app.use("/api/admin",adminRouter)
app.use("/api/notifications",notificationRouter)
app.use("/api/event-chats",eventChatRouter)

// const PORT = process.env.PORT || 3000;
// httpServer.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}`);
// });

export  {httpServer};

