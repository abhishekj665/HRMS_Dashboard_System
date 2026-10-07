import { API } from "../AuthService/authService";

export const getAllJobRequisitions = async () => {
  try {
    const response = await API.get("/recruitment/job-requisitions");
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch job requisitions",
    };
  }
};

export const registerJobRequisition = async (data) => {
  try {
    const response = await API.post("/recruitment/job-requisition", data);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to register job requisition",
    };
  }
};

export const updateJobRequisition = async (id, data) => {
  try {
    const response = await API.put(`/recruitment/job-requisition/${id}`, data);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to update job requisition",
    };
  }
};

export const approveJobRequisition = async (id) => {
  try {
    const response = await API.patch(`/recruitment/job-requisition/approve/${id}`);
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to approve job requisition",
    };
  }
};

export const rejectJobRequisition = async (id, remark) => {
  try {
    const response = await API.patch(`/recruitment/job-requisition/reject/${id}`, { remark });
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to reject job requisition",
    };
  }
};
