import { Box, Stack, Typography } from "@mui/material";

export default function DetailRow({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
      {icon && <Box color="text.secondary">{icon}</Box>}
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {value || "N/A"}
        </Typography>
      </Box>
    </Stack>
  );
}
