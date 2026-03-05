import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Grade } from '../../context/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function TeacherGrades() {
  const { currentUser, students, grades, addGrade, deleteData } = useSchool();
  const [newGrade, setNewGrade] = useState<Partial<Grade>>({ max_note: 20 });
  const [selectedStudent, setSelectedStudent] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!currentUser) return null;

  const myStudents = students.filter(s => s.enseignant_ids.includes(currentUser.id));
  const myGrades = grades.filter(g => g.enseignant_id === currentUser.id);

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !newGrade.matiere || newGrade.note === undefined) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    
    try {
      await addGrade({
        id: crypto.randomUUID(),
        eleve_id: selectedStudent,
        enseignant_id: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        matiere: newGrade.matiere,
        note: newGrade.note,
        max_note: newGrade.max_note || 20
      });
      
      setNewGrade({ max_note: 20, matiere: '', note: undefined });
      setSelectedStudent('');
      
    } catch (error) {
      console.error('Error adding grade:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteData('grade', deleteId);
        setDeleteId(null);
      } catch (error) {
        console.error('Error deleting grade:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Gestion des Notes</h1>

      {/* Add Grade Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ajouter une note</h2>
        <form onSubmit={handleAddGrade} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Élève</label>
            <select
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
              value={selectedStudent}
              onChange={e => setSelectedStudent(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">Sélectionner un élève</option>
              {myStudents.map(s => (
                <option key={s.id} value={s.id}>{s.nom} ({s.classe})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
              value={newGrade.matiere || ''}
              onChange={e => setNewGrade({ ...newGrade, matiere: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="20"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                value={newGrade.note !== undefined ? newGrade.note : ''}
                onChange={e => setNewGrade({ ...newGrade, note: parseFloat(e.target.value) })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="w-20">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sur</label>
              <input
                type="number"
                className="w-full border rounded-lg p-2 bg-gray-50 text-gray-500"
                value={newGrade.max_note}
                readOnly
                disabled={isLoading}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>

      {/* Grades History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="p-4 font-semibold text-gray-700 border-b border-gray-100 bg-gray-50">Historique des notes données</h3>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Date</th>
              <th className="p-4 font-semibold text-gray-600">Élève</th>
              <th className="p-4 font-semibold text-gray-600">Matière</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Note</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {myGrades.slice().reverse().map(grade => {
              const student = students.find(s => s.id === grade.eleve_id);
              return (
                <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600">
                    {format(new Date(grade.date), 'dd MMMM yyyy', { locale: fr })}
                  </td>
                  <td className="p-4 font-medium text-gray-900">{student?.nom || 'Inconnu'}</td>
                  <td className="p-4 text-gray-600">{grade.matiere}</td>
                  <td className="p-4 text-right font-bold text-gray-900">
                    {grade.note} <span className="text-gray-400 text-sm font-normal">/ {grade.max_note}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setDeleteId(grade.id)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {myGrades.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Aucune note enregistrée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer la note"
        message="Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible."
      />
    </div>
  );
}