'use client';

import { useAuthStore } from '@/src/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { api } from '@/src/lib/api';
import DashboardLayout from '../components/DashboardLayout';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

interface Message {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string; role: string };
  receiver: { id: string; firstName: string; lastName: string; role: string };
}

interface Conversation {
  otherUser: { id: string; firstName: string; lastName: string; role: string };
  lastMessage: Message;
  unreadCount: number;
}

const roleLabel: Record<string, string> = {
  ADMIN: 'Admin',
  SECRETAIRE: 'Secrétaire',
  COMPTABLE: 'Comptable',
  PROPRIETAIRE: 'Propriétaire',
  LOCATAIRE: 'Locataire',
};

const roleColor: Record<string, string> = {
  ADMIN: 'bg-[#1A3C5E] text-white',
  SECRETAIRE: 'bg-blue-100 text-blue-700',
  COMPTABLE: 'bg-purple-100 text-purple-700',
  PROPRIETAIRE: 'bg-amber-100 text-amber-700',
  LOCATAIRE: 'bg-green-100 text-green-700',
};

export default function MessagesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showContacts, setShowContacts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadInbox();
    loadContacts();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadInbox() {
    try {
      const res = await api.get('/messages/inbox');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadContacts() {
    try {
      const res = await api.get('/messages/contacts');
      setContacts(res.data.filter((c: User) => c.id !== user?.id));
    } catch (err) {
      console.error(err);
    }
  }

  async function openConversation(otherUser: User) {
    setSelectedUser(otherUser);
    setShowContacts(false);
    try {
      const res = await api.get(`/messages/conversation/${otherUser.id}`);
      setMessages(res.data);
      const unreadIds = res.data
        .filter((m: Message) => !m.isRead && m.sender.id === otherUser.id)
        .map((m: Message) => m.id);
      if (unreadIds.length > 0) {
        await api.put('/messages/read', { messageIds: unreadIds });
        loadInbox();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const res = await api.post('/messages', {
        content: newMessage,
        receiverId: selectedUser.id,
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
      loadInbox();
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Messagerie</h2>
        <button onClick={() => setShowContacts(!showContacts)}
          className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nouveau message
        </button>
      </div>

      {showContacts && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3">Choisir un contact :</p>
          <div className="grid grid-cols-2 gap-2">
            {contacts.map((contact) => (
              <button key={contact.id}
                onClick={() => openConversation(contact)}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-left transition-colors">
                <div className="w-8 h-8 bg-[#1A3C5E]/10 rounded-full flex items-center justify-center text-xs font-bold text-[#1A3C5E]">
                  {contact.firstName[0]}{contact.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{contact.firstName} {contact.lastName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor[contact.role]}`}>
                    {roleLabel[contact.role]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 flex" style={{ height: '600px' }}>
        <div className="w-72 border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <p className="text-sm font-medium text-slate-700">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-500 text-sm">Chargement...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">Aucune conversation</div>
            ) : (
              conversations.map((conv) => (
                <button key={conv.otherUser.id}
                  onClick={() => openConversation(conv.otherUser as User)}
                  className={`w-full flex items-center gap-3 p-4 border-b border-slate-100 hover:bg-slate-50 text-left transition-colors ${selectedUser?.id === conv.otherUser.id ? 'bg-slate-50' : ''}`}>
                  <div className="w-10 h-10 bg-[#1A3C5E]/10 rounded-full flex items-center justify-center text-sm font-bold text-[#1A3C5E] shrink-0">
                    {conv.otherUser.firstName[0]}{conv.otherUser.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {conv.otherUser.firstName} {conv.otherUser.lastName}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-[#1A3C5E] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{conv.lastMessage.content}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${roleColor[conv.otherUser.role]}`}>
                      {roleLabel[conv.otherUser.role]}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-sm">Sélectionnez une conversation ou créez-en une nouvelle</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1A3C5E]/10 rounded-full flex items-center justify-center text-sm font-bold text-[#1A3C5E]">
                  {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor[selectedUser.role]}`}>
                    {roleLabel[selectedUser.role]}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 text-sm py-8">
                    Commencez la conversation
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender.id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-[#1A3C5E] text-white rounded-br-sm'
                            : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-slate-300' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 flex gap-3">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrire un message..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" disabled={!newMessage.trim()}
                  className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50">
                  Envoyer
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}