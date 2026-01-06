import { blockIP, getUser, unBlockIP } from "../services/adminService";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import { useSelector } from "react-redux";

import { Button, Card, CardContent } from "@mui/material";

export default function UserAssetPage() {
  const assets = ["Laptop", "Tab", "Panel", "Increment", "Promotion"];

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Asset Requests
      </h1>

      <div className="flex flex-col gap-4">
        {assets.map((item) => (
          <Card
            key={item}
            className="rounded-2xl! shadow-sm! hover:shadow-md! transition"
          >
            <CardContent className="flex! items-center! justify-between!">
              <div>
                <h2 className="text-lg font-medium text-gray-800">{item}</h2>
                <p className="text-sm text-gray-500">
                  Request this asset to administration
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="contained" color="primary" size="small">
                  Create Request
                </Button>

                <Button variant="outlined" color="error" size="small">
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
