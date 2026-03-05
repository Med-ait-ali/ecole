export type Role = 'admin' | 'enseignant' | 'parent';

export interface User {
  id: string;
  nom: string;
  email: string;
  mot_de_passe: string;
  role: Role;
}

export interface Student {
  id: string;
  nom: string;
  classe: string;
  enseignant_ids: string[]; // Students can have multiple teachers or be linked to them
  parent_id: string;
  date_naissance?: string;
}

export interface Grade {
  id: string;
  eleve_id: string;
  matiere: string;
  note: number;
  max_note: number;
  date: string;
  enseignant_id: string;
}

export interface Absence {
  id: string;
  eleve_id: string;
  date: string;
  motif: string;
  justifiee: boolean;
  enseignant_id?: string; // To track who created it
}

export interface Publication {
  id: string;
  auteur_id: string;
  auteur_nom: string;
  type: 'annonce' | 'devoir' | 'cours' | 'video';
  titre: string;
  contenu: string;
  lien_youtube?: string;
  document_pdf?: string; // Simulated link
  date: string;
  cible: 'tous' | 'classe' | 'parents'; // Who can see this
  classe_cible?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  date: string;
  read: boolean;
  eleveId?: string; // Optional context for which student this is about
}
