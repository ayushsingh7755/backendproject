import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
const app =express()
app.get('/',(req,res)=>{
    res.send("hello")
})

app.use(cors());

app.use(express.json())
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use("/public",express.static("public"))

app.use(cookieParser())



//import router
import userRouter from "./routes/user.routes.js"
app.use("/users",userRouter)

//define routes

export default app;