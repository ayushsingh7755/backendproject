
import connectDb from "./db/index.js";

import dotenv from "dotenv";
dotenv.config({
    path:'./env'
})

connectDb()


// ;(async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGO_URL}/${db_name}`)

//         app.listen(`${process.env.PORT}`,()=>{
//             console.log(`App running on the port,${process.env.PORT}`)
//         })
//     }
//      catch (error) {
//         console.log("Error connecting to database",error)
//         throw(error)
        
//     }
// })()