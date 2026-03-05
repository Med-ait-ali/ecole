import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { GraduationCap, AlertCircle, FileText, Bell } from 'lucide-react';

export default function ParentDashboard() {
  const { currentUser, students, grades, absences, publications } = useSchool();
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
  const childAbsences = absences.filter(a => a.eleve_id === currentChild.id);
  
  // Publications: targeted to 'tous', or 'parents', or 'classe' matching child's class
  const childPubs = publications.filter(p => 
    p.cible === 'tous' || 
    p.cible === 'parents' || 
    (p.cible === 'classe' && p.classe_cible === currentChild.classe)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Espace Parents</h1>
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

      {/* Child Profile Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{currentChild.nom}</h2>
          <p className="text-gray-500">Classe : {currentChild.classe}</p>
        </div>
        <div className="bg-green-100 p-3 rounded-full">
           <GraduationCap className="text-green-700" size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grades */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
           <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
             <FileText size={20} className="text-blue-600" />
             Dernières Notes
           </h3>
           <div className="space-y-3">
             {childGrades.slice().reverse().slice(0, 5).map(grade => (
               <div key={grade.id} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
                 <div>
                   <p className="font-medium text-gray-900">{grade.matiere}</p>
                   <p className="text-xs text-gray-500">{format(new Date(grade.date), 'dd MMM', { locale: fr })}</p>
                 </div>
                 <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold">
                   {grade.note}<span className="text-xs font-normal text-blue-400">/{grade.max_note}</span>
                 </div>
               </div>
             ))}
             {childGrades.length === 0 && <p className="text-gray-400 italic text-sm">Aucune note pour le moment.</p>}
           </div>
        </div>

        {/* Absences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
           <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
             <AlertCircle size={20} className="text-red-600" />
             Absences
           </h3>
           <div className="space-y-3">
             {childAbsences.slice().reverse().slice(0, 5).map(abs => (
               <div key={abs.id} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
                 <div>
                   <p className="font-medium text-gray-900">{format(new Date(abs.date), 'dd MMMM yyyy', { locale: fr })}</p>
                   <p className="text-xs text-gray-500">{abs.motif}</p>
                 </div>
                 <span className={`text-xs px-2 py-1 rounded-full ${abs.justifiee ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {abs.justifiee ? 'Justifiée' : 'Non justifiée'}
                 </span>
               </div>
             ))}
             {childAbsences.length === 0 && <p className="text-gray-400 italic text-sm">Aucune absence enregistrée.</p>}
           </div>
        </div>
      </div>

      {/* Publications / Announcements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
           <Bell size={20} className="text-yellow-500" />
           Annonces & Devoirs
        </h3>
        <div className="space-y-4">
           {childPubs.slice().reverse().map(pub => (
             <div key={pub.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
               <div className="flex justify-between items-start mb-1">
                 <h4 className="font-bold text-gray-900">{pub.titre}</h4>
                 <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{format(new Date(pub.date), 'dd MMM', { locale: fr })}</span>
               </div>
               <p className="text-sm text-gray-600 mb-2">{pub.contenu}</p>
               <div className="flex gap-2 text-xs">
                 <span className="font-medium text-gray-500">Par: {pub.auteur_nom}</span>
                 {pub.type && <span className="bg-yellow-100 text-yellow-700 px-2 rounded capitalize">{pub.type}</span>}
               </div>
               {pub.lien_youtube && (
                  <a href={pub.lien_youtube} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs mt-1 block">
                    Regarder la vidéo
                  </a>
                )}
             </div>
           ))}
           {childPubs.length === 0 && <p className="text-gray-400 italic text-sm">Aucune publication.</p>}
        </div>
      </div>
    </div>
  );
}
