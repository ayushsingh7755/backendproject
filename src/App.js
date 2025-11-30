import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
const app =express()
app.use(cors());
app.use(cookieParser)
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
//import router
import userRouter from "./routes/user.routes.js"
//define routes
app.use("/users",userRouter)
export default app;