import axios from "axios";
import { env } from "../config/env.js";

export const getLocationFromIp = async (ip) => {
  try {
    const response = await axios.get(`http://api.ipstack.com/${ip}`, {
      params: {
        access_key: env.geo_apikey,
      },
    });

    return response.data;
  } catch (error) {
    console.error("IP location lookup failed:", error.message);
    return null;
  }
};
