import * as leaveService from "../../services/LMS/leave.service.js";
import * as leaveApprovalService from "../../services/LMS/leaveApproval.service.js";
import {successResponse, errorResponse} from "../../utils/response.utils.js";


export const approveLeaveRequest = async (req, res, next) => {
try{
    const response = await leaveApprovalService.approveLeaveRequest(req.params.id, req.body);

    if(response.success){
        return successResponse(res, response.data, response.message, STATUS.ACCEPTED);
    }else{
        return errorResponse(res, response.message, STATUS.BAD_REQUEST)
    }

    
}catch(error){
    next(error);
}
}