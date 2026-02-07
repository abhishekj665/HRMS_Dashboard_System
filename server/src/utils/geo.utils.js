import axios from "axios";
import { env } from "../config/env.js";

export const getLocationFromIp = async (ip) => {
  try {
    const cleanIp = ip.replace("::ffff:", "");

    if (cleanIp === "127.0.0.1" || cleanIp === "::1") {
      return null;
    }

    const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${env.geo_api_key}&ip=${cleanIp}`;

    const res = await fetch(url);

    const text = await res.text();

    if (!res.ok) throw new Error("ipgeolocation request failed");

    return JSON.parse(text);
  } catch (error) {
    console.error("Geo lookup failed:", error.message);
    return null;
  }
};
