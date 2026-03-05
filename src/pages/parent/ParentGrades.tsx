import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { GraduationCap, FileText, BookOpen, Video, Download } from 'lucide-react';

export default function ParentGrades() {
  const { currentUser, students, grades, publications } = useSchool();
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  if (!currentUser) return null;

  // Find children linked to this parent
  const myChildren = students.filter(s => s.parent_id === currentUser.id);

  if (myChildren.length === 0) {
    return <div className="text-gray-500 text-center py-10">Aucun élève associé à ce compte parent.</div>;
  }

  // Default to first child if not selected
  const currentChild = selectedChildId 
    ? myChildren.find(c => c.id === selectedChildId) 
    : myChildren[0];

  if (!currentChild) return null;

  // Data for current child
  const childGrades = grades.filter(g => g.eleve_id === currentChild.id);
  
  // Homework & Courses (De type 'devoir', 'cours', 'video')
  const childContent = publications.filter(p => 
    (p.type === 'devoir' || p.type === 'cours' || p.type === 'video') &&
    (p.cible === 'tous' || 
     p.cible === 'parents' || 
     (p.cible === 'classe' && p.classe_cible === currentChild.classe))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Notes & Devoirs</h1>
        {myChildren.length > 1 && (
          <select 
            className="p-2 border rounded-lg bg-white shadow-sm"
            value={currentChild.id}
            onChange={(e) => setSelectedChildId(e.target.value)}
          >
            {myChildren.map(child => (
              <option key={child.id} value={child.id}>{child.nom}</option>
            ))}
          </select>
        )}
      </div>

      {/* Child Profile Banner */}
      <div className="bg-green-600 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
         <div>
            <h2 className="text-xl font-bold">{currentChild.nom}</h2>
            <p className="opacity-90">Classe : {currentChild.classe}</p>
         </div>
         <GraduationCap size={40} className="opacity-80" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grades Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Relevé de Notes
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {childGrades.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Matière</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {childGrades.slice().reverse().map(grade => (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{grade.matiere}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {format(new Date(grade.date), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-bold text-blue-600">
                        {grade.note} <span className="text-gray-400 font-normal text-xs">/ {grade.max_note}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-400">Aucune note enregistrée.</div>
            )}
          </div>
        </div>

        {/* Homework & Content Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-yellow-600" />
            Cahier de Textes (Devoirs & Cours)
          </h3>
          <div className="space-y-3">
            {childContent.length > 0 ? (
              childContent.slice().reverse().map(pub => (
                <div key={pub.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs px-2 py-1 rounded capitalize font-medium
                      ${pub.type === 'devoir' ? 'bg-orange-100 text-orange-700' : 
                        pub.type === 'video' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
                    `}>
                      {pub.type}
                    </span>
                    <span className="text-xs text-gray-400">{format(new Date(pub.date), 'dd MMM', { locale: fr })}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{pub.titre}</h4>
                  <p className="text-sm text-gray-600 mb-3">{pub.contenu}</p>
                  
                  <div className="flex gap-3">
                    {pub.lien_youtube && (
                      <a href={pub.lien_youtube} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium">
                        <Video size={14} /> Voir la vidéo
                      </a>
                    )}
                    {pub.document_pdf && (
                      <a href={pub.document_pdf} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                        <Download size={14} /> Télécharger PDF
                      </a>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-400 border-t border-gray-50 pt-2">
                    Publié par : {pub.auteur_nom}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400">
                Aucun devoir ou cours pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
