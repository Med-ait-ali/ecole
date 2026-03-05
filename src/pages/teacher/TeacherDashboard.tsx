import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../context/types';
import { UserPlus, Check, X } from 'lucide-react';

export default function TeacherDashboard() {
  const { currentUser, students, updateStudent } = useSchool();
  const [showAddMode, setShowAddMode] = useState(false);

  if (!currentUser) return null;

  // Students assigned to this teacher
  const myStudents = students.filter(s => s.enseignant_ids.includes(currentUser.id));
  
  // Students NOT assigned to this teacher
  const otherStudents = students.filter(s => !s.enseignant_ids.includes(currentUser.id));

  const handleAddStudent = (student: Student) => {
    updateStudent({
      ...student,
      enseignant_ids: [...student.enseignant_ids, currentUser.id]
    });
  };

  const handleRemoveStudent = (student: Student) => {
    updateStudent({
      ...student,
      enseignant_ids: student.enseignant_ids.filter(id => id !== currentUser.id)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Mes Élèves ({myStudents.length})</h1>
        <button 
          onClick={() => setShowAddMode(!showAddMode)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${showAddMode ? 'bg-gray-200 text-gray-800' : 'bg-green-600 text-white hover:bg-green-700'}`}
        >
          <UserPlus size={18} />
          {showAddMode ? 'Terminer' : 'Ajouter des élèves'}
        </button>
      </div>

      {showAddMode && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200 mb-6 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sélectionner des élèves à ajouter à votre classe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherStudents.map(student => (
              <div key={student.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{student.nom}</p>
                  <p className="text-sm text-gray-500">{student.classe}</p>
                </div>
                <button 
                  onClick={() => handleAddStudent(student)}
                  className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                >
                  <UserPlus size={16} />
                </button>
              </div>
            ))}
            {otherStudents.length === 0 && <p className="text-gray-500 col-span-full">Tous les élèves sont déjà dans votre liste.</p>}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Nom</th>
              <th className="p-4 font-semibold text-gray-600">Classe</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {myStudents.map(student => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{student.nom}</td>
                <td className="p-4 text-gray-600">{student.classe}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleRemoveStudent(student)}
                    className="text-red-500 hover:bg-red-50 px-3 py-1 rounded text-sm font-medium"
                  >
                    Retirer
                  </button>
                </td>
              </tr>
            ))}
             {myStudents.length === 0 && (
                <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">
                        Vous n'avez pas encore d'élèves. Cliquez sur "Ajouter des élèves".
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
