import Razorpay from "razorpay";
import {env } from "../config/env.js";


var razorpayInstance = new Razorpay({
  key_id: env.razorpay_key_id,
  key_secret: env.razorpay_key_secret,
});

export default razorpayInstance;