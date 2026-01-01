import React from "react";
import { useState } from "react";
import { registerUser, loginUser } from "../redux/auth/authThunk.jsx";
import { useDispatch } from "react-redux";
import { TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    username: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      const response = await dispatch(registerUser(formData)).unwrap();
      console.log(response.message);
      toast.success(response.message);
      resetData();
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
      resetData();
    }
  };

  const resetData = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
    });
  };

  return (
    <>
      <div className="signup-container justify-center items-center flex flex-col gap-5">
        <h1 className="text-3xl font-medium mt-5">Sign Up</h1>
        <p>
          <a href="/login" className=" text-blue-400 hover:text-blue-500">
            Already have an account?
          </a>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form flex card flex-col gap-8">
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />

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
            Register
          </Button>
        </form>
      </div>
    </>
  );
};

export default SignUpPage;
