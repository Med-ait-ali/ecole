import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useSchool();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      // Redirect based on role? The App.tsx router will handle default landing pages
      // But we can just push to dashboard and let the router figure it out or 
      // check user role here.
      // For now, let's just go to root and let the ProtectedRoute redirect.
      navigate('/'); 
    } else {
      setError('Identifiants incorrects');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-green-600 p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="text-green-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Fondation Al Bachir</h1>
          <p className="text-green-100 text-sm">Portail Numérique Éducatif</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group"
          >
            Se connecter
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
        
        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-500 border-t border-gray-100">
          Problème de connexion ? Contactez l'administration.
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-gray-400 font-medium">
        Created by Med Ait Ali Oulhoucien
      </div>
    </div>
  );
}
