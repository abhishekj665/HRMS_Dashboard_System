

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";

import { useSelector } from "react-redux";


import { getAllAssets } from "../../services/managerService";

const statusColor = (status) => {
  switch (status) {
    case "available":
      return "success";
    case "assigned":
      return "primary";
    case "repairing":
      return "warning";
    case "not-available":
      return "error";
    default:
      return "default";
  }
};



const ManagerAsset = () => {
  
  const [assets, setAssets] = useState([]);
  

  

  

  const fetchAssets = async () => {
    const res = await getAllAssets();
    
    if (res?.success) setAssets(res.data.data);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  
  return (
    <div className="max-w-full mx-auto mt-10 px-6">
      <h1 className="text-2xl font-semibold mb-6">Asset Management</h1>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">All Assets</h2>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {assets.map((a, i) => (
                <TableRow key={a.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{a.title}</TableCell>
                  <TableCell>{a.category}</TableCell>
                  <TableCell>₹{a.price}</TableCell>
                  <TableCell>{a.totalQuantity}</TableCell>
                  <TableCell>{a.availableQuantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        a.availableQuantity > 0 ? a.status : "not available"
                      }
                      size="small"
                      color={statusColor(
                        a.availableQuantity > 0 ? a.status : "not-available"
                      )}
                      sx={{ textTransform: "capitalize", fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default ManagerAsset;
