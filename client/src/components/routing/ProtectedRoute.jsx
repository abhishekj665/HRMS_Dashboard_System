import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { fetchUser } from "../../redux/auth/authThunk";
import { AUTH_SESSION_CHANGED_KEY } from "../../redux/auth/authSessionSync";

const ROLE_HOME = {
  admin: "/admin/dashboard",
  manager: "/manager/dashboard",
  employee: "/user/dashboard",
  user: "/user/dashboard",
};

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

export default function ProtectedRoute({ allowedRoles, children }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isAuthenticated, initialized, loading } = useSelector(
    (state) => state.auth,
  );
  const bootstrapStarted = useRef(false);

  useEffect(() => {
    if (!initialized && !bootstrapStarted.current) {
      bootstrapStarted.current = true;
      dispatch(fetchUser());
    }
  }, [dispatch, initialized]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === AUTH_SESSION_CHANGED_KEY) dispatch(fetchUser());
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [dispatch]);

  // Keep authenticated pages mounted during background session refreshes.
  // Focus is triggered when native file pickers close; unmounting here would
  // reset open dialogs/forms while the request is in flight.
  if (!initialized || (loading && !user)) {
    return (
      <Stack
        role="status"
        aria-live="polite"
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{ minHeight: "100vh", color: "text.secondary" }}
      >
        <CircularProgress size={30} />
        <Typography variant="body2">Checking your session…</Typography>
      </Stack>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = normalizeRole(user.role);
  const allowed = allowedRoles?.map(normalizeRole);
  if (allowed?.length && !allowed.includes(role)) {
    return <Navigate to={ROLE_HOME[role] || "/login"} replace />;
  }

  return children || <Outlet />;
}
