import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
const app =express()


app.use(cors( { 
    origin: process.env.CORS_ORIGIN,
    credentials: true}));

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/public",express.static("public"))

app.use(cookieParser())



//import router
import userRouter from "./routes/user.routes.js"
app.use("/users",userRouter)


//define routes

export default app;