import { useLoading } from "./loadingContext";
import "./index.css";
import CircularProgress from "@mui/material/CircularProgress";


export const GlobalLoader = () => {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className="prod-loader-overlay">
      <div className="prod-loader-card">
        <CircularProgress size={42} />
        <p>Loading...</p>
      </div>
    </div>
  );
}

