import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { User, Role } from '../../context/types';
import { Trash2, UserPlus } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function AdminUsers() {
  const { users, addUser, deleteData } = useSchool();
  const [newUser, setNewUser] = useState<Partial<User>>({ role: 'enseignant' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddUser = async (e: React.FormEvent) => {
  e.preventDefault();
  if (newUser.nom && newUser.email && newUser.mot_de_passe && newUser.role) {
    await addUser({
      id: crypto.randomUUID(), // استخدام UUID حقيقي
      nom: newUser.nom,
      email: newUser.email,
      mot_de_passe: newUser.mot_de_passe,
      role: newUser.role as Role
    });
    setNewUser({ role: 'enseignant', nom: '', email: '', mot_de_passe: '' });
  }
};

  const confirmDelete = () => {
    if (deleteId) {
      deleteData('user', deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h1>

      {/* Add User Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus size={20} className="text-green-600" />
          Ajouter un utilisateur
        </h2>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
              value={newUser.nom || ''}
              onChange={e => setNewUser({ ...newUser, nom: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
              value={newUser.email || ''}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
              value={newUser.mot_de_passe || ''}
              onChange={e => setNewUser({ ...newUser, mot_de_passe: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <select
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
              value={newUser.role}
              onChange={e => setNewUser({ ...newUser, role: e.target.value as Role })}
            >
              <option value="enseignant">Enseignant</option>
              <option value="parent">Parent</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Ajouter
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Nom</th>
              <th className="p-4 font-semibold text-gray-600">Email</th>
              <th className="p-4 font-semibold text-gray-600">Rôle</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{user.nom}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      user.role === 'enseignant' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-right">
              {user.role !== 'admin' && (
          <button
      onClick={() => setDeleteId(user.id)}
      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
      title="Supprimer"
    >
      <Trash2 size={18} />
    </button>
  )}
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'utilisateur"
        message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
      />
    </div>
  );
}
