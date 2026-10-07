import { API } from "../AuthService/authService";

export const getAllExpenses = async () => {
  try {
    const response = await API.get("/admin/expense");
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const approveExpense = async (id) => {
  try {
    let response = await API.put(`/admin/expense/approve/${id}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const rejectExpense = async (id, adminRemark) => {
  try {
    let response = await API.put(`/admin/expense/reject/${id}`, {
      adminRemark: adminRemark,
    });

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
