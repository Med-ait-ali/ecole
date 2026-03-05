import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { GraduationCap, Bell, Megaphone, Calendar, Video, FileText } from 'lucide-react';

export default function ParentAnnouncements() {
  const { currentUser, students, publications } = useSchool();
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

  // Publications (Annonces only, or all but focused on announcements)
  // Let's show all publications but styled as a timeline/feed
  const childPubs = publications.filter(p => 
    p.cible === 'tous' || 
    p.cible === 'parents' || 
    (p.cible === 'classe' && p.classe_cible === currentChild.classe)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Annonces & Actualités</h1>
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

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <p className="text-gray-600">
          Vous consultez les annonces pour <span className="font-bold text-green-700">{currentChild.nom}</span> ({currentChild.classe}).
        </p>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        {childPubs.length > 0 ? (
          childPubs.slice().reverse().map(pub => (
            <div key={pub.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
               <div className={`h-2 w-full ${
                 pub.type === 'annonce' ? 'bg-yellow-400' :
                 pub.type === 'devoir' ? 'bg-orange-400' :
                 pub.type === 'video' ? 'bg-red-500' : 'bg-blue-500'
               }`}></div>
               <div className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          pub.type === 'annonce' ? 'bg-yellow-100 text-yellow-600' :
                          pub.type === 'devoir' ? 'bg-orange-100 text-orange-600' :
                          pub.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                       }`}>
                          {pub.type === 'annonce' ? <Megaphone size={20} /> :
                           pub.type === 'devoir' ? <FileText size={20} /> :
                           pub.type === 'video' ? <Video size={20} /> : <Calendar size={20} />}
                       </div>
                       <div>
                          <h3 className="font-bold text-lg text-gray-900">{pub.titre}</h3>
                          <div className="flex gap-2 text-xs text-gray-500">
                             <span>Par {pub.auteur_nom}</span>
                             <span>•</span>
                             <span>{format(new Date(pub.date), 'dd MMMM yyyy', { locale: fr })}</span>
                          </div>
                       </div>
                    </div>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium uppercase">
                      {pub.type}
                    </span>
                 </div>

                 <div className="prose prose-sm max-w-none text-gray-700 mb-4 bg-gray-50 p-4 rounded-lg">
                   {pub.contenu}
                 </div>

                 <div className="flex flex-wrap gap-3">
                   {pub.lien_youtube && (
                     <a href={pub.lien_youtube} target="_blank" rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors">
                       <Video size={16} />
                       Voir la vidéo
                     </a>
                   )}
                   {pub.document_pdf && (
                      <a href={pub.document_pdf} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                         <FileText size={16} />
                         Télécharger le document
                      </a>
                   )}
                 </div>
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
             <Bell size={48} className="mx-auto text-gray-300 mb-4" />
             <p className="text-gray-500">Aucune annonce ou publication pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
