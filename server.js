import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import colors from "colors"
import { Server } from "socket.io"
import http from "http"
import cors from "cors"
import userRouter from "./routes/user.js"
import chatRouter from "./routes/chat.js"
import messageRouter from "./routes/message.js"
import { notFound, errorHandler } from "./middleware/errorHandler.js"
import protect from "./middleware/autherization.js"

dotenv.config()
const PORT = process.env.PORT || 5000
const corsOptions = {
	origin: process.env.FRONT_END_URL,
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
	cors: corsOptions,
	pingTimeout: 60000,
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	credentials: true, // Enable cookies and HTTP authentication information
	optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
})
app.use(cors(corsOptions))
app.use(express.json())
app.use("/api/user/", userRouter)
app.use("/api/chats/", protect, chatRouter)
app.use("/api/message/", protect, messageRouter)

app.get("/", (req, res) => {
	res.send("testing...")
})

app.use(notFound)
app.use(errorHandler)

io.on("connection", (socket) => {
	socket.on("setup", (userData) => {
		socket.join(userData.id)
		socket.emit("connected")
	})

	socket.on("joinChat", (room) => socket.join(room))

	socket.on("typing", (room) => socket.to(room).emit("ftyping"))
	socket.on("stopTyping", (room) => socket.to(room).emit("fstopTyping"))

	socket.on("newMessage", (messageRecieved) => {
		console.log(messageRecieved)
		const users = messageRecieved.chat.users
		console.log(users, messageRecieved.sender)
		users.forEach((user) => {
			if (user._id != messageRecieved.sender._id) {
				socket.to(user._id).emit("messageReceived", messageRecieved)
			}
		})
		// socket.to(messageRecieved.chat._id).emit("messageReceived", messageRecieved)
	})
	// socket.off("setup", ()=> {
	// 	console.log("User disconnected")
	// 	socket.leave(userData._id)
	// })
})










const start = async () => {
	server.listen(PORT, () =>
		console.log(`server listening on ${PORT} ... `.blue.bold)
	)
	await connectDB()
}

start()
