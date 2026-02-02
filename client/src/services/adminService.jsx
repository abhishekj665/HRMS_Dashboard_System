import { API } from "../services/authService";

export const getUser = async (page, limit, search) => {

  try {
    const response = await API.get(
      `/admin/users?page=${page}&limit=${limit}&search=${search}`,
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const blockUser = async (id) => {
  try {
    const response = await API.put(`/admin/block/${id}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const unBlockUser = async (id) => {
  try {
    const response = await API.put(`/admin/unblock/${id}`);

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const blockIP = async (ip) => {
  try {
    const response = await API.put(`/admin/block`, { ip: ip });

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const unBlockIP = async (ip) => {
  try {
    const response = await API.put(`/admin/unblock`, { ip: ip });

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getRequestData = async () => {
  try {
    let response = await API.get("/admin/request");

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
    const response = await API.put(`/admin/request/approve/${id}`);
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
    let response = await API.put(`/admin/request/reject/${id}`, {
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
    let response = await API.get(`/admin/asset`);

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const createAsset = async (data) => {
  try {
    let response = await API.post(`/admin/asset`, data);

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const deleteAsset = async (id) => {
  try {
    let response = await API.delete(`/admin/asset/${id}`);

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const updateAsset = async (id, data) => {
  try {
    const res = await API.put(`/admin/asset/${id}`, data);
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getAllExpenses = async () => {
  try {
    let response = await API.get("/admin/expense");
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

export const getManagers = async () => {
  try {
    const { data } = await API.get("/admin/manager");
    return data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
export const assignManager = async (payload) => {
  try {
    const { data } = await API.patch("/admin/manager/assign", payload);
    return data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getManagersWithUsers = async () => {
  try {
    let response = await API.get("/admin/manager/users");

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const registerNewManager = async (data) => {
  try {
    let response = await API.post("/admin/manager/register", {
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

export const registerUser = async (data) => {
  try {
    let response = await API.post("/admin/user/register", {
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

export const getAllIps = async () => {
  try {
    let response = await API.get("/admin/ips");
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};