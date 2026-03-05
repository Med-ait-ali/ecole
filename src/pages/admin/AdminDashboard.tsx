import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Users, GraduationCap, AlertCircle, FileText, Trash2 } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function AdminDashboard() {
  const { students, users, absences, publications, deleteData } = useSchool();
  const [deleteType, setDeleteType] = useState<'publication' | 'absence' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalStudents = students.length;
  const totalTeachers = users.filter(u => u.role === 'enseignant').length;
  const totalAbsences = absences.length;
  const totalPosts = publications.length;

  const confirmDelete = () => {
    if (deleteId && deleteType) {
      deleteData(deleteType, deleteId);
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  const requestDelete = (type: 'publication' | 'absence', id: string) => {
    setDeleteType(type);
    setDeleteId(id);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Vue d'ensemble</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Élèves</p>
            <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Enseignants</p>
            <p className="text-2xl font-bold text-gray-900">{totalTeachers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-lg text-red-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Absences</p>
            <p className="text-2xl font-bold text-gray-900">{totalAbsences}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Publications</p>
            <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernières Publications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dernières Publications</h2>
          <div className="space-y-4">
            {publications.slice().reverse().slice(0, 5).map(pub => (
              <div key={pub.id} className="flex items-start justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0 group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-600 font-bold text-xs">
                    {pub.auteur_nom?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{pub.titre}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{pub.contenu}</p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {pub.date} • {pub.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => requestDelete('publication', pub.id)}
                  className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {publications.length === 0 && (
              <p className="text-gray-500 italic">Aucune publication.</p>
            )}
          </div>
        </div>

        {/* Absences Récentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Absences Récentes</h2>
          <div className="space-y-4">
            {absences.slice().reverse().slice(0, 5).map(abs => {
              const student = students.find(s => s.id === abs.eleve_id);
              return (
                <div key={abs.id} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                      <AlertCircle size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student?.nom || 'Inconnu'}</p>
                      <p className="text-xs text-gray-500">{abs.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${abs.justifiee ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {abs.justifiee ? 'Justifiée' : 'Non justifiée'}
                    </span>
                    <button
                      onClick={() => requestDelete('absence', abs.id)}
                      className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            {absences.length === 0 && (
              <p className="text-gray-500 italic">Aucune absence.</p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => { setDeleteId(null); setDeleteType(null); }}
        onConfirm={confirmDelete}
        title="Supprimer l'élément"
        message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
      />
    </div>
  );
}