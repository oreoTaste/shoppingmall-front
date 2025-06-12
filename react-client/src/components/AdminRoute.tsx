// src/components/AdminRoute.tsx

import type { ReactNode } from "react"; 
import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

type AdminRouteProps = {
  children: ReactNode;
};

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user } = useUser();

  if (!user || user.adminYn !== "Y") {
    return <Navigate to="/404" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;