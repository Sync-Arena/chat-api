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
console.log(corsOptions)
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
	cors: corsOptions,
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	credentials: true, // Enable cookies and HTTP authentication information
	optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
})
app.use(cors(corsOptions))
app.use(express.json())
app.use("/api/user/", userRouter)
app.use("/api/chats/", protect, chatRouter)
app.use("/api/message/", protect, messageRouter)
app.use(notFound)
app.use(errorHandler)

app.get("/", (req, res) => {
	res.send("testing...")
})

const start = async () => {
	server.listen(PORT, () =>
		console.log(`server listening on ${PORT} ... `.blue.bold)
	)
	await connectDB()
}

start()
