import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SidebarItem } from './SidebarItem';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  LogOut, 
  Bell,
  Calendar,
  MessageSquare,
  Menu,
  X
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export function Layout() {
  const { currentUser, logout } = useSchool();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when route changes
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser) return null;

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-100 flex flex-col items-center relative">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
          <GraduationCap className="text-green-600" size={32} />
        </div>
        <h1 className="text-lg font-bold text-center text-gray-800 leading-tight">
          Fondation<br/>Al Bachir
        </h1>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {currentUser.role === 'admin' && (
          <>
            <SidebarItem icon={LayoutDashboard} label="Tableau de bord" to="/admin" />
            <SidebarItem icon={Users} label="Utilisateurs" to="/admin/users" />
            <SidebarItem icon={GraduationCap} label="Élèves" to="/admin/students" />
            <SidebarItem icon={Bell} label="Publications" to="/admin/posts" />
          </>
        )}

        {currentUser.role === 'enseignant' && (
          <>
            <SidebarItem icon={Users} label="Mes Élèves" to="/teacher" />
            <SidebarItem icon={BookOpen} label="Notes & Devoirs" to="/teacher/grades" />
            <SidebarItem icon={Calendar} label="Absences" to="/teacher/absences" />
            <SidebarItem icon={FileText} label="Mes Cours" to="/teacher/courses" />
          </>
        )}

        {currentUser.role === 'parent' && (
          <>
            <SidebarItem icon={Users} label="Mon Enfant" to="/parent" />
            <SidebarItem icon={BookOpen} label="Notes & Devoirs" to="/parent/grades" />
            <SidebarItem icon={Bell} label="Annonces" to="/parent/announcements" />
          </>
        )}

        <div className="pt-2 mt-2 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" onClick={() => navigate('/messages')}>
            <MessageSquare size={20} />
            <span className="font-medium">Messagerie</span>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
        <div className="text-xs text-center text-gray-400 font-medium pb-2 border-b border-gray-50">
          Created by Med Ait Ali Oulhoucien
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <aside className={`w-64 bg-white border-r border-gray-200 fixed h-full z-30 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col w-full">
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
              {currentUser.role === 'admin' ? 'Administration' : 
               currentUser.role === 'enseignant' ? 'Espace Enseignant' : 'Espace Parents'}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-gray-900">{currentUser.nom}</p>
              <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
              {currentUser.nom.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
