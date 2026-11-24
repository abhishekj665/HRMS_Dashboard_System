import { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Close } from "@mui/icons-material";

export const getReceiptName = (url) => {
  if (!url) return "Receipt";
  try {
    const path = new URL(url).pathname;
    const filename = decodeURIComponent(path.split("/").pop() || "");
    return filename.replace(/^v\d+_/, "") || "Receipt";
  } catch {
    return "Receipt";
  }
};

const ExpenseReceiptPreview = ({ open, onClose, url }) => {
  const name = useMemo(() => getReceiptName(url), [url]);
  const isPdf = /\.pdf(?:$|[?#])/i.test(url || "");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth fullScreen={typeof window !== "undefined" && window.innerWidth < 600}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Typography component="span" noWrap title={name}>{name}</Typography>
        <IconButton aria-label="Close receipt preview" onClick={onClose}><Close /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 1, sm: 2 }, height: { xs: "calc(100dvh - 64px)", sm: "min(78vh, 900px)" }, bgcolor: "#f3f4f6", overflow: "auto" }}>
        {url && (isPdf ? (
          <Box component="iframe" src={url} title={name} sx={{ width: "100%", height: "100%", minHeight: 320, border: 0, bgcolor: "white" }} />
        ) : (
          <Box component="img" src={url} alt={name} sx={{ display: "block", width: "100%", height: "100%", minHeight: 240, objectFit: "contain" }} />
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseReceiptPreview;
