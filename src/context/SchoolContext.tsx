import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student, Grade, Absence, Publication, Message, Role } from './types';
import { supabase } from '../lib/supabase';

interface SchoolContextType {
  currentUser: User | null;
  users: User[];
  students: Student[];
  grades: Grade[];
  absences: Absence[];
  publications: Publication[];
  messages: Message[];
  
  login: (email: string, mdp: string) => Promise<boolean>;
  logout: () => void;
  
  addUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  
  addGrade: (grade: Grade) => Promise<void>;
  addAbsence: (absence: Absence) => Promise<void>;
  addPublication: (pub: Publication) => Promise<void>;
  
  deleteData: (type: 'student' | 'user' | 'grade' | 'absence' | 'publication' | 'message', id: string) => Promise<void>;
  sendMessage: (content: string, receiverId: string, eleveId?: string) => Promise<void>;
  markMessageRead: (messageId: string) => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // تحميل المستخدمين
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData) setUsers(usersData);

      // تحميل التلاميذ
      const { data: studentsData } = await supabase.from('students').select('*');
      if (studentsData) setStudents(studentsData);

      // تحميل النقاط
      const { data: gradesData } = await supabase.from('grades').select('*');
      if (gradesData) setGrades(gradesData);

      // تحميل الغيابات
      const { data: absencesData } = await supabase.from('absences').select('*');
      if (absencesData) setAbsences(absencesData);

      // تحميل المنشورات
      const { data: publicationsData } = await supabase.from('publications').select('*');
      if (publicationsData) setPublications(publicationsData);

      // تحميل الرسائل
      const { data: messagesData } = await supabase.from('messages').select('*');
      if (messagesData) setMessages(messagesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // دالة تسجيل الدخول
  const login = async (email: string, mdp: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('mot_de_passe', mdp)
        .single();

      if (error || !data) {
        console.error('Login error:', error);
        return false;
      }

      setCurrentUser(data);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // إضافة مستخدم جديد
  const addUser = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: crypto.randomUUID(),
          nom: user.nom,
          email: user.email,
          mot_de_passe: user.mot_de_passe,
          role: user.role
        }])
        .select();

      if (error) {
        console.error('Error adding user:', error);
        alert('Erreur: ' + error.message);
        return;
      }

      if (data) {
        setUsers([...users, data[0]]);
        alert('Utilisateur ajouté avec succès!');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Erreur lors de l\'ajout');
    }
  };

  const deleteUser = async (id: string) => {
    await deleteData('user', id);
  };
  
  const addStudent = async (student: Student) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          id: crypto.randomUUID(),
          nom: student.nom,
          classe: student.classe,
          parent_id: student.parent_id,
          enseignant_ids: student.enseignant_ids || [],
          date_naissance: student.date_naissance || new Date().toISOString().split('T')[0]
        }])
        .select();

      if (error) {
        console.error('Error adding student:', error);
        alert('Erreur: ' + error.message);
        return;
      }

      if (data) {
        setStudents([...students, data[0]]);
        alert('Élève ajouté avec succès!');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Erreur lors de l\'ajout');
    }
  };

  const updateStudent = async (updatedStudent: Student) => {
    try {
      await supabase.from('students').update(updatedStudent).eq('id', updatedStudent.id);
      setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const addGrade = async (grade: Grade) => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .insert([{
          id: crypto.randomUUID(),
          eleve_id: grade.eleve_id,
          enseignant_id: grade.enseignant_id,
          matiere: grade.matiere,
          note: grade.note,
          max_note: grade.max_note || 20,
          date: grade.date || new Date().toISOString().split('T')[0]
        }])
        .select();

      if (error) {
        console.error('Error adding grade:', error);
        alert('Erreur: ' + error.message);
        return;
      }

      if (data) {
        setGrades([...grades, data[0]]);
        alert('Note ajoutée avec succès!');
      }
    } catch (error) {
      console.error('Error adding grade:', error);
      alert('Erreur lors de l\'ajout de la note');
    }
  };

  const addAbsence = async (absence: Absence) => {
    try {
      const { data, error } = await supabase
        .from('absences')
        .insert([{
          id: crypto.randomUUID(),
          eleve_id: absence.eleve_id,
          enseignant_id: absence.enseignant_id,
          date: absence.date || new Date().toISOString().split('T')[0],
          motif: absence.motif,
          justifiee: absence.justifiee || false
        }])
        .select();

      if (error) {
        console.error('Error adding absence:', error);
        alert('Erreur: ' + error.message);
        return;
      }

      if (data) {
        setAbsences([...absences, data[0]]);
        alert('Absence enregistrée avec succès!');
      }
    } catch (error) {
      console.error('Error adding absence:', error);
      alert('Erreur lors de l\'enregistrement de l\'absence');
    }
  };

  const addPublication = async (pub: Publication) => {
    try {
      const { data, error } = await supabase
        .from('publications')
        .insert([{
          id: crypto.randomUUID(),
          auteur_id: pub.auteur_id,
          auteur_nom: pub.auteur_nom,
          type: pub.type,
          titre: pub.titre,
          contenu: pub.contenu,
          lien_youtube: pub.lien_youtube || null,
          cible: pub.cible || 'tous',
          classe_cible: pub.classe_cible || null,
          date: pub.date || new Date().toISOString().split('T')[0]
        }])
        .select();

      if (error) {
        console.error('Error adding publication:', error);
        alert('Erreur: ' + error.message);
        return;
      }

      if (data) {
        setPublications([data[0], ...publications]);
        alert('Publication ajoutée avec succès!');
      }
    } catch (error) {
      console.error('Error adding publication:', error);
      alert('Erreur lors de l\'ajout de la publication');
    }
  };

  const deleteData = async (type: 'student' | 'user' | 'grade' | 'absence' | 'publication' | 'message', id: string) => {
    if (!currentUser) return;

    const tables = {
      student: 'students',
      user: 'users',
      grade: 'grades',
      absence: 'absences',
      publication: 'publications',
      message: 'messages'
    };

    try {
      // التحقق من الصلاحية: Admin يقدر يحذف أي حاجة، الآخرين يقدر يحذفو فقط الرسائل اللي كتبوها
      if (type === 'message' && currentUser.role !== 'admin') {
        // التحقق أن المستخدم هو صاحب الرسالة
        const message = messages.find(m => m.id === id);
        if (!message || message.sender_id !== currentUser.id) {
          alert('Vous ne pouvez supprimer que vos propres messages');
          return;
        }
      } else if (type !== 'message' && currentUser.role !== 'admin') {
        alert('Seul l\'administrateur peut supprimer ce type de données');
        return;
      }

      await supabase.from(tables[type]).delete().eq('id', id);

      switch (type) {
        case 'student': setStudents(prev => prev.filter(s => s.id !== id)); break;
        case 'user': setUsers(prev => prev.filter(u => u.id !== id)); break;
        case 'grade': setGrades(prev => prev.filter(g => g.id !== id)); break;
        case 'absence': setAbsences(prev => prev.filter(a => a.id !== id)); break;
        case 'publication': setPublications(prev => prev.filter(p => p.id !== id)); break;
        case 'message': setMessages(prev => prev.filter(m => m.id !== id)); break;
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const sendMessage = async (content: string, receiverId: string, eleveId?: string) => {
    if (!currentUser) {
      alert("Vous devez être connecté pour envoyer un message.");
      return;
    }

    try {
      const receiver = users.find(u => u.id === receiverId);
      if (!receiver) {
        alert("Destinataire non trouvé.");
        return;
      }

      const newMessage = {
        id: crypto.randomUUID(),
        sender_id: currentUser.id,
        sender_name: currentUser.nom,
        receiver_id: receiverId,
        receiver_name: receiver.nom,
        content: content.trim(),
        date: new Date().toISOString(),
        read: false,
        eleve_id: eleveId || null,
      };

      const { data, error } = await supabase
        .from("messages")
        .insert([newMessage])
        .select();

      if (error) {
        console.error('Error sending message:', error);
        alert("Erreur: " + error.message);
        return;
      }

      if (data) {
        setMessages(prev => [...prev, data[0] as Message]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert("Une erreur inattendue s'est produite.");
    }
  };

  const markMessageRead = async (messageId: string) => {
    try {
      await supabase.from('messages').update({ read: true }).eq('id', messageId);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return (
    <SchoolContext.Provider value={{
      currentUser,
      users,
      students,
      grades,
      absences,
      publications,
      messages,
      login,
      logout,
      addUser,
      deleteUser,
      addStudent,
      updateStudent,
      addGrade,
      addAbsence,
      addPublication,
      deleteData,
      sendMessage,
      markMessageRead
    }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) throw new Error('useSchool must be used within a SchoolProvider');
  return context;
};