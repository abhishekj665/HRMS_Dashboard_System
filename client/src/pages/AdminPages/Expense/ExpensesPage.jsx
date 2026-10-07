import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";

import { Close } from "@mui/icons-material";

import { useState, useEffect } from "react";

import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import { socket } from "../../../socket";
import {
  getAllExpenses,
  approveExpense,
  rejectExpense,
} from "../../../services/AdminService/expenseService";

const statusColor = (status) => {
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  return "warning";
};

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);

  const { user } = useSelector((state) => state.auth);

  const [openRejectBox, setOpenRejectBox] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [remark, setRemark] = useState("");

  const [openReceipt, setOpenReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null);

  const role = user?.role;

  const fetchExpenses = async () => {
    const response = await getAllExpenses();

    if (response?.success) setExpenses(response.data);
  };

  const handleApprove = async (id) => {
    const isConfirmed = window.confirm("Approve this expense?");
    if (!isConfirmed) return;

    const response = await approveExpense(id);

    if (response.success) {
      toast.success("Expense approved");
      fetchExpenses();
    } else {
      toast.error(response.message);
    }
  };

  const handleReject = async (id, remark) => {
    const isConfirmed = window.confirm("Reject this expense?");
    if (!isConfirmed) return;

    setOpenRejectBox(false);
    setRemark("");

    await rejectExpense(id, remark);
    toast.success("Expense rejected");
    fetchExpenses();
  };

  useEffect(() => {
    fetchExpenses();

    socket.on("expenseCreated", fetchExpenses);
    socket.on("expenseUpdated", fetchExpenses);

    return () => {
      socket.off("expenseCreated", fetchExpenses);
      socket.off("expenseUpdated", fetchExpenses);
    };
  }, []);

  if (role !== "admin") {
    return <h1>You don't have permission for this dashboard</h1>;
  }

  return (
    <div className="p-2">
      <Typography variant="h5">Expense Requests</Typography>

      <TableContainer style={{ marginTop: "20px" }} component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Expense Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Receipt</TableCell>
              <TableCell>Reviewed By</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {expenses.map((exp, index) => (
              <TableRow key={exp.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{exp.employee.email.split("@")[0]}</TableCell>
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
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setReceiptUrl(exp.receiptUrl);
                        setOpenReceipt(true);
                      }}
                    >
                      View
                    </Button>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {exp?.reviewer?.role ? exp.reviewer.role : "-"}
                </TableCell>

                <TableCell align="center">
                  <div className="flex gap-2 justify-center">
                    {exp.employee.role == "manager" ? (
                      exp.status === "pending" ? (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleApprove(exp.id)}
                          >
                            Approve
                          </Button>

                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => {
                              setRejectId(exp.id);
                              setOpenRejectBox(true);
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-gray-400 font-semibold">-</span>
                      )
                    ) : (
                      " - "
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {openRejectBox && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">Reject Expense</h2>

            <textarea
              className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-red-400"
              rows="4"
              placeholder="Enter reject reason..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 border rounded-lg"
                onClick={() => {
                  setOpenRejectBox(false);
                  setRemark("");
                }}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                onClick={() => {
                  if (!remark.trim()) {
                    toast.error("Please enter reject reason");
                    return;
                  }
                  handleReject(rejectId, remark);
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
      <Dialog
        open={openReceipt}
        onClose={() => setOpenReceipt(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Expense Receipt
          <IconButton
            onClick={() => {
              setOpenReceipt(false);
              setReceiptUrl(null);
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            height: "80vh",
          }}
        >
          {receiptUrl && (
            <iframe
              src={receiptUrl}
              title="Expense Receipt"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesPage;
