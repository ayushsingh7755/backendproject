import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import  {uploadonCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";
const registerUser= asyncHandler(async(req,res)=>{
    const{fullname,username,passward,email}=req.body
    if([fullname,username,passward,email].some((fields)=>fields?.trim() ==="" )){
        throw new ApiError(400,"All fields are required")

    }
    const existedUser= await User.findOne(
       {
        $or:[{username},{email}]
       }
    )
    if (existedUser){
        throw new ApiError(409,"User already exists")
    }
    
  const avatarLocalpath= req.files?.avatar[0]?.path;
  const{avatar,coverimage}=req.files
  if(!avatar){
    throw new ApiError(400,"Avatar is required")

  }
  if(!avatarLocalpath){
    throw new ApiError(400,"Avatar is required")
    
  }
  
   let coverimageLocalpath;
    if (req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0) {
        coverimageLocalpath = req.files.coverimage[0].path
    }
  const avatarC= await uploadonCloudinary( avatarLocalpath);
  const coverimageC= await uploadonCloudinary(coverimageLocalpath );
   const user= await User.create(
    {
        fullname,
        username,
        passward,
        email,
        avatar:avatarC.url,
        coverimage:coverimageC?.url || "",
    }
   )
   const createdUser= await User.findById(user._id).select(
    "-refreshtoken -passward"
   )
   if(!createdUser){
    throw new ApiError(500,"Somethig went wrong while registering the user")
   }
   return res.status(201).json(
    new ApiResponse(201,createdUser,"User registered succesfully")
   )
   

})
export {registerUser}