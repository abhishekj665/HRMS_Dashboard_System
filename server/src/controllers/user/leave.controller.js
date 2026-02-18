import * as leaveService from "../../services/LMS/leave.service.js";
import {successResponse, errorResponse} from "../../utils/response.utils.js";
import STATUS from "../../constants/Status.js";


export const registerLeaveRequest = async (req, res, next) => {
    try{
        const response = await leaveService.registerLeaveRequest(req.body, req.user.id);

        if(response.success){
            return successResponse(res, response.data, response.message, STATUS.ACCEPTED);
        }else{
            return errorResponse(res, response.message, STATUS.BAD_REQUEST)
        }
    }catch(error){
        next(error);
    }
}
