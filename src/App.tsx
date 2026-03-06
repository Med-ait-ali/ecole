import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSchool } from './context/SchoolContext';
import Login from './pages/Login';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStudents from './pages/admin/AdminStudents';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherGrades from './pages/teacher/TeacherGrades';
import TeacherContent from './pages/teacher/TeacherContent';
import TeacherAbsences from './pages/teacher/TeacherAbsences';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';
import ParentGrades from './pages/parent/ParentGrades';
import ParentAnnouncements from './pages/parent/ParentAnnouncements';

// Shared Pages
import Messages from './pages/Messages';

function AppRoutes() {
  const { currentUser } = useSchool();

  return (
    <Routes>
      {/* Route racine - redirection selon le rôle ou page de login */}
      <Route 
        path="/" 
        element={
          currentUser ? (
            currentUser.role === 'admin' ? <Navigate to="/admin" /> :
            currentUser.role === 'enseignant' ? <Navigate to="/teacher" /> :
            <Navigate to="/parent" />
          ) : (
            <Login />
          )
        } 
      />
      
      {/* Routes avec Layout (sidebar) */}
      <Route element={<Layout />}>
        {/* Routes Admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/posts" element={<TeacherContent />} />
        </Route>

        {/* Routes Enseignant */}
        <Route element={<ProtectedRoute allowedRoles={['enseignant']} />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/grades" element={<TeacherGrades />} />
          <Route path="/teacher/courses" element={<TeacherContent />} />
          <Route path="/teacher/absences" element={<TeacherAbsences />} />
        </Route>

        {/* Routes Parent */}
        <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/parent/grades" element={<ParentGrades />} />
          <Route path="/parent/announcements" element={<ParentAnnouncements />} />
        </Route>

        {/* Routes partagées (Messagerie accessible à tous les rôles) */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'enseignant', 'parent']} />}>
          <Route path="/messages" element={<Messages />} />
        </Route>
      </Route>
      
      {/* Route par défaut - redirection vers la racine */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}