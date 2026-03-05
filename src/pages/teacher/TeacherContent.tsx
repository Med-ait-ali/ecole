import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Publication } from '../../context/types';
import { FileText, Video, Bell, Trash2 } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function TeacherContent() {
  const { currentUser, addPublication, publications, deleteData } = useSchool();
  const [newPub, setNewPub] = useState<Partial<Publication>>({ 
    type: 'devoir', 
    cible: 'classe' 
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!currentUser) return null;

  const myPubs = publications.filter(p => p.auteur_id === currentUser.id);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Vous devez être connecté');
      return;
    }

    if (!newPub.titre || !newPub.contenu) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    
    try {
      await addPublication({
        id: crypto.randomUUID(),
        auteur_id: currentUser.id,
        auteur_nom: currentUser.nom,
        date: new Date().toISOString().split('T')[0],
        type: newPub.type || 'devoir',
        cible: newPub.cible || 'classe',
        titre: newPub.titre,
        contenu: newPub.contenu,
        lien_youtube: newPub.lien_youtube || null,
        classe_cible: newPub.classe_cible || null,
        document_pdf: newPub.document_pdf || null
      });
      
      setNewPub({ type: 'devoir', cible: 'classe', titre: '', contenu: '', lien_youtube: '' });
      alert('Publication ajoutée avec succès!');
      
    } catch (error) {
      console.error('Error adding publication:', error);
      alert('Erreur lors de l\'ajout de la publication');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteData('publication', deleteId);
        setDeleteId(null);
      } catch (error) {
        console.error('Error deleting publication:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Contenu Pédagogique</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Publier</h2>
          <form onSubmit={handlePost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewPub({ ...newPub, type: 'devoir' })}
                  className={`flex-1 py-2 text-sm rounded-lg border ${
                    newPub.type === 'devoir' 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  disabled={isLoading}
                >
                  Devoir
                </button>
                <button
                  type="button"
                  onClick={() => setNewPub({ ...newPub, type: 'cours' })}
                  className={`flex-1 py-2 text-sm rounded-lg border ${
                    newPub.type === 'cours' 
                      ? 'bg-green-50 border-green-500 text-green-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  disabled={isLoading}
                >
                  Cours
                </button>
                <button
                  type="button"
                  onClick={() => setNewPub({ ...newPub, type: 'video' })}
                  className={`flex-1 py-2 text-sm rounded-lg border ${
                    newPub.type === 'video' 
                      ? 'bg-red-50 border-red-500 text-red-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  disabled={isLoading}
                >
                  Vidéo
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                value={newPub.titre || ''}
                onChange={e => setNewPub({ ...newPub, titre: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenu / Description</label>
              <textarea
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none h-24"
                value={newPub.contenu || ''}
                onChange={e => setNewPub({ ...newPub, contenu: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            {newPub.type === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lien YouTube</label>
                <input
                  type="url"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                  value={newPub.lien_youtube || ''}
                  onChange={e => setNewPub({ ...newPub, lien_youtube: e.target.value })}
                  placeholder="https://youtube.com/..."
                  disabled={isLoading}
                />
              </div>
            )}
            
            {newPub.type === 'devoir' && (
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe Cible (Optionnel)</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                  value={newPub.classe_cible || ''}
                  onChange={e => setNewPub({ ...newPub, classe_cible: e.target.value })}
                  placeholder="ex: CM2-A"
                  disabled={isLoading}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Publication en cours...' : 'Publier'}
            </button>
          </form>
        </div>

        {/* List of Posts */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Vos Publications Récentes</h2>
          {myPubs.length === 0 && (
            <p className="text-gray-500 italic">Aucune publication pour le moment.</p>
          )}
          {myPubs.slice().reverse().map(pub => (
            <div key={pub.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                ${pub.type === 'video' ? 'bg-red-100 text-red-600' : 
                  pub.type === 'cours' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                {pub.type === 'video' ? <Video size={24} /> : 
                 pub.type === 'cours' ? <FileText size={24} /> : <Bell size={24} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900">{pub.titre}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{pub.date}</span>
                    <button
                      onClick={() => setDeleteId(pub.id)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mt-1">{pub.contenu}</p>
                {pub.lien_youtube && (
                  <a href={pub.lien_youtube} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline text-sm mt-2 block">
                    Voir la vidéo
                  </a>
                )}
                <div className="mt-3 flex gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                    {pub.type}
                  </span>
                  {pub.classe_cible && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Classe: {pub.classe_cible}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer la publication"
        message="Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible."
      />
    </div>
  );
}