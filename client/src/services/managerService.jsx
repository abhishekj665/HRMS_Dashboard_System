import { API } from "../services/authService";

export const getUser = async (page, limit) => {
  try {
    const response = await API.get(
      `/manager/users?page=${page}&limit=${limit}`
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getRequestData = async () => {
  try {
    let response = await API.get("/manager/request");

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const approveRequest = async (id) => {
  try {
    const response = await API.put(`/manager/request/approve/${id}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.response?.data || error.message,
    };
  }
};

export const rejectRequest = async (id, remark) => {
  try {
    let response = await API.put(`/manager/request/reject/${id}`, {
      remark: remark,
    });

    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.response?.data || error.message,
    };
  }
};

export const getAllAssets = async () => {
  try {
    let response = await API.get(`/manager/asset`);

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getAllExpenses = async () => {
  try {
    let response = await API.get("/manager/expense");
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
    let response = await API.put(`/manager/expense/approve/${id}`);
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
    let response = await API.put(`/manager/expense/reject/${id}`, {
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

export const registerUser = async (data) => {
  try {
    let response = await API.post("/manager/user/register", {
      data: data,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};


export const createAssetRequest = async (data) => {
  try {
    const payload = {
      assetId: data.assetId,
      quantity: 1,
      description: data.description,
      title: data.title,
    };

    let response = await API.post("/manager/asset/request", payload);
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

export const getAssetInfo = async () => {
  try {
    let response = await API.get("/manager/assets");

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


