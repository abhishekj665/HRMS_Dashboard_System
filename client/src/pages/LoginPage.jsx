import React from "react";
import { useState } from "react";
import { registerUser, loginUser } from "../redux/auth/authThunk.jsx";
import { useDispatch } from "react-redux";
import { TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LogInPage = () => {
  let [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetData = () => {
    setFormData({
      email: "",
      password: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill all the fields");
      return;
    }
    try {
      const response = await dispatch(loginUser(formData)).unwrap();

      if (response.role === "admin") {
        navigate("/dashboard");
        toast.success(response.message);
        resetData();
      } else {
        toast.error("Login failed");
        resetData();
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
      resetData();
    }
  };
  return (
    <div>
      <div className="signup-container justify-center items-center flex flex-col gap-5">
        <h1 className="text-3xl font-medium mt-5">LogIn</h1>
        <p>
          <a href="/signup" className=" text-blue-400 hover:text-blue-500">
            Don't have an account?
          </a>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form flex card flex-col gap-8">
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />
          </div>

          <Button
            style={{ marginTop: "8px" }}
            type="submit"
            variant="contained"
          >
            LogIn
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LogInPage;
