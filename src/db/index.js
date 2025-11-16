import mongoose from "mongoose";
import { db_name } from "../constants.js";
const connectDb=async()=>{
    try {
        const connectionResponse=await mongoose.connect(`${process.env.MONGO_URL}/${db_name}`)
        console.log(`the DB conection is at ${connectionResponse.connection.host}`)
    } catch (error) {
        console("Error connection to ayush DB",error)
        process.exit(1)
        
    }
}
export default connectDb;
