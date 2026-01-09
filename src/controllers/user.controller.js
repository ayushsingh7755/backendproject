import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.models.js"

import  {uploadonCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import jwt from'jsonwebtoken'
const generateRefreshandAccessToken=async(userId)=>{
  const user=await User.findById(userId)
  const accessToken=await user.generateAccessToken()
  const refreshToken=await user.generateRefreshToken()
  user.refreshToken = refreshToken
   await user.save({ validateBeforeSave: false })
  return {accessToken,refreshToken}

}
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
const loginUser=asyncHandler(async(req,res)=>{
  // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie
   
  const{email,username,passward}=req.body
  if(!(username||email)){
    throw new ApiError(400,"User do not exist")
  }
  const user= await User.findOne({
    $or:[{username},{email}]
  })
  console.log(user.passward)
  console.log(passward)
  const isPasswardValid=await user.isPasswordCorrect(passward)
  console.log(isPasswardValid)
  if(!isPasswardValid){
    throw new ApiError(401,"Invalid password")
  }
   const {accessToken,refreshToken}=await generateRefreshandAccessToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
   const options={
        httpOnly: true,
        secure: false
   }
   return res.status(200).cookie("accessToken" ,accessToken,options)
   .cookie("refreshToken" ,refreshToken,options).json( 
    new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        ))



})
const logout=asyncHandler(async(req,res)=>{
  console.log("hey")
 await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: false
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})
const refreshAccessToken=async(req,res)=>{
    console.log("hey")
  const incomingrefreshToken=await req.cookies.refreshToken||req.body.refreshToken
  if(!incomingrefreshToken){
    throw new ApiError(400,"Invalid Access")

  }
  const decodedincomingrefreshToken=await jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET)
const user=await User.findById(decodedincomingrefreshToken._id)
if(!user){
   throw new ApiError(400,"Invalid Access")
}
if(user.refreshToken!==incomingrefreshToken){
  throw new ApiError(400,"wrong  Access")
}
const {accessToken,refreshToken}=generateRefreshandAccessToken(user._id)
const options={
  httpOnly:true,
  secure:false
}
res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
.json(
 new ApiResponse(
                200, 
                {accessToken, refreshToken: RefreshToken},
                "Access token refreshed"
            )
)
}
const updatePassward=asyncHandler(async(req,res)=>{
  const{oldpassward,newPassward}=req.body
  const user=await User.findById(req.user?._id)
  if(!user){
    throw new ApiError(400,"Old Passward incorrect")
  }
  if(oldpassward!==user._id){
    throw new ApiError(400,"Old Passward incorrect")
  }
  user.passward=newPassward
  user.save({validateBeforeSave:false})
  return res.status(200).json(
    new ApiResponse(200,{},"passward changed successfully")
  )

})
const updateDetails=asyncHandler(async(req,res)=>{
  const{fullname,username,email}=req.body
   if(!(username||email)){
    throw new ApiError(400,"invalid authorisation")

  }
 const user =await User.findByIdAndUpdate(
  req.user._id,
  {
    $set:{
      fullname,
      email:email,
      username:username

    }
   
  },
   {new:true}

 ).select("-passward")
 return res.stauts(200).json(
  new ApiResponse(200,user,"Details updated successfully")
 )
  

})
const getUserChanelProfile=asyncHandler(async(req,res)=>{
    const{username}=req.params
    if(!username){
        throw new ApiError(400,"Username not given")

    }
    const chanel=await User.aggregate([
        {
            $match:{
                username:username
            }
        },
        {
          $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"chanel",
            as:"subscribers"

          }  ,
          
        }
        ,{
          $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribing"
          }
        },
        {$addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
         {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])
      if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }
    return res.status(200).json(
      new ApiResponse(200,chanel,"UserProfile data fetched successsfully")
    )
})
const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})
export {registerUser,loginUser,logout,refreshAccessToken,updatePassward,updateDetails,getUserChanelProfile,getWatchHistory}