import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../context/types';
import { Trash2, UserPlus, GraduationCap } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function AdminStudents() {
  const { students, users, addStudent, deleteData } = useSchool();
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    nom: '',
    classe: '',
    parent_id: ''
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const parents = users.filter(u => u.role === 'parent');

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStudent.nom || !newStudent.classe || !newStudent.parent_id) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    
    try {
      await addStudent({
        id: crypto.randomUUID(), // استخدام UUID حقيقي
        nom: newStudent.nom,
        classe: newStudent.classe,
        parent_id: newStudent.parent_id,
        enseignant_ids: [],
        date_naissance: new Date().toISOString().split('T')[0]
      } as Student);
      
      // Reset form after successful addition
      setNewStudent({ nom: '', classe: '', parent_id: '' });
      
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Erreur lors de l\'ajout de l\'élève');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        await deleteData('student', studentToDelete);
        setStudentToDelete(null);
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Gestion des Élèves</h1>

      {/* Add Student Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus size={20} className="text-green-600" />
          Ajouter un élève
        </h2>
        <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
              value={newStudent.nom}
              onChange={e => setNewStudent({ ...newStudent, nom: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
              value={newStudent.classe}
              onChange={e => setNewStudent({ ...newStudent, classe: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
            <select
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
              value={newStudent.parent_id}
              onChange={e => setNewStudent({ ...newStudent, parent_id: e.target.value })}
              required
              disabled={isLoading}
            >
              <option value="">Sélectionner un parent</option>
              {parents.map(p => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Ajout en cours...' : 'Ajouter'}
          </button>
        </form>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Nom</th>
              <th className="p-4 font-semibold text-gray-600">Classe</th>
              <th className="p-4 font-semibold text-gray-600">Parent</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map(student => {
              const parent = users.find(u => u.id === student.parent_id);
              return (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                    <GraduationCap size={16} className="text-gray-400" />
                    {student.nom}
                  </td>
                  <td className="p-4 text-gray-600">{student.classe}</td>
                  <td className="p-4 text-gray-600">{parent?.nom || 'Non assigné'}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDeleteClick(student.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors" 
                      title="Supprimer"
                    >
                       <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Aucun élève trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer l'élève"
        message="Êtes-vous sûr de vouloir supprimer cet élève ? Cette action est irréversible."
      />
    </div>
  );
}