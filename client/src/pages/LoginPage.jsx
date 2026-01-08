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

      if (response.success) {
        if (response?.user?.role === "admin") {
          navigate("/admin/dashboard");
          toast.success(response.message);
          resetData();
        } else {
          navigate("/home");
          toast.success(response.message);
          resetData();
        }
      } else {
        console.log("hello");
        toast.error(response.message);
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
      <div className="signup-container justify-center items-center flex flex-col gap-5 mt-10">
        <form onSubmit={handleSubmit}>
          <h2 className="text-left w-full text-2xl font-medium mb-5">
            Login -{" "}
          </h2>
          <p className="mb-5">
            <a href="/signup" className=" text-blue-400 hover:text-blue-500 ">
              Don't have an account?
            </a>
          </p>
          <div className="form flex card flex-col gap-8 w-80">
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              className="[&_.MuiInputBase-root]:h-11 p"
              fullWidth
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              className="[&_.MuiInputBase-root]:h-11 p"
              fullWidth
            />
          </div>

          <p className="mt-4 hover:underline hover:text-blue-700 text-blue-400">
            <a href="/verify">verify account ?</a>
          </p>

          <Button
            style={{ marginTop: "20px" }}
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
