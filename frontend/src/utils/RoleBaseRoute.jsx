import React from "react";
import useAuth from "../context/useAuth.js";
import { Navigate } from "react-router-dom";

const RoleBaseRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[253px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-color5"></div>
        <span className="ml-3 text-color5 font-semibold">Loading...</span>
      </div>
    );
  }

  if (!requiredRole.includes(user.role)) {
    <Navigate to="/unauthorized" />;
  }

  return user ? children : <Navigate to="/login" />;
};

export default RoleBaseRoute;
