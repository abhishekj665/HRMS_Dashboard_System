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
} from "@mui/material";

import { useState,useNavigate, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import { socket } from "../../socket";
import {
  getAllExpenses,
  approveExpense,
  rejectExpense,
} from "../../services/managerService";

const statusColor = (status) => {
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  return "warning";
};

const ManagerExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);

  const { user } = useSelector((state) => state.auth);

  const [openRejectBox, setOpenRejectBox] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [remark, setRemark] = useState("");

  const [openPreview, setOpenPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const navigate = useNavigate();

  if (user?.role != "manager") {
    setTimeout(() => {
      navigate("/login");
      toast.error("Only admin can access this page");
    }, 800);

    return;

    
  }

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
  };

  useEffect(() => {
    fetchExpenses();
    console.log("Manager socket id:", socket.id);

    socket.on("connect", () => {
      console.log("Manager connected:", socket.id);
    });

    socket.on("expenseCreated", () => {
      console.log("expenseCreated");
      fetchExpenses();
    });

    socket.on("expenseUpdated", () => {
      console.log("expenseUpdated");
      fetchExpenses();
    });

    return () => {
      socket.off("expenseCreated");
      socket.off("expenseUpdated");
    };
  }, []);

  if (role !== "manager") {
    return <h1>You don't have permission for this dashboard</h1>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Expense Requests</h1>

      <TableContainer component={Paper}>
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
                  {exp?.reviewer?.role ? exp.reviewer.role : "-"}
                </TableCell>

                <TableCell align="center">
                  <div className="flex gap-2 justify-center">
                    {exp.employee.role != "manager" ? (
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
                      "Your Request"
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
};

export default ManagerExpensesPage;
