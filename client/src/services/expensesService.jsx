import { API } from "../redux/auth/authService";

export const getExpenses = async () => {
  try {
    const response = await API.get("/expenses");
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
    };
  }
};

export const createExpense = async (formData) => {
  try {
    const response = await API.post("/expenses", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
    };
  }
};


