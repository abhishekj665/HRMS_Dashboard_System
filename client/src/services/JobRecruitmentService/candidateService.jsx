import { publicAPI } from "../AuthService/authService";

export const getCandidate = async (email, orgSlug) => {
  try {
    const response = await publicAPI.get("/recruitment/candidate/get-by-email", {
      params: { email, orgSlug },
    });
    console.log("Candidate response:", response.data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message || "Failed to fetch candidate details",
      status: error?.response?.status || 500,
    };
  }
};
