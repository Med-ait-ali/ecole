import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Absence } from '../../context/types';
import { AlertCircle, Trash2 } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TeacherAbsences() {
  const { currentUser, students, absences, addAbsence, deleteData } = useSchool();
  const [newAbsence, setNewAbsence] = useState<Partial<Absence>>({ justifiee: false });
  const [selectedStudent, setSelectedStudent] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!currentUser) return null;

  const myStudents = students.filter(s => s.enseignant_ids.includes(currentUser.id));
  const myAbsences = absences.filter(a => a.enseignant_id === currentUser.id);

  const handleAddAbsence = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !newAbsence.motif) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    
    try {
      await addAbsence({
        id: crypto.randomUUID(),
        eleve_id: selectedStudent,
        enseignant_id: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        motif: newAbsence.motif,
        justifiee: newAbsence.justifiee || false
      });
      
      setNewAbsence({ justifiee: false, motif: '' });
      setSelectedStudent('');
      
    } catch (error) {
      console.error('Error adding absence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteData('absence', deleteId);
        setDeleteId(null);
      } catch (error) {
        console.error('Error deleting absence:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Gestion des Absences</h1>

      {/* Add Absence Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-red-600" />
          Signaler une absence
        </h2>
        <form onSubmit={handleAddAbsence} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
              value={newAbsence.motif || ''}
              onChange={e => setNewAbsence({ ...newAbsence, motif: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="justifiee"
              className="w-4 h-4 text-green-600"
              checked={newAbsence.justifiee}
              onChange={e => setNewAbsence({ ...newAbsence, justifiee: e.target.checked })}
              disabled={isLoading}
            />
            <label htmlFor="justifiee" className="text-sm font-medium text-gray-700">Justifiée</label>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium col-span-1 md:col-start-4 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>

      {/* Absences List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="p-4 font-semibold text-gray-700 border-b border-gray-100 bg-gray-50">Historique des absences signalées</h3>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Date</th>
              <th className="p-4 font-semibold text-gray-600">Élève</th>
              <th className="p-4 font-semibold text-gray-600">Motif</th>
              <th className="p-4 font-semibold text-gray-600">Statut</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {myAbsences.slice().reverse().map(absence => {
              const student = students.find(s => s.id === absence.eleve_id);
              return (
                <tr key={absence.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600">
                    {format(new Date(absence.date), 'dd MMMM yyyy', { locale: fr })}
                  </td>
                  <td className="p-4 font-medium text-gray-900">{student?.nom || 'Inconnu'}</td>
                  <td className="p-4 text-gray-600">{absence.motif}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${absence.justifiee ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {absence.justifiee ? 'Justifiée' : 'Non justifiée'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setDeleteId(absence.id)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {myAbsences.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Aucune absence enregistrée.
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
        title="Supprimer l'absence"
        message="Êtes-vous sûr de vouloir supprimer cette absence ? Cette action est irréversible."
      />
    </div>
  );
}