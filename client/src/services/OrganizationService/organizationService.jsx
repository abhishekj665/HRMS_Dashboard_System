import { API } from "../AuthService/authService";

export const registerOrganization = async (organizationData) => {
  try {
    const isFormData = organizationData instanceof FormData;
    const response = await API.post("/organization/register", organizationData, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data;
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Failed to register organization",
    };
  }
};
