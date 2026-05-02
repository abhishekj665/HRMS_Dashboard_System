import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function Topbar({ open, setOpen }) {
  return (
    <div className="md:hidden h-14 border-b flex items-center px-2 bg-white">
      <IconButton onClick={() => setOpen(!open)}>
        <MenuIcon />
      </IconButton>
    </div>
  );
}
