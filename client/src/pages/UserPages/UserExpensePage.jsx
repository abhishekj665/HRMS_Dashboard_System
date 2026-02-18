import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";

import CancelPresentationRoundedIcon from "@mui/icons-material/CancelPresentationRounded";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import { createExpense } from "../../services/ExpenseService/expensesService";
import { getExpenses } from "../../services/ExpenseService/expensesService";
import { createAccount } from "../../services/AccountService/accountService";

import { socket } from "../../socket";

const statusColor = (status) => {
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  return "warning";
};

export default function UserExpensePage() {
  const [openForm, setOpenForm] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [hasAccount, setHasAccount] = useState(true);
  const [openRegisterForm, setOpenRegisterForm] = useState(false);

  const [openPreview, setOpenPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [accountForm, setAccountForm] = useState({
    email: "",
    pin: "",
  });

  const [formData, setFormData] = useState({
    amount: "",
    expenseDate: "",
    bill: null,
    pin: "",
  });

  const fetchExpenses = async () => {
    try {
      const response = await getExpenses();

      if (response?.success) {
        setExpenses(response.data);
      } else {
        toast.info(response.message);
        setHasAccount(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchExpenses();

    socket.on("expenseUpdated", fetchExpenses);
    socket.on("expenseCreated", fetchExpenses);

    return () => {
      socket.off("expenseUpdated", fetchExpenses);
      socket.off("expenseCreated", fetchExpenses);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (!hasAccount) {
        const { email, pin } = accountForm;

        if (!email || !pin) {
          toast.error("Email and PIN are required");
          return;
        }

        const res = await createAccount({ email, pin });

        if (res.success) {
          toast.success("Account created successfully");
          setHasAccount(true);
          setOpenRegisterForm(false);
          setAccountForm({ email: "", pin: "" });
          return;
        } else {
          toast.error(res.message);
          return;
        }
      }

      const { amount, expenseDate, pin, bill } = formData;

      if (!amount || !expenseDate || !pin) {
        toast.error("Amount, date and PIN are required");
        return;
      }

      const data = new FormData();
      data.append("amount", amount);
      data.append("expenseDate", expenseDate);
      data.append("pin", pin);

      if (bill) data.append("bill", bill);

      const response = await createExpense(data);

      if (response.success) {
        toast.success("Expense created");
        fetchExpenses();
        setOpenForm(false);
        setFormData({
          amount: "",
          expenseDate: "",
          bill: null,
          pin: "",
        });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="p-2 max-w-full mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Expense Requests
      </h1>

      <Button
        variant="contained"
        onClick={() => {
          if (!hasAccount) {
            setOpenRegisterForm(true);
          } else {
            setOpenForm(true);
          }
        }}
      >
        {hasAccount ? "Create Expense" : "Create Account"}
      </Button>

      {expenses.length > 0 && (
        <div className="mt-10 p-6">
          <h2 className="text-xl font-semibold mb-4">Your Expenses</h2>

          <TableContainer style={{ backgroundColor: "#F5F5F5" }} component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Receipt</TableCell>
                  <TableCell>Remark</TableCell>
                  <TableCell>Reviewed by</TableCell>
                  <TableCell>Reviewed At</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {expenses.map((exp, index) => (
                  <TableRow key={exp.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>₹{exp.amount}</TableCell>
                    <TableCell>
                      {new Date(exp.expenseDate).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={exp.status}
                        color={statusColor(exp.status)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      {exp.receiptUrl ? (
                        <button
                          className="text-blue-600 underline"
                          onClick={() => {
                            setPreviewUrl(exp.receiptUrl);
                            setOpenPreview(true);
                          }}
                        >
                          View
                        </button>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell>
                      {exp.adminRemark || "Not responded yet"}
                    </TableCell>

                    <TableCell>
                      {exp?.reviewer?.role ? exp.reviewer.role : "-"}
                    </TableCell>

                    <TableCell>
                      {exp.reviewedAt
                        ? new Date(exp.reviewedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenForm(false)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-lg p-6 z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Expense</h2>
              <button onClick={() => setOpenForm(false)}>
                <CancelPresentationRoundedIcon />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <TextField
                label="Amount"
                name="amount"
                type="number"
                fullWidth
                value={formData.amount}
                onChange={handleChange}
              />

              <TextField
                label="Expense Date"
                name="expenseDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={formData.expenseDate}
                onChange={handleChange}
              />

              <Button variant="outlined" component="label">
                Upload Bill
                <input
                  type="file"
                  hidden
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    setFormData({ ...formData, bill: e.target.files[0] });
                  }}
                />
              </Button>

              <TextField
                label="Account PIN"
                name="pin"
                type="password"
                fullWidth
                value={formData.pin}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outlined"
                color="error"
                onClick={() => setOpenForm(false)}
              >
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
      {openRegisterForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenRegisterForm(false)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-lg p-6 z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Account</h2>
              <button onClick={() => setOpenRegisterForm(false)}>
                <CancelPresentationRoundedIcon />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <TextField
                label="Email"
                name="email"
                fullWidth
                value={accountForm.email}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, email: e.target.value })
                }
              />

              <TextField
                label="Set PIN"
                name="pin"
                type="password"
                fullWidth
                value={accountForm.pin}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, pin: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outlined"
                color="error"
                onClick={() => setOpenRegisterForm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={async () => {
                  if (!accountForm.email || !accountForm.pin) {
                    toast.error("Email and PIN required");
                    return;
                  }

                  const res = await createAccount(accountForm);

                  if (res.success) {
                    toast.success("Account created successfully");
                    setHasAccount(true);
                    setOpenRegisterForm(false);
                    setAccountForm({ email: "", pin: "" });
                  } else {
                    toast.error(res.message);
                  }
                }}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      )}
      {openPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-3xl h-[85vh] rounded-xl shadow-lg flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-semibold text-lg">Receipt -</h2>
              <button
                className="text-red-500 font-semibold"
                onClick={() => {
                  setOpenPreview(false);
                  setPreviewUrl(null);
                }}
              >
                Close
              </button>
            </div>

            <div className="flex-1 p-2">
              {previewUrl && (
                <iframe
                  src={previewUrl}
                  title="Receipt Preview"
                  className="w-full h-full rounded-md border"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
