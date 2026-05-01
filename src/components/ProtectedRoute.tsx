import { Navigate } from "react-router-dom";
import { isAdminAuthed } from "@/lib/adminAuth";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAdminAuthed()) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};
