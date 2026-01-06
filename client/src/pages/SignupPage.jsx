import React from "react";
import { useState } from "react";
import { registerUser, loginUser } from "../redux/auth/authThunk.jsx";
import { useDispatch } from "react-redux";
import { TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { login, verify } from "../redux/auth/authService.jsx";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    otp: "",
    purpose: "",
  });

  const [verification, setVerification] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // setVerification(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      let response = await dispatch(registerUser(formData)).unwrap();
      if (response.success) {
        toast.success(response.message);
        setVerification(true);
      } else {
        toast.error(response.message);
        resetData();
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
      resetData();
    }
  };

  const handleVerification = async () => {
    formData.purpose = "signup";
    try {
      let response = await verify(formData);
      if (response.success) {
        navigate("/home");
        toast.success("Veirfied Successfully, LoggedIn");
      } else {
        toast.error(response.message);
        resetData();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // if (response.token) {
  //       await dispatch(loginUser(formData)).unwrap();
  //       navigate("/");
  //       return;
  //     }

  const resetData = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
    });
  };

  return (
    <>
      <div className="signup-container justify-center items-center flex flex-col gap-5 mt-10">
        <form onSubmit={handleSubmit}>
          <h1 className="text-left w-full text-2xl font-medium mb-5">
            SignUp -
          </h1>
          <p className="mb-5">
            <a href="/login" className=" text-blue-400 hover:text-blue-500 ">
              Already have an account ?
            </a>
          </p>
          <div className="form flex card flex-col gap-8 w-80 ">
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              required
              className="[&_.MuiInputBase-root]:h-11 p"
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              required
              className="[&_.MuiInputBase-root]:h-11 p"
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              required
              className="[&_.MuiInputBase-root]:h-11 p"
            />
            {verification == true ? (
              <TextField
                label="Enter OTP"
                name="otp"
                type="password"
                value={formData.otp}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                required
                className="[&_.MuiInputBase-root]:h-11 p"
              />
            ) : (
              ""
            )}
          </div>

          {verification === true ? (
            <Button
              style={{ marginTop: "20px" }}
              onClick={handleVerification}
              variant="contained"
            >
              Verify
            </Button>
          ) : (
            <Button
              style={{ marginTop: "20px" }}
              type="submit"
              variant="contained"
            >
              Register
            </Button>
          )}
        </form>
      </div>
    </>
  );
};

export default SignUpPage;
