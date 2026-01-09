import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import {registerUser,refreshAccessToken} from "../controllers/user.controller.js"
import { loginUser } from "../controllers/user.controller.js";
import { logout } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { updatePassward,updateDetails,getUserChanelProfile,getWatchHistory } from "../controllers/user.controller.js";
const router=Router();
router.route("/login").post(loginUser)
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1,
        },
        {
            name:"coverimage",
            maxCount:1

        }

    ]),
    registerUser)
    
    router.route("/logout").post(verifyJWT,logout)
    router.route("/refreshToken").post(refreshAccessToken)
    router.route("/change-passward").post(verifyJWT,updatePassward)
    router.route("/change-details").patch(verifyJWT,updateDetails)
    router.route("/channel/:username").get(verifyJWT,getUserChanelProfile)
    router.route("/history").get(verifyJWT,getWatchHistory)


export default router;