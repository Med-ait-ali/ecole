import React, { useState, useEffect, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Send, User as UserIcon, Trash2, Bell } from 'lucide-react';

const Messages: React.FC = () => {
  const { currentUser, users, students, messages, sendMessage, markMessageRead, deleteData } = useSchool();
  const [selectedId, setSelectedId] = useState<string>('');
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ربط currentUser بالـ window للوصول من الكونسول
  window.currentUser = currentUser;

  // =============================================
  // 1. جلب جهات الاتصال حسب الدور
  // =============================================
  const getContacts = () => {
    if (!currentUser) return [];

    if (currentUser.role === 'enseignant') {
      const myStudents = students.filter(s => s.enseignant_ids.includes(currentUser.id));
      const parentIds = myStudents.map(s => s.parent_id);
      return users.filter(u => parentIds.includes(u.id) && u.role === 'parent');
    }

    if (currentUser.role === 'parent') {
      const myChildren = students.filter(s => s.parent_id === currentUser.id);
      const teacherIds = myChildren.flatMap(s => s.enseignant_ids);
      return users.filter(u => teacherIds.includes(u.id) && u.role === 'enseignant');
    }

    if (currentUser.role === 'admin') {
      return users.filter(u => u.id !== currentUser.id);
    }

    return [];
  };

  const contacts = getContacts();

  // =============================================
  // 2. حساب عدد الإشعارات غير المقروءة
  // =============================================
  const totalUnreadCount = messages.filter(m => 
    m.receiver_id === currentUser?.id && !m.read
  ).length;

  // =============================================
  // 3. فلترة المحادثة الحالية
  // =============================================
  const conversation = messages
    .filter(m => 
      (m.sender_id === currentUser?.id && m.receiver_id === selectedId) ||
      (m.sender_id === selectedId && m.receiver_id === currentUser?.id)
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // =============================================
  // 4. تحديث حالة القراءة
  // =============================================
  useEffect(() => {
    if (!currentUser || !selectedId) return;
    const unreadMessages = messages.filter(
      m => m.sender_id === selectedId && m.receiver_id === currentUser.id && !m.read
    );
    unreadMessages.forEach(m => markMessageRead(m.id));
  }, [selectedId, messages, currentUser, markMessageRead]);

  // =============================================
  // 5. التمرير لأسفل تلقائياً
  // =============================================
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  // =============================================
  // 6. دالة الإرسال
  // =============================================
  const handleSend = async () => {
    if (!text.trim() || !selectedId || isSending) return;
    
    setIsSending(true);
    try {
      await sendMessage(text, selectedId);
      setText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // =============================================
  // 7. حذف جميع الرسائل (للمسؤول فقط)
  // =============================================
  const handleClearAllMessages = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;

    try {
      const userMessages = messages.filter(m => 
        m.sender_id === currentUser.id || m.receiver_id === currentUser.id
      );

      for (const msg of userMessages) {
        await deleteData('message', msg.id);
      }

      setShowClearConfirm(false);
      alert('Tous les messages ont été supprimés');
    } catch (error) {
      console.error('Error clearing messages:', error);
      alert('Erreur lors de la suppression des messages');
    }
  };

  // =============================================
  // 8. التحقق من صلاحية حذف رسالة معينة
  // =============================================
  const canDeleteMessage = (msg: any) => {
    if (!currentUser) return false;
    
    // Admin يقدر يحذف أي حاجة
    if (currentUser.role === 'admin') return true;
    
    // المستخدم العادي يقدر يحذف فقط الرسائل اللي كتبها
    return msg.sender_id === currentUser.id;
  };

  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ========================================= */}
      {/* القائمة الجانبية (جهات الاتصال) */}
      {/* ========================================= */}
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Messagerie</h2>
              <p className="text-sm opacity-90 mt-1">{contacts.length} contact(s)</p>
            </div>
            
            {/* زر حذف الكل - يظهر فقط للمسؤول */}
            {currentUser?.role === 'admin' && totalUnreadCount > 0 && (
              <button
  onClick={async (e) => {
    e.stopPropagation();
    if (window.confirm('Supprimer ce message ?')) {
      await deleteData('message', msg.id);
    }
  }}
  className="text-red-400 hover:text-red-600 transition-colors ml-2"
  title="Supprimer"
>
  <Trash2 size={14} />
</button>
            )}
          </div>

          {/* إشعار عدد الرسائل غير المقروءة */}
          {totalUnreadCount > 0 && (
            <div className="mt-2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm flex items-center gap-2 w-fit">
              <Bell size={16} />
              <span>{totalUnreadCount} message(s) non lu(s)</span>
            </div>
          )}
        </div>
        
        {contacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun contact disponible
          </div>
        ) : (
          contacts.map(contact => {
            const unreadCount = messages.filter(m => 
              m.sender_id === contact.id && 
              m.receiver_id === currentUser.id && 
              !m.read
            ).length;

            return (
              <div
                key={contact.id}
                onClick={() => setSelectedId(contact.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-green-50 transition-all ${
                  selectedId === contact.id ? 'bg-green-100 border-l-4 border-green-600' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center relative">
                    <UserIcon size={24} className="text-green-700" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{contact.nom}</h3>
                    <p className="text-xs text-gray-500 capitalize">{contact.role}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================= */}
      {/* منطقة المحادثة مع صلاحيات الحذف */}
      {/* ========================================= */}
      <div className="w-2/3 flex flex-col bg-white">
        {selectedId ? (
          <>
            {/* Header المحادثة */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                <UserIcon size={20} className="text-green-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {users.find(u => u.id === selectedId)?.nom}
                </h3>
                <p className="text-sm text-gray-500 capitalize">
                  {users.find(u => u.id === selectedId)?.role}
                </p>
              </div>
            </div>

            {/* منطقة الرسائل مع زر الحذف حسب الصلاحية */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {conversation.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">
                  <Send size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Aucun message</p>
                  <p className="text-sm">Commencez la conversation!</p>
                </div>
              ) : (
                conversation.map(msg => {
                  const isMe = msg.sender_id === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl p-3 ${
                          isMe 
                            ? 'bg-green-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                        }`}
                      >
                        <p className="text-xs mb-1 font-semibold opacity-75">
                          {isMe ? 'Vous' : msg.sender_name}
                        </p>
                        <p className="text-sm break-words">{msg.content}</p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <p className={`text-[10px] ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                            {new Date(msg.date).toLocaleTimeString()}
                          </p>
                          {isMe && msg.read && (
                            <span className={`text-[10px] ${isMe ? 'text-green-100' : ''}`}>
                              ✓✓
                            </span>
                          )}
                          
                          {/* زر حذف الرسالة - يظهر إذا كان المستخدم يملك صلاحية الحذف */}
                          {canDeleteMessage(msg) && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm('Supprimer ce message ?')) {
                                  await deleteData('message', msg.id);
                                }
                              }}
                              className="text-red-400 hover:text-red-600 transition-colors ml-2"
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* منطقة الإدخال */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Votre message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isSending}
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !text.trim()}
                  className={`px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 ${
                    isSending || !text.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
            <div className="text-center">
              <Send size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-xl">Sélectionnez un contact</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal تأكيد حذف الكل (للمسؤول فقط) */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmation</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer tous vos messages ? 
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleClearAllMessages}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer tout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;