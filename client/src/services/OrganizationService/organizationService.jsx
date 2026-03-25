import { API } from "../AuthService/authService";

export const registerOrganization = async (organizationData) => {
  try {
    const response = await API.post("/organization/register", organizationData);
    return response.data;
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Failed to register organization",
    };
  }
};
