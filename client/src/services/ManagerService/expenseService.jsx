import { API } from "../AuthService/authService";

export const getAllExpenses = async () => {
  try {
    const response = await API.get("/manager/expense");
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const approveExpense = async (id, data) => {
  try {
    const response = await API.put(`/manager/expense/approve/${id}`, {
      data: data,
    });
    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const rejectExpense = async (id, adminRemark) => {
  try {
    const response = await API.put(`/manager/expense/reject/${id}`, {
      adminRemark: adminRemark,
    });

    return response?.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
