import { API } from "../redux/auth/authService";

export const createAccount = async (data) => {
  try {
    let response = await API.post("/account", data);

    return response.data;
  } catch (error) {
    return;
  }
};
