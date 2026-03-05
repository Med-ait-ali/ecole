import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSchool } from '../context/SchoolContext';
import { Role } from '../context/types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { currentUser } = useSchool();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to their appropriate dashboard based on their role
    if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
    if (currentUser.role === 'enseignant') return <Navigate to="/teacher" replace />;
    if (currentUser.role === 'parent') return <Navigate to="/parent" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
