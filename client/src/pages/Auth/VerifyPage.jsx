import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";
import { Button } from "@mui/material";
import { verify } from "../../services/authService";
import { toast } from "react-toastify";

const VerifyPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    purpose: "",
  });

  const [success, setSuccess] = useState(false);

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
    formData.purpose = "login";
    const response = await verify(formData);

    try {
      if (response.success) {
        setSuccess(response.success);
        toast.success(response.message);
        resetForm();
      } else {
        toast.error(response.message);
        resetForm();
      }
    } catch (error) {
      toast.error(error.message);
      resetForm();
    }
  };

  const handleClick = () => {
    navigate("/login");
  };

  const resetForm = () => {
    setFormData({
      email: "",
      otp: "",
      purpose: "",
    });
  };

  return (
    <div>
      <div className="signup-container justify-center items-center flex flex-col gap-5 mt-10">
        {success == true ? (
          <div>
            <p>You can now LogIn</p>
            <Button
              style={{ marginTop: "20px" }}
              onClick={handleClick}
              variant="contained"
            >
              Click me
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="text-left w-full text-2xl font-medium mb-5">
              Verify Your Account -{" "}
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
                label="OTP"
                name="otp"
                type="number"
                value={formData.otp}
                onChange={handleChange}
                variant="outlined"
                className="[&_.MuiInputBase-root]:h-11 p"
                fullWidth
              />
            </div>

            <Button
              style={{ marginTop: "20px" }}
              type="submit"
              variant="contained"
            >
              Verify
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;
