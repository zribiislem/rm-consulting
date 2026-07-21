import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  LineChart,
  Settings,
  Plus,
  HelpCircle,
  LogOut,
  Bell,
  TrendingUp,
  ClipboardList,
  Mail,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  Search,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Building2,
  Award,
  Globe,
  BellRing,
  UserCheck,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  XCircle
} from 'lucide-react';

// Interfaces
interface Mission {
  id: string;
  title: string;
  client: string;
  department: 'Audit Légal' | 'Conseil' | 'Comptabilité' | 'Juridique' | 'Fiscalité';
  status: string;
  progression: number;
}

interface Message {
  id: string;
  sender: string;
  role: string;
  avatarUrl?: string;
  initials?: string;
  time: string;
  content: string;
  isUnread: boolean;
  parentId?: string;
  email?: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  head: string;
  staffCount: number;
  activeProjects: number;
  services: string[];
  imageUrl?: string;
}

const API_URL = '/api';

const getDeptIcon = (id: string) => {
  switch (id) {
    case 'audit':
      return <Award className="w-5 h-5" />;
    case 'conseil':
      return <LineChart className="w-5 h-5" />;
    case 'compta':
      return <ClipboardList className="w-5 h-5" />;
    case 'fiscalite':
      return <TrendingUp className="w-5 h-5" />;
    case 'juridique':
      return <UserCheck className="w-5 h-5" />;
    default:
      return <Building2 className="w-5 h-5" />;
  }
};

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'missions' | 'clients' | 'reporting' | 'settings' | 'departments' | 'appointments'>('dashboard');

  // Departments dynamic state
  const [departments, setDepartments] = useState<Department[]>([]);

  // Department modal and form state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptDescription, setDeptDescription] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [deptStaffCount, setDeptStaffCount] = useState<number>(5);
  const [deptActiveProjects, setDeptActiveProjects] = useState<number>(3);
  const [deptServicesText, setDeptServicesText] = useState('');
  const [deptImageFile, setDeptImageFile] = useState<File | null>(null);
  const [deptImagePreview, setDeptImagePreview] = useState<string | null>(null);
  const [deptExistingImageUrl, setDeptExistingImageUrl] = useState<string | null>(null);

  // Search filter for missions
  const [missionSearch, setMissionSearch] = useState('');

  // Missions state
  const [missions, setMissions] = useState<Mission[]>([]);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);

  // Appointments state
  interface AppointmentData {
    _id: string;
    clientName: string;
    email: string;
    date: string;
    timeSlot: string;
    subject: string;
    details: string;
    status: 'pending' | 'confirmed' | 'cancelled';
  }
  interface AvailableDateData {
    _id: string;
    date: string;
    timeSlots: string[];
  }
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [availableDatesList, setAvailableDatesList] = useState<AvailableDateData[]>([]);
  const [availCalMonth, setAvailCalMonth] = useState(new Date().getMonth());
  const [availCalYear, setAvailCalYear] = useState(new Date().getFullYear());

  const [timeSlotModalOpen, setTimeSlotModalOpen] = useState(false);
  const [timeSlotDateStr, setTimeSlotDateStr] = useState('');
  const [timeSlotDayNum, setTimeSlotDayNum] = useState(0);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [editingTimeSlotId, setEditingTimeSlotId] = useState<string | null>(null);

  const PRESET_TIME_SLOTS = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
  ];

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, missionRes, msgRes, apptRes, availRes] = await Promise.all([
          fetch(`${API_URL}/departments`),
          fetch(`${API_URL}/missions`),
          fetch(`${API_URL}/messages`),
          fetch(`${API_URL}/appointments`),
          fetch(`${API_URL}/available-dates`)
        ]);
        const depts = await deptRes.json();
        const missionsData = await missionRes.json();
        const msgs = await msgRes.json();
        const appts = await apptRes.json();
        const avails = await availRes.json();
        setDepartments(depts.map((d: any) => ({ ...d, id: d._id })));
        setMissions(missionsData.map((m: any) => ({ ...m, id: m._id })));
        setMessages(msgs.map((m: any) => ({ ...m, id: m._id })));
        setAppointments(appts);
        setAvailableDatesList(avails);
      } catch (err) {
        console.error('Failed to fetch data from API:', err);
      }
    };
    fetchData();
  }, []);

  // Dashboard calendar state
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Build appointments map grouped by day for the current calendar month
  const appointmentsByDay: Record<number, AppointmentData[]> = {};
  appointments.forEach((appt) => {
    const d = new Date(appt.date);
    if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
      const day = d.getDate();
      if (!appointmentsByDay[day]) appointmentsByDay[day] = [];
      appointmentsByDay[day].push(appt);
    }
  });

  // Build available dates lookup for the current calendar month
  const availableDatesSetByDay = new Set<string>();
  availableDatesList.forEach((ad) => {
    const d = new Date(ad.date);
    if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
      availableDatesSetByDay.add(`${d.getDate()}`);
    }
  });

  // Modals state
  const [isNewMissionOpen, setIsNewMissionOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [activeReplyMessage, setActiveReplyMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Department contact modal state
  const [isDeptContactOpen, setIsDeptContactOpen] = useState(false);
  const [selectedDeptForContact, setSelectedDeptForContact] = useState<Department | null>(null);
  const [deptContactMessage, setDeptContactMessage] = useState('');

  // New Mission form state
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionClient, setNewMissionClient] = useState('');
  const [newMissionDept, setNewMissionDept] = useState<'Audit Légal' | 'Conseil' | 'Comptabilité' | 'Juridique' | 'Fiscalité'>('Audit Légal');
  const [newMissionStatus, setNewMissionStatus] = useState('EN PRÉPARATION');
  const [newMissionProg, setNewMissionProg] = useState(10);

  // Notifications alerts
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' }[]>([]);

  const addToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Stats computation
  const activeMissionsCount = missions.length + 21; // Mock constant added to make it matches the original "24"
  const unreadMessagesCount = messages.filter((m) => m.isUnread && m.sender !== 'Marc-Antoine Durand' && !m.parentId).length;

  // Handle Nouvelle Mission
  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMissionTitle || !newMissionClient) {
      addToast('Veuillez remplir tous les champs obligatoires.', 'info');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/missions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMissionTitle,
          client: newMissionClient,
          department: newMissionDept,
          status: newMissionStatus,
          progression: Number(newMissionProg)
        })
      });
      const newM = await res.json();
      setMissions([{ ...newM, id: newM._id }, ...missions]);
      setIsNewMissionOpen(false);
      addToast(`Mission "${newMissionTitle}" créée avec succès !`);
    } catch (err) {
      addToast('Erreur lors de la création de la mission.', 'info');
    }

    setNewMissionTitle('');
    setNewMissionClient('');
    setNewMissionDept('Audit Légal');
    setNewMissionStatus('EN PRÉPARATION');
    setNewMissionProg(10);
  };

  // Archive Message
  const handleArchiveMessage = async (id: string, senderName: string) => {
    try {
      await fetch(`${API_URL}/messages/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
    addToast(`Message de ${senderName} supprimé.`, 'info');
  };

  // Open Reply Modal
  const openReplyModal = (msg: Message) => {
    setActiveReplyMessage(msg);
    setReplyText('');
    setIsReplyOpen(true);
    // Mark as read
    fetch(`${API_URL}/messages/${msg.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isUnread: false })
    }).catch(() => {});
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isUnread: false } : m))
    );
  };

  // Submit Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeReplyMessage) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Resolve the original client message to get email
    const threadId = activeReplyMessage.parentId || activeReplyMessage.id;
    const originalMsg = messages.find(m => m.id === threadId);
    const clientEmail = originalMsg?.email || (() => {
      const match = originalMsg?.content?.match(/Email:\s*(.+)/);
      return match ? match[1].trim() : null;
    })();

    const replyData = {
      sender: 'Marc-Antoine Durand',
      role: 'Expert Comptable Senior',
      initials: 'MA',
      time: timeStr,
      content: replyText.trim(),
      isUnread: true,
      parentId: activeReplyMessage.parentId || activeReplyMessage.id
    };

    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyData)
      });
      const saved = await res.json();
      setMessages((prev) => [{ ...saved, id: saved._id }, ...prev]);
      addToast(`Réponse envoyée à ${activeReplyMessage.sender}.`);
    } catch {
      addToast(`Réponse envoyée à ${activeReplyMessage.sender}.`);
    }

    // Send email to client
    if (clientEmail) {
      const subject = originalMsg?.content?.match(/\[(.+?)\]/)?.[1] || 'Réponse RM Consulting';
      try {
        await fetch(`${API_URL}/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: clientEmail,
            subject: `Re: ${subject} — RM Consulting`,
            text: replyText.trim(),
            senderName: 'Marc-Antoine Durand',
          })
        });
        addToast(`Email envoyé à ${clientEmail}`);
      } catch {
        addToast('Email non envoyé (vérifiez la configuration SMTP)', 'info');
      }
    }

    setIsReplyOpen(false);
    setActiveReplyMessage(null);
    setReplyText('');
  };

  const handleOpenDeptContact = (dept: Department) => {
    setSelectedDeptForContact(dept);
    setDeptContactMessage('');
    setIsDeptContactOpen(true);
  };

  const handleSendDeptContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptContactMessage.trim() || !selectedDeptForContact) return;

    addToast(`Message transmis à ${selectedDeptForContact.head.split(' (')[0]} avec succès.`);
    setIsDeptContactOpen(false);

    const senderName = selectedDeptForContact.head.split(' (')[0];
    const initials = selectedDeptForContact.head.split(' ')[0][0] + selectedDeptForContact.head.split(' ')[1][0];

    // Push simulated unread response after 2 seconds
    setTimeout(async () => {
      const responseMsg: Message = {
        id: `msg-dept-${Date.now()}`,
        sender: senderName,
        role: `Responsable - ${selectedDeptForContact.name}`,
        initials: initials,
        time: 'À l\'instant',
        content: `Bonjour, j'ai bien reçu votre demande concernant le pôle "${selectedDeptForContact.name}". Je l'étudie dès à présent et reviens vers vous très vite.`,
        isUnread: true
      };

      try {
        const res = await fetch(`${API_URL}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(responseMsg)
        });
        const saved = await res.json();
        setMessages((prev) => [{ ...saved, id: saved._id }, ...prev]);
      } catch {
        setMessages((prev) => [responseMsg, ...prev]);
      }
      addToast(`Nouveau message de ${senderName} (${selectedDeptForContact.name}) !`, 'info');
    }, 2000);
  };

  // Department Management handlers
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptDescription('');
    setDeptHead('');
    setDeptStaffCount(5);
    setDeptActiveProjects(3);
    setDeptServicesText('');
    setDeptImageFile(null);
    setDeptImagePreview(null);
    setDeptExistingImageUrl(null);
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptDescription(dept.description);
    setDeptHead(dept.head);
    setDeptStaffCount(dept.staffCount);
    setDeptActiveProjects(dept.activeProjects);
    setDeptServicesText(dept.services.join('\n'));
    setDeptImageFile(null);
    setDeptImagePreview(null);
    setDeptExistingImageUrl(dept.imageUrl || null);
    setIsDeptModalOpen(true);
  };

  const handleDeleteDept = async (deptId: string) => {
    const deptToDelete = departments.find(d => d.id === deptId);
    if (!deptToDelete) return;
    
    try {
      await fetch(`${API_URL}/departments/${deptId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete department:', err);
    }
    setDepartments(prev => prev.filter(d => d.id !== deptId));
    addToast(`Le département "${deptToDelete.name}" a été supprimé.`, 'info');
  };

  const handleSubmitDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptDescription.trim() || !deptHead.trim()) {
      addToast('Veuillez remplir tous les champs obligatoires.', 'info');
      return;
    }

    const services = deptServicesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const formData = new FormData();
    formData.append('name', deptName);
    formData.append('description', deptDescription);
    formData.append('head', deptHead);
    formData.append('staffCount', String(Number(deptStaffCount)));
    formData.append('activeProjects', String(Number(deptActiveProjects)));
    formData.append('services', JSON.stringify(services));

    if (deptImageFile) {
      formData.append('image', deptImageFile);
    } else if (editingDept && !deptExistingImageUrl) {
      formData.append('removeImage', 'true');
    }

    try {
      if (editingDept) {
        const res = await fetch(`${API_URL}/departments/${editingDept.id}`, {
          method: 'PUT',
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json();
          addToast(err.message || 'Erreur lors de la modification du département.', 'info');
          return;
        }
        const updated = await res.json();
        setDepartments(prev =>
          prev.map(d => d.id === editingDept.id ? { ...updated, id: updated._id } : d)
        );
        addToast(`Le département "${deptName}" a été modifié avec succès.`);
      } else {
        const res = await fetch(`${API_URL}/departments`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json();
          addToast(err.message || 'Erreur lors de la création du département.', 'info');
          return;
        }
        const created = await res.json();
        setDepartments(prev => [...prev, { ...created, id: created._id }]);
        addToast(`Le département "${deptName}" a été créé avec succès.`);
      }
    } catch (err) {
      addToast('Erreur lors de la sauvegarde du département.', 'info');
    }

    setIsDeptModalOpen(false);
  };

  // Compute department statistics
  const deptCounts = missions.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans flex relative overflow-x-hidden">
      
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className={`p-4 rounded-lg shadow-lg flex items-center gap-3 pointer-events-auto min-w-[300px] border ${
                toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-primary-fixed border-outline-variant text-on-primary-fixed-variant'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-primary shrink-0" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* SideNavBar Component */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-surface-container-low border-r border-secondary/15 flex flex-col p-4 z-40 shadow-md">
        <div className="mb-8 px-2">
          <h1 className="font-headline text-xl font-bold text-primary">RM Consulting</h1>
          <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mt-1">Expertise &amp; Audit</p>
        </div>

        <nav className="space-y-1 flex-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-150 ${
              activeTab === 'dashboard'
                ? 'sidebar-active text-white'
                : 'text-on-surface-variant hover:bg-secondary-container/20 hover:text-secondary'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-150 ${
              activeTab === 'departments'
                ? 'sidebar-active text-white'
                : 'text-on-surface-variant hover:bg-secondary-container/20 hover:text-secondary'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-sm">Départements</span>
          </button>

          {/* NOTE: "Documents" and "Missions" have been strictly removed per user request. */}

          <button
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-150 ${
              activeTab === 'clients'
                ? 'sidebar-active text-white'
                : 'text-on-surface-variant hover:bg-secondary-container/20 hover:text-secondary'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-sm">Clients</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-150 ${
              activeTab === 'appointments'
                ? 'sidebar-active text-white'
                : 'text-on-surface-variant hover:bg-secondary-container/20 hover:text-secondary'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="text-sm">Rendez-vous</span>
          </button>

          {/* NOTE: "Reporting" has been strictly removed per user request. */}

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-150 ${
              activeTab === 'settings'
                ? 'sidebar-active text-white'
                : 'text-on-surface-variant hover:bg-secondary-container/20 hover:text-secondary'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Paramètres</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-secondary/10 space-y-1">
          {/* NOTE: "Nouvelle Mission" and "Aide" buttons have been strictly removed per user request. */}

          <button
            onClick={() => addToast('Déconnexion simulée avec succès.', 'info')}
            className="w-full text-left text-on-surface-variant hover:text-error flex items-center gap-3 p-2 rounded-lg text-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-on-surface-variant" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 min-h-screen flex flex-col pb-12 relative">
        
        {/* TopAppBar Header */}
        <header className="sticky top-0 bg-surface/95 backdrop-blur-md border-b border-secondary/20 h-16 flex items-center justify-between px-8 z-30 shadow-sm">
          <div>
            <h2 className="font-headline text-lg font-semibold text-on-surface">Bonjour, Marc-Antoine</h2>
            <p className="text-[11px] text-on-surface-variant">Voici le récapitulatif de RM Consulting pour aujourd'hui.</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-on-surface-variant hover:bg-secondary-container/10 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-surface"></span>
                )}
              </button>

              {/* Notification Popover */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-outline-variant rounded-xl shadow-xl z-50 p-4"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-secondary/10 mb-2">
                        <span className="font-headline font-bold text-sm text-primary">Notifications</span>
                        <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                          {unreadMessagesCount} nouvelles
                        </span>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {messages.filter(m => m.isUnread && m.sender !== 'Marc-Antoine Durand' && !m.parentId).length === 0 ? (
                          <div className="text-center py-4 text-xs text-on-surface-variant">
                            Aucune nouvelle notification
                          </div>
                        ) : (
                          messages.filter(m => m.isUnread && m.sender !== 'Marc-Antoine Durand' && !m.parentId).map((msg) => (
                            <div
                              key={msg.id}
                              onClick={() => {
                                openReplyModal(msg);
                                setIsNotificationsOpen(false);
                              }}
                              className="p-2 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer text-left"
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-semibold text-xs text-on-surface">{msg.sender}</span>
                                <span className="text-[9px] text-on-surface-variant">{msg.time}</span>
                              </div>
                              <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">{msg.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-[1px] bg-secondary/20" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-on-surface">M.A. Durand</p>
                <p className="text-[10px] text-on-surface-variant">Expert Comptable Senior</p>
              </div>
              <img
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                alt="Marc-Antoine Durand"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFY1AX2x_o1O4QscnU0BaZ3ua0nFiUZsq_0nlZ3LWpp3-TYZIT083pMkowacPzs6IrGD2acBFVbLsooN0ZZ4VMTVMVJD6oo8s5uG-EB_tXqghd9jZ_z9M5nN2VeE8dXwfJm2yzKTI59tuFyq41MAL7QMxVTtg0U7myvURir-yDJiwSNn0EolHVybo5XBUn20j5K0c-qHvvEG0BzJc61HFAVXRMItNbbWwSAhVM650aPjatC_2pRzWXjg"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            
            {/* 1. DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* KPI Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Nouveaux Messages */}
                  <div className="glass-card p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-tertiary-container/10 rounded-lg text-tertiary">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      {unreadMessagesCount > 0 && (
                        <span className="px-2 py-1 bg-error-container text-error text-[9px] font-bold rounded-full">NOUVEAU</span>
                      )}
                    </div>
                    <p className="text-on-surface-variant text-[13px] font-medium">Nouveaux Messages</p>
                    <h3 className="font-headline text-2xl font-bold text-on-surface">{messages.length}</h3>
                    <p className="mt-4 text-[12px] text-on-surface-variant italic">
                      {unreadMessagesCount} non lus à traiter
                    </p>
                  </div>

                  {/* Card 2: Dates Disponibles */}
                  <div className="glass-card p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <CalendarIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        Semaine
                      </div>
                    </div>
                    <p className="text-on-surface-variant text-[13px] font-medium">Dates Disponibles</p>
                    <h3 className="font-headline text-2xl font-bold text-emerald-600">{availableDatesList.length}</h3>
                    <p className="mt-4 text-[12px] text-on-surface-variant italic">
                      {availableDatesList.length > 0 ? `${availableDatesList.length} date(s) ouverte(s) aux réservations` : 'Aucune date programmée'}
                    </p>
                  </div>

                  {/* Card 3: Rendez-vous en attente */}
                  <div className="glass-card p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-secondary-container/40 rounded-lg text-on-secondary-fixed-variant">
                        <CalendarIcon className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        Semaine
                      </div>
                    </div>
                    <p className="text-on-surface-variant text-[13px] font-medium">Rendez-vous en attente</p>
                    <h3 className="font-headline text-2xl font-bold text-on-surface">{appointments.filter(a => a.status === 'pending').length}</h3>
                    <div className="mt-4 w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full" style={{ width: `${appointments.length > 0 ? Math.round((appointments.filter(a => a.status === 'confirmed').length / appointments.length) * 100) : 0}%` }}></div>
                    </div>
                    <p className="mt-2 text-[11px] text-on-surface-variant flex justify-between">
                      <span>Capacité traitée</span>
                      <span>{appointments.length > 0 ? Math.round((appointments.filter(a => a.status === 'confirmed').length / appointments.length) * 100) : 0}%</span>
                    </p>
                  </div>
                </div>

                {/* Dashboard Widgets Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Messages Section */}
                  <div className="glass-card rounded-xl flex flex-col">
                    <div className="p-6 border-b border-secondary/10">
                      <h4 className="font-headline text-base font-bold text-on-surface">Derniers Messages</h4>
                    </div>

                    <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[350px] custom-scrollbar">
                      <AnimatePresence initial={false}>
                        {(() => {
                          const clientMessages = messages.filter(m => m.sender !== 'Marc-Antoine Durand' && !m.parentId).sort((a, b) => (a.isUnread === b.isUnread ? 0 : a.isUnread ? -1 : 1));
                          return clientMessages.length === 0 ? (
                            <div className="text-center py-8 text-sm text-on-surface-variant flex flex-col items-center gap-2">
                              <MessageSquare className="w-8 h-8 text-on-surface-variant/30" />
                              <span>Aucun message à traiter</span>
                            </div>
                          ) : (
                            <>
                            {clientMessages.map((msg) => (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className={`flex gap-3 p-3 rounded-lg transition-colors border ${msg.isUnread ? 'bg-surface-container-low/60 border-secondary/20' : 'bg-transparent border-transparent'} hover:bg-surface-container-low hover:border-secondary/10`}
                            >
                              {msg.avatarUrl ? (
                                <img
                                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-secondary/10"
                                  alt={msg.sender}
                                  src={msg.avatarUrl}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center font-bold text-sm shrink-0">
                                  {msg.initials}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      {msg.isUnread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                                      <p className={`text-xs font-bold text-on-surface truncate ${msg.isUnread ? '' : 'opacity-70'}`}>{msg.sender}</p>
                                    </div>
                                    <p className="text-[9px] text-on-surface-variant">{msg.role}</p>
                                  </div>
                                  <span className="text-[10px] text-on-surface-variant">{msg.time}</span>
                                </div>
                                <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 mb-2">
                                  {msg.content}
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openReplyModal(msg)}
                                    className="px-2.5 py-1 bg-primary text-on-primary text-[10px] font-bold rounded hover:bg-primary/90 transition-colors cursor-pointer"
                                  >
                                    Répondre
                                  </button>
                <button
                  onClick={() => handleArchiveMessage(msg.id, msg.sender)}
                  className="px-2.5 py-1 border border-red-300 text-red-600 text-[10px] font-bold rounded hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Supprimer
                </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          </>
                          );
                        })()}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Appointment Calendar Widget */}
                  <div className="glass-card rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-headline text-base font-bold text-on-surface">Calendrier des Rendez-vous</h4>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => {
                            if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                            else { setCalMonth(calMonth - 1); }
                          }}
                          className="p-1 hover:bg-surface-container rounded transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
                        </button>
                        <span className="text-xs font-bold text-on-surface">
                          {['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'][calMonth]} {calYear}
                        </span>
                        <button
                          onClick={() => {
                            if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                            else { setCalMonth(calMonth + 1); }
                          }}
                          className="p-1 hover:bg-surface-container rounded transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-6">
                      {['LUN','MAR','MER','JEU','VEN','SAM','DIM'].map(d => (
                        <div key={d} className="text-[10px] font-bold text-on-surface-variant">{d}</div>
                      ))}

                      {Array.from({ length: (() => { const d = new Date(calYear, calMonth, 1).getDay(); return d === 0 ? 6 : d - 1; })() }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {Array.from({ length: new Date(calYear, calMonth + 1, 0).getDate() }).map((_, i) => {
                        const day = i + 1;
                        const hasAppointments = appointmentsByDay[day] && appointmentsByDay[day].length > 0;
                        const isAvailableDate = availableDatesSetByDay.has(`${day}`);
                        return (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                            className={`p-2 text-xs font-semibold rounded-lg relative cursor-pointer ${
                              selectedDay === day
                                ? 'bg-primary text-white shadow-sm'
                                : hasAppointments
                                ? 'hover:bg-surface-container text-on-surface font-bold'
                                : 'hover:bg-surface-container text-on-surface'
                            }`}
                          >
                            {day}
                            {isAvailableDate && selectedDay !== day && (
                              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
                            )}
                            {hasAppointments && !isAvailableDate && selectedDay !== day && (
                              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary rounded-full" />
                            )}
                            {hasAppointments && isAvailableDate && selectedDay !== day && (
                              <>
                                <span className="absolute bottom-0.5 left-[calc(50%-4px)] w-1 h-1 bg-emerald-500 rounded-full" />
                                <span className="absolute bottom-0.5 left-[calc(50%+2px)] w-1 h-1 bg-secondary rounded-full" />
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[9px] text-on-surface-variant font-medium">Date disponible</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="text-[9px] text-on-surface-variant font-medium">Rendez-vous</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <AnimatePresence mode="wait">
                        {selectedDay && appointmentsByDay[selectedDay] ? (
                          appointmentsByDay[selectedDay].map((appt) => (
                            <motion.div
                              key={appt._id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className={`flex items-center gap-4 p-3 rounded-lg border-l-4 ${
                                appt.status === 'confirmed'
                                  ? 'bg-emerald-50 border-emerald-500'
                                  : appt.status === 'cancelled'
                                  ? 'bg-gray-50 border-gray-400 opacity-60'
                                  : 'bg-primary/5 border-primary'
                              }`}
                            >
                              <div className="text-center shrink-0 min-w-12">
                                <p className="text-[10px] font-bold text-primary uppercase">Jour {selectedDay}</p>
                                <p className="font-bold text-sm text-on-surface">{appt.timeSlot}</p>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-bold text-on-surface truncate">{appt.subject}</p>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                    appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                    appt.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {appt.status === 'confirmed' ? 'CONFIRMÉ' : appt.status === 'cancelled' ? 'ANNULÉ' : 'EN ATTENTE'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-on-surface-variant mt-0.5">
                                  {appt.clientName} — {appt.email}
                                </p>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <motion.div
                            key="no-appointment"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-3 text-center text-xs text-on-surface-variant italic bg-surface-container-low rounded-lg"
                          >
                            {selectedDay
                              ? `Aucun rendez-vous le ${selectedDay} ${['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'][calMonth]}.`
                              : 'Sélectionnez un jour pour voir les rendez-vous.'
                            }
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Departments Breakdown */}
                  <div className="glass-card rounded-xl p-6 flex flex-col">
                    <h4 className="font-headline text-base font-bold text-on-surface mb-6">Répartition par Département</h4>
                    <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-6 py-2">
                      
                      {/* Donut Chart representation */}
                      <div className="relative w-40 h-40 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e2e2" strokeWidth="3" />
                          
                          {/* Segment 1: Audit (45%) */}
                          <circle
                            cx="18" cy="18" r="15.915"
                            fill="none"
                            stroke="#6c0042"
                            strokeWidth="3.2"
                            strokeDasharray="45 100"
                            strokeDashoffset="0"
                          />
                          {/* Segment 2: Conseil (25%) */}
                          <circle
                            cx="18" cy="18" r="15.915"
                            fill="none"
                            stroke="#735b24"
                            strokeWidth="3.2"
                            strokeDasharray="25 100"
                            strokeDashoffset="-45"
                          />
                          {/* Segment 3: Juridique (15%) */}
                          <circle
                            cx="18" cy="18" r="15.915"
                            fill="none"
                            stroke="#353535"
                            strokeWidth="3.2"
                            strokeDasharray="15 100"
                            strokeDashoffset="-70"
                          />
                          {/* Segment 4: Fiscalité (15%) */}
                          <circle
                            cx="18" cy="18" r="15.915"
                            fill="none"
                            stroke="#ffd8e6"
                            strokeWidth="3.2"
                            strokeDasharray="15 100"
                            strokeDashoffset="-85"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <p className="text-xl font-bold text-on-surface">{activeMissionsCount}</p>
                          <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-tighter">Missions</p>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#6c0042]" />
                          <span className="text-xs font-bold text-on-surface">Audit ({45}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#735b24]" />
                          <span className="text-xs font-bold text-on-surface">Conseil ({25}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#353535]" />
                          <span className="text-xs font-bold text-on-surface">Juridique ({15}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#ffd8e6]" />
                          <span className="text-xs font-bold text-on-surface">Fiscalité ({15}%)</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* DEPARTMENTS VIEW */}
            {activeTab === 'departments' && (
              <motion.div
                key="departments"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-primary">Départements d'Expertise</h3>
                    <p className="text-xs text-on-surface-variant">
                      Découvrez nos pôles de spécialité chez RM Consulting. Des équipes dédiées au service de votre croissance et de votre conformité.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={handleOpenAddDept}
                      className="px-4 py-2.5 bg-primary text-white hover:bg-primary-container rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      Nouveau Département
                    </button>

                    {/* Quick stats board */}
                    <div className="flex gap-4 bg-white/60 p-3 rounded-xl border border-secondary/15 shadow-sm">
                      <div className="text-center px-3 border-r border-secondary/10">
                        <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Pôles</p>
                        <p className="text-base font-bold text-primary">{departments.length}</p>
                      </div>
                      <div className="text-center px-3 border-r border-secondary/10">
                        <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Experts</p>
                        <p className="text-base font-bold text-primary">{departments.reduce((sum, d) => sum + d.staffCount, 0)}</p>
                      </div>
                      <div className="text-center px-3">
                        <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Projets</p>
                        <p className="text-base font-bold text-emerald-600">{departments.reduce((sum, d) => sum + d.activeProjects, 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Departments Grid */}
                {departments.length === 0 ? (
                  <div className="glass-card p-12 text-center rounded-2xl border border-dashed border-secondary/20">
                    <Building2 className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-4" />
                    <p className="text-sm font-semibold text-on-surface">Aucun département trouvé</p>
                    <p className="text-xs text-on-surface-variant mt-1 mb-4">Ajoutez un nouveau pôle d'expertise pour commencer.</p>
                    <button
                      onClick={handleOpenAddDept}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Ajouter
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {departments.map((dept) => {
                      const badgeStyles = {
                        audit: 'bg-primary/10 text-primary border-primary/20',
                        conseil: 'bg-secondary/10 text-secondary border-secondary/20',
                        compta: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                        fiscalite: 'bg-tertiary/10 text-tertiary border-tertiary/20',
                        juridique: 'bg-amber-50 text-amber-800 border-amber-200',
                      }[dept.id] || 'bg-surface-container text-on-surface-variant border-outline-variant';

                      return (
                        <div key={dept.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/70">
                          <div>
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${badgeStyles} border`}>
                                  {getDeptIcon(dept.id)}
                                </div>
                                <div>
                                  <h4 className="font-headline font-bold text-base text-on-surface">{dept.name}</h4>
                                  <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full font-medium">
                                    RM Consulting
                                  </span>
                                </div>
                              </div>
                              
                              {/* Staff & Projects pills */}
                              <div className="flex flex-col items-end gap-1 text-[10px] font-mono text-on-surface-variant">
                                <span className="bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/30">
                                  👥 {dept.staffCount} Collaborateurs
                                </span>
                                <span className="bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/30">
                                  💼 {dept.activeProjects} Projets en cours
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                              {dept.description}
                            </p>

                            {/* Services List */}
                            <div className="space-y-2 mb-6">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Services Principaux</p>
                              {dept.services && dept.services.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {dept.services.map((service, index) => (
                                    <div key={index} className="flex items-start gap-2 text-xs text-on-surface-variant bg-surface-container-low/40 p-2 rounded-lg border border-secondary/5">
                                      <div className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</div>
                                      <span>{service}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-on-surface-variant/50 italic">Aucun service défini.</p>
                              )}
                            </div>
                          </div>

                          {/* Card Footer / Action */}
                          <div className="flex items-center justify-between border-t border-secondary/10 pt-4 mt-auto">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">
                                {dept.head && dept.head.split(' ').length > 1 ? `${dept.head.split(' ')[0][0]}${dept.head.split(' ')[1][0]}` : 'RE'}
                              </div>
                              <div className="text-left">
                                <p className="text-[11px] font-bold text-on-surface">{dept.head ? dept.head.split(' (')[0] : 'Responsable'}</p>
                                <p className="text-[9px] text-on-surface-variant font-medium">{dept.head && dept.head.includes('(') ? dept.head.split('(')[1].replace(')', '') : 'Responsable'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditDept(dept)}
                                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg border border-transparent hover:border-primary/10 transition-all cursor-pointer"
                                title="Modifier"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDept(dept.id)}
                                className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg border border-transparent hover:border-error/10 transition-all cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenDeptContact(dept)}
                                className="bg-primary/5 hover:bg-primary text-primary hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border border-primary/10 active:scale-95"
                              >
                                <Send className="w-3 h-3" />
                                Contacter
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* 2. MISSIONS EXPANDED VIEW */}
            {activeTab === 'missions' && (
              <motion.div
                key="missions"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">Registre des Missions</h3>
                    <p className="text-xs text-on-surface-variant">Gérez et suivez le statut de toutes vos missions actives d'audit et de conseil.</p>
                  </div>
                  <button
                    onClick={() => setIsNewMissionOpen(true)}
                    className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-center"
                  >
                    <Plus className="w-4 h-4" />
                    Créer une Mission
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="glass-card p-4 rounded-xl flex items-center gap-3">
                  <Search className="w-5 h-5 text-on-surface-variant shrink-0" />
                  <input
                    type="text"
                    placeholder="Rechercher par mission ou par client..."
                    value={missionSearch}
                    onChange={(e) => setMissionSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-full text-on-surface placeholder:text-on-surface-variant/50"
                  />
                  {missionSearch && (
                    <button onClick={() => setMissionSearch('')} className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Main Table */}
                <div className="glass-card rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-container-low border-b border-primary/20">
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant">Mission / Client</th>
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant">Département</th>
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant">Statut</th>
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant">Progression</th>
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-secondary/5">
                        {missions
                          .filter(
                            (m) =>
                              m.title.toLowerCase().includes(missionSearch.toLowerCase()) ||
                              m.client.toLowerCase().includes(missionSearch.toLowerCase())
                          )
                          .map((mission) => (
                            <tr key={mission.id} className="hover:bg-primary/5 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-semibold text-sm text-on-surface">{mission.title}</p>
                                <p className="text-xs text-on-surface-variant">{mission.client}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs text-on-surface-variant">{mission.department}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  mission.status === 'VALIDE'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : mission.status === 'DUE DILIGENCE'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-primary-fixed text-on-primary-fixed-variant'
                                }`}>
                                  {mission.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 w-60">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 bg-surface-container h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-500 ${
                                        mission.progression === 100 ? 'bg-emerald-600' : 'bg-primary'
                                      }`}
                                      style={{ width: `${mission.progression}%` }}
                                    />
                                  </div>
                                  <span className="text-[11px] font-semibold text-on-surface">{mission.progression}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, progression: Math.min(100, m.progression + 10) } : m));
                                      addToast(`Progression de "${mission.title}" incrémentée.`);
                                    }}
                                    className="px-2.5 py-1 text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/5 rounded transition-all cursor-pointer"
                                  >
                                    +10%
                                  </button>
                                  <button
                                    onClick={() => {
                                      setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, status: 'VALIDE', progression: 100 } : m));
                                      addToast(`Mission "${mission.title}" validée.`);
                                    }}
                                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-all cursor-pointer"
                                  >
                                    Valider
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. CLIENTS VIEW */}
            {activeTab === 'clients' && (
              <motion.div
                key="clients"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface">Annuaire des Clients</h3>
                  <p className="text-xs text-on-surface-variant">Consultez et gérez les comptes de vos clients et leurs interlocuteurs privilégiés.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Client Card 1 */}
                  <div className="glass-card p-6 rounded-xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-on-surface">TechFlow SAS</h4>
                          <span className="text-[10px] bg-primary-fixed text-on-primary-fixed-variant px-2 py-0.5 rounded-full font-bold uppercase">
                            Audit Légal
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 border-t border-secondary/10 pt-4 text-xs text-on-surface-variant">
                      <div className="flex justify-between">
                        <span>Contact Principal:</span>
                        <span className="font-semibold text-on-surface">Sophie Martin</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="font-semibold text-on-surface">s.martin@techflow.com</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chiffre d'Affaires:</span>
                        <span className="font-semibold text-on-surface">2.4M €</span>
                      </div>
                    </div>
                  </div>

                  {/* Client Card 2 */}
                  <div className="glass-card p-6 rounded-xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-on-surface">ImmoBail SARL</h4>
                          <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold uppercase">
                            Conseil
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 border-t border-secondary/10 pt-4 text-xs text-on-surface-variant">
                      <div className="flex justify-between">
                        <span>Contact Principal:</span>
                        <span className="font-semibold text-on-surface">Jean Dupont</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="font-semibold text-on-surface">j.dupont@immobail.fr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chiffre d'Affaires:</span>
                        <span className="font-semibold text-on-surface">850k €</span>
                      </div>
                    </div>
                  </div>

                  {/* Client Card 3 */}
                  <div className="glass-card p-6 rounded-xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-tertiary-container/10 text-on-tertiary-container rounded-xl">
                          <Building2 className="w-6 h-6 text-on-surface" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-on-surface">Global Logistics</h4>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">
                            Comptabilité
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 border-t border-secondary/10 pt-4 text-xs text-on-surface-variant">
                      <div className="flex justify-between">
                        <span>Contact Principal:</span>
                        <span className="font-semibold text-on-surface">Benoit Lefebvre</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="font-semibold text-on-surface">b.lefebvre@globlog.com</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chiffre d'Affaires:</span>
                        <span className="font-semibold text-on-surface">12M €</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. REPORTING VIEW */}
            {activeTab === 'reporting' && (
              <motion.div
                key="reporting"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface">Analyses &amp; Performance</h3>
                  <p className="text-xs text-on-surface-variant">Suivi en temps réel des performances de RM Consulting et de la répartition des portefeuilles clients.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Progress Card */}
                  <div className="glass-card p-6 rounded-xl space-y-6">
                    <h4 className="font-bold text-sm text-on-surface">Performances Trimestrielles</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>Audit et Certification</span>
                          <span>92%</span>
                        </div>
                        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>Conseil et Fusions</span>
                          <span>74%</span>
                        </div>
                        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                          <div className="bg-secondary h-full" style={{ width: '74%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>Fiscalité et Juridique</span>
                          <span>85%</span>
                        </div>
                        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Card */}
                  <div className="glass-card p-6 rounded-xl space-y-4">
                    <h4 className="font-bold text-sm text-on-surface">Indicateurs Majeurs</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <Award className="w-5 h-5 text-primary mb-2" />
                        <h5 className="text-[11px] text-on-surface-variant font-medium">Taux de Satisfaction</h5>
                        <p className="text-lg font-bold text-primary mt-1">98.5%</p>
                      </div>
                      <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/10">
                        <Globe className="w-5 h-5 text-secondary mb-2" />
                        <h5 className="text-[11px] text-on-surface-variant font-medium">Clients Internationaux</h5>
                        <p className="text-lg font-bold text-secondary mt-1">24%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. SETTINGS VIEW */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface">Paramètres Globaux</h3>
                  <p className="text-xs text-on-surface-variant">Configurez votre environnement de travail et gérez vos préférences de profil.</p>
                </div>

                <div className="glass-card p-6 rounded-xl max-w-2xl space-y-6">
                  {/* Account Settings */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-on-surface pb-2 border-b border-secondary/10">Profil Utilisateur</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Nom Complet</label>
                        <input
                          type="text"
                          defaultValue="Marc-Antoine Durand"
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface focus:outline-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Adresse Email</label>
                        <input
                          type="email"
                          defaultValue="ma.durand@rmconsulting.fr"
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface focus:outline-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="space-y-4 pt-4">
                    <h4 className="font-bold text-sm text-on-surface pb-2 border-b border-secondary/10">Préférences de Notification</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 text-xs font-medium text-on-surface">
                        <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary w-4 h-4" />
                        <span>Notifications push en cas de nouvelle mission</span>
                      </label>
                      <label className="flex items-center gap-3 text-xs font-medium text-on-surface">
                        <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary w-4 h-4" />
                        <span>Alertes par email pour les rendez-vous en attente</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => addToast('Paramètres mis à jour.')}
                      className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. APPOINTMENTS VIEW */}
            {activeTab === 'appointments' && (
              <motion.div
                key="appointments"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-primary">Gestion des Rendez-vous</h3>
                    <p className="text-xs text-on-surface-variant">
                      Définissez vos dates et créneaux disponibles, et consultez les demandes de rendez-vous reçues.
                    </p>
                  </div>
                  <div className="flex gap-4 bg-white/60 p-3 rounded-xl border border-secondary/15 shadow-sm">
                    <div className="text-center px-3 border-r border-secondary/10">
                      <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Dates ouvertes</p>
                      <p className="text-base font-bold text-primary">{availableDatesList.length}</p>
                    </div>
                    <div className="text-center px-3">
                      <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Demandes</p>
                      <p className="text-base font-bold text-amber-600">{appointments.filter(a => a.status === 'pending').length}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* LEFT: Calendar to manage available dates */}
                  <div className="glass-card rounded-xl p-6">
                    <h4 className="font-headline text-base font-bold text-on-surface mb-4">Dates Disponibles</h4>
                    <p className="text-[11px] text-on-surface-variant mb-4">Cliquez sur une date pour la rendre disponible aux réservations. Cliquez à nouveau pour la retirer.</p>
                    
                    <div className="bg-surface-container-low rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={() => {
                            if (availCalMonth === 0) { setAvailCalMonth(11); setAvailCalYear(availCalYear - 1); }
                            else { setAvailCalMonth(availCalMonth - 1); }
                          }}
                          className="p-1 hover:bg-surface-container rounded transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
                        </button>
                        <span className="text-sm font-bold text-on-surface">
                          {['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'][availCalMonth]} {availCalYear}
                        </span>
                        <button
                          onClick={() => {
                            if (availCalMonth === 11) { setAvailCalMonth(0); setAvailCalYear(availCalYear + 1); }
                            else { setAvailCalMonth(availCalMonth + 1); }
                          }}
                          className="p-1 hover:bg-surface-container rounded transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => (
                          <div key={d} className="text-[9px] font-bold text-on-surface-variant py-1">{d}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: (() => { const d = new Date(availCalYear, availCalMonth, 1).getDay(); return d === 0 ? 6 : d - 1; })() }).map((_, i) => (
                          <div key={`e-${i}`} />
                        ))}
                        {Array.from({ length: new Date(availCalYear, availCalMonth + 1, 0).getDate() }).map((_, i) => {
                          const day = i + 1;
                          const dateStr = `${availCalYear}-${String(availCalMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isAvailable = availableDatesList.some(d => d.date.split('T')[0] === dateStr);
                          const isPast = new Date(dateStr) < new Date(new Date().toDateString());
                          const toggleDate = async () => {
                            if (isPast) return;
                            if (isAvailable) {
                              const match = availableDatesList.find(d => d.date.split('T')[0] === dateStr);
                              if (match) {
                                setTimeSlotDateStr(dateStr);
                                setTimeSlotDayNum(day);
                                setSelectedTimeSlots(match.timeSlots);
                                setEditingTimeSlotId(match._id);
                                setTimeSlotModalOpen(true);
                              }
                            } else {
                              setTimeSlotDateStr(dateStr);
                              setTimeSlotDayNum(day);
                              setSelectedTimeSlots([]);
                              setEditingTimeSlotId(null);
                              setTimeSlotModalOpen(true);
                            }
                          };
                          return (
                            <button
                              key={day}
                              onClick={toggleDate}
                              disabled={isPast}
                              className={`relative p-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                                isPast
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : isAvailable
                                  ? 'bg-primary text-white shadow-sm'
                                  : 'text-on-surface hover:bg-surface-container'
                              }`}
                            >
                              {day}
                              {isAvailable && !isPast && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* List of available dates */}
                    {availableDatesList.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Dates programmées</p>
                        {availableDatesList.map(d => (
                          <div key={d._id} className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-emerald-800">
                                {new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setTimeSlotDateStr(d.date.split('T')[0]);
                                    setTimeSlotDayNum(new Date(d.date).getDate());
                                    setSelectedTimeSlots(d.timeSlots);
                                    setEditingTimeSlotId(d._id);
                                    setTimeSlotModalOpen(true);
                                  }}
                                  className="text-[10px] text-primary hover:text-primary/80 font-bold cursor-pointer"
                                >
                                  Modifier horaires
                                </button>
                                <button
                                  onClick={async () => {
                                    await fetch(`${API_URL}/available-dates/${d._id}`, { method: 'DELETE' });
                                    setAvailableDatesList(prev => prev.filter(x => x._id !== d._id));
                                  }}
                                  className="text-[10px] text-red-500 hover:text-red-700 font-bold cursor-pointer"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {d.timeSlots.map((slot, si) => (
                                <span key={si} className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                                  {slot}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Incoming appointment requests */}
                  <div className="glass-card rounded-xl flex flex-col">
                    <div className="p-6 border-b border-secondary/10">
                      <h4 className="font-headline text-base font-bold text-on-surface">Demandes de Rendez-vous</h4>
                    </div>
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[600px] custom-scrollbar">
                      {appointments.length === 0 ? (
                        <div className="text-center py-12 text-sm text-on-surface-variant flex flex-col items-center gap-2">
                          <CalendarIcon className="w-8 h-8 text-on-surface-variant/30" />
                          <span>Aucune demande de rendez-vous</span>
                        </div>
                      ) : (
                        appointments.map(appt => (
                          <div key={appt._id} className={`p-4 rounded-xl border transition-all ${
                            appt.status === 'pending' ? 'border-amber-200 bg-amber-50/50' :
                            appt.status === 'confirmed' ? 'border-emerald-200 bg-emerald-50/50' :
                            'border-gray-200 bg-gray-50/50 opacity-60'
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm font-bold text-on-surface">{appt.clientName}</p>
                                <p className="text-[10px] text-on-surface-variant">{appt.email}</p>
                              </div>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                appt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {appt.status === 'pending' ? 'EN ATTENTE' : appt.status === 'confirmed' ? 'CONFIRMÉ' : 'ANNULÉ'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-on-surface-variant mb-2">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {new Date(appt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {appt.timeSlot}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-on-surface mb-1">{appt.subject}</p>
                            {appt.details && <p className="text-[11px] text-on-surface-variant line-clamp-2 mb-3">{appt.details}</p>}
                            {appt.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={async () => {
                                    await fetch(`${API_URL}/appointments/${appt._id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: 'confirmed' })
                                    });
                                    setAppointments(prev => prev.map(a => a._id === appt._id ? { ...a, status: 'confirmed' } : a));
                                    addToast(`RDV avec ${appt.clientName} confirmé.`);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                                >
                                  Confirmer
                                </button>
                                <button
                                  onClick={async () => {
                                    await fetch(`${API_URL}/appointments/${appt._id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: 'cancelled' })
                                    });
                                    setAppointments(prev => prev.map(a => a._id === appt._id ? { ...a, status: 'cancelled' } : a));
                                    addToast(`RDV avec ${appt.clientName} annulé.`, 'info');
                                  }}
                                  className="px-3 py-1.5 border border-red-300 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  Refuser
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Global Footer */}
        <footer className="w-full py-8 bg-surface-container-highest border-t border-secondary/20 mt-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto px-8">
            <div className="md:col-span-2">
              <h5 className="font-headline text-sm font-bold text-primary mb-3">RM Consulting</h5>
              <p className="text-xs text-on-tertiary-fixed-variant leading-relaxed mb-4">
                Excellence en Expertise Comptable et Audit. Nous accompagnons les leaders de demain dans leur croissance et leur conformité financière avec rigueur et intégrité.
              </p>
              <p className="text-xs text-on-surface-variant">© 2026 RM Consulting. Tous droits réservés.</p>
            </div>
            <div>
              <h6 className="text-xs font-bold text-on-surface mb-3">Navigation</h6>
              <ul className="space-y-1.5 text-xs text-on-tertiary-fixed-variant">
                <li><button onClick={() => { setActiveTab('dashboard'); }} className="hover:text-primary transition-colors cursor-pointer text-left">Dashboard</button></li>
                <li><button onClick={() => { setActiveTab('missions'); }} className="hover:text-primary transition-colors cursor-pointer text-left">Nos Services &amp; Missions</button></li>
                <li><button onClick={() => { setActiveTab('clients'); }} className="hover:text-primary transition-colors cursor-pointer text-left">Portefeuille Client</button></li>
              </ul>
            </div>
            <div>
              <h6 className="text-xs font-bold text-on-surface mb-3">Légal &amp; Qualité</h6>
              <ul className="space-y-1.5 text-xs text-on-tertiary-fixed-variant">
                <li><a className="hover:text-primary transition-colors" href="#">Mentions Légales</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Confidentialité</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">ISO 9001</a></li>
              </ul>
            </div>
          </div>
        </footer>

      </main>

      {/* MODAL 1: CREATE NEW MISSION */}
      <AnimatePresence>
        {isNewMissionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewMissionOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-white border border-outline-variant rounded-xl shadow-2xl z-10 overflow-hidden"
            >
              <div className="flex justify-between items-center bg-primary text-on-primary px-6 py-4">
                <h4 className="font-headline font-bold text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Nouvelle Mission
                </h4>
                <button
                  onClick={() => setIsNewMissionOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMission} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    Intitulé de la Mission <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMissionTitle}
                    onChange={(e) => setNewMissionTitle(e.target.value)}
                    placeholder="Ex: Audit RSE 2024, Cession d'Actifs..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-primary placeholder:text-on-surface-variant/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    Nom du Client <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMissionClient}
                    onChange={(e) => setNewMissionClient(e.target.value)}
                    placeholder="Ex: TechFlow SAS, SARL Neo..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-primary placeholder:text-on-surface-variant/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Département</label>
                    <select
                      value={newMissionDept}
                      onChange={(e) => setNewMissionDept(e.target.value as any)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-primary"
                    >
                      <option value="Audit Légal">Audit Légal</option>
                      <option value="Conseil">Conseil</option>
                      <option value="Comptabilité">Comptabilité</option>
                      <option value="Juridique">Juridique</option>
                      <option value="Fiscalité">Fiscalité</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Statut Initial</label>
                    <input
                      type="text"
                      value={newMissionStatus}
                      onChange={(e) => setNewMissionStatus(e.target.value.toUpperCase())}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-primary font-bold tracking-wider"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-1">
                    <span>Progression Initiale</span>
                    <span>{newMissionProg}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newMissionProg}
                    onChange={(e) => setNewMissionProg(Number(e.target.value))}
                    className="w-full accent-primary bg-surface-container-high h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-secondary/10">
                  <button
                    type="button"
                    onClick={() => setIsNewMissionOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-container rounded-lg transition-colors cursor-pointer"
                  >
                    Créer la Mission
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: REPLY TO MESSAGE — Chat Thread */}
      <AnimatePresence>
        {isReplyOpen && activeReplyMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReplyOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary-container px-6 py-4 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {activeReplyMessage.avatarUrl ? (
                      <img className="w-10 h-10 rounded-full object-cover border-2 border-white/30" src={activeReplyMessage.avatarUrl} alt={activeReplyMessage.sender} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-sm border-2 border-white/30">
                        {activeReplyMessage.initials || activeReplyMessage.sender.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-headline font-bold text-sm text-white">{activeReplyMessage.sender}</h4>
                      <p className="text-[10px] text-white/60">{activeReplyMessage.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsReplyOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Thread Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0 bg-gradient-to-b from-surface-container-low/30 to-white custom-scrollbar">
                {(() => {
                  const threadId = activeReplyMessage.parentId || activeReplyMessage.id;
                  const threadMessages = messages
                    .filter(m => m.id === threadId || m.parentId === threadId)
                    .sort((a, b) => {
                      if (a.id === threadId) return -1;
                      if (b.id === threadId) return 1;
                      return 0;
                    });

                  return threadMessages.map((msg, idx) => {
                    const isMe = msg.sender === 'Marc-Antoine Durand';
                    const prevMsg = threadMessages[idx - 1];
                    const showHeader = !prevMsg || prevMsg.sender !== msg.sender;

                    return (
                      <div key={msg.id} className={`${idx > 0 && showHeader ? 'mt-4' : idx > 0 ? 'mt-0.5' : ''}`}>
                        {showHeader && (
                          <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span className={`text-[10px] font-bold ${isMe ? 'text-primary' : 'text-on-surface'}`}>
                              {isMe ? 'Vous' : msg.sender}
                            </span>
                            <span className="text-[9px] text-on-surface-variant/60">{msg.time}</span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] px-4 py-2.5 text-xs leading-relaxed ${
                            isMe
                              ? 'bg-primary text-white rounded-2xl rounded-br-md shadow-sm'
                              : 'bg-surface-container-low text-on-surface rounded-2xl rounded-bl-md border border-secondary/10'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}

                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-secondary/10" />
                  <span className="text-[9px] text-on-surface-variant/50 font-medium uppercase tracking-wider">Aujourd'hui</span>
                  <div className="flex-1 h-px bg-secondary/10" />
                </div>
              </div>

              {/* Reply Input */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-secondary/10 shrink-0 bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    rows={1}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }}
                    placeholder="Écrire un message..."
                    className="flex-1 bg-surface-container-low border border-secondary/15 rounded-2xl px-4 py-2.5 text-xs text-on-surface focus:outline-primary focus:ring-1 focus:ring-primary/30 placeholder:text-on-surface-variant/40 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="w-9 h-9 bg-primary hover:bg-primary-container disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-full flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 active:scale-90"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: HELP CENTER */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHelpOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-white border border-outline-variant rounded-xl shadow-2xl z-10 overflow-hidden p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-secondary/10 pb-3">
                <h4 className="font-headline font-bold text-sm text-primary flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Centre d'Assistance
                </h4>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-on-surface-variant">
                <p className="font-medium text-on-surface">Besoin d'aide sur le portail RM Consulting ?</p>
                <div className="space-y-2.5">
                  <div className="p-3 bg-surface-container-low rounded-lg">
                    <p className="font-bold text-on-surface mb-1">Comment créer une mission ?</p>
                    <p>Cliquez sur "Nouvelle Mission" en bas à gauche pour configurer un nouvel audit ou une mission de conseil.</p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-lg">
                    <p className="font-bold text-on-surface mb-1">Mise à jour de la progression</p>
                    <p>Dans l'onglet "Missions", vous pouvez augmenter la progression de 10% ou marquer la mission comme validée instantanément.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: CONTACT DEPARTMENT */}
      <AnimatePresence>
        {isDeptContactOpen && selectedDeptForContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeptContactOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-white border border-outline-variant rounded-xl shadow-2xl z-10 overflow-hidden"
            >
              <div className="flex justify-between items-center bg-primary text-on-primary px-6 py-4">
                <h4 className="font-headline font-bold text-sm flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Contacter {selectedDeptForContact.head.split(' (')[0]}
                </h4>
                <button
                  onClick={() => setIsDeptContactOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendDeptContact} className="p-6 space-y-4">
                <div className="p-3 bg-surface-container-low rounded-lg text-xs text-on-surface-variant">
                  <p className="font-semibold text-on-surface mb-1">Pôle d'Expertise :</p>
                  <p className="font-bold text-primary">{selectedDeptForContact.name}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Votre message</label>
                  <textarea
                    rows={4}
                    required
                    value={deptContactMessage}
                    onChange={(e) => setDeptContactMessage(e.target.value)}
                    placeholder={`Saisissez votre message pour ${selectedDeptForContact.head.split(' (')[0]}...`}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-primary placeholder:text-on-surface-variant/30 resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-secondary/10">
                  <button
                    type="button"
                    onClick={() => setIsDeptContactOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-container rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Envoyer le Message
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: ADD / EDIT DEPARTMENT */}
      <AnimatePresence>
        {isDeptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeptModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-white border border-outline-variant rounded-xl shadow-2xl z-10 overflow-hidden"
            >
              <div className="flex justify-between items-center bg-primary text-on-primary px-6 py-4">
                <h4 className="font-headline font-bold text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {editingDept ? 'Modifier le Département' : 'Nouveau Département'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitDept} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    Nom du Département *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="Ex: Conseil & Stratégie, Fiscalité..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-primary placeholder:text-on-surface-variant/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={deptDescription}
                    onChange={(e) => setDeptDescription(e.target.value)}
                    placeholder="Description concise des missions et spécialités de ce pôle..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-primary placeholder:text-on-surface-variant/30 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    Responsable du Pôle *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptHead}
                    onChange={(e) => setDeptHead(e.target.value)}
                    placeholder="Ex: Sophie Martin (Chef de Mission)"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-primary placeholder:text-on-surface-variant/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">
                      Nombre de Collaborateurs
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={deptStaffCount}
                      onChange={(e) => setDeptStaffCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">
                      Projets Actifs
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={deptActiveProjects}
                      onChange={(e) => setDeptActiveProjects(parseInt(e.target.value) || 0)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    Services Principaux (Un service par ligne)
                  </label>
                  <textarea
                    rows={4}
                    value={deptServicesText}
                    onChange={(e) => setDeptServicesText(e.target.value)}
                    placeholder={"Ex:\nTenue complète ou partagée de la comptabilité\nÉtablissement des comptes annuels\nConsolidation financière"}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface font-sans focus:outline-primary placeholder:text-on-surface-variant/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    Image du Département <span className="font-normal text-on-surface-variant/60">(optionnel)</span>
                  </label>
                  {(deptImagePreview || deptExistingImageUrl) && (
                    <div className="relative mb-2 inline-block">
                      <img
                        src={deptImagePreview || deptExistingImageUrl || ''}
                        alt="Aperçu"
                        className="w-full h-32 object-cover rounded-lg border border-outline-variant"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setDeptImageFile(null);
                          setDeptImagePreview(null);
                          setDeptExistingImageUrl(null);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 cursor-pointer hover:bg-red-600"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 w-full bg-surface-container-low border border-dashed border-outline-variant rounded-lg p-4 text-xs text-on-surface-variant hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {deptImageFile ? deptImageFile.name : 'Choisir une image (JPG, PNG, WebP)'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setDeptImageFile(file);
                          setDeptExistingImageUrl(null);
                          const reader = new FileReader();
                          reader.onload = (ev) => setDeptImagePreview(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-secondary/10">
                  <button
                    type="button"
                    onClick={() => setIsDeptModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-container rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {editingDept ? 'Enregistrer les Modifications' : 'Créer le Département'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: TIME SLOT SELECTOR */}
      <AnimatePresence>
        {timeSlotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTimeSlotModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-white border border-outline-variant rounded-xl shadow-2xl z-10 overflow-hidden"
            >
              <div className="flex justify-between items-center bg-primary text-on-primary px-6 py-4">
                <h4 className="font-headline font-bold text-sm flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Horaires - {timeSlotDayNum} {['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'][availCalMonth]} {availCalYear}
                </h4>
                <button
                  type="button"
                  onClick={() => setTimeSlotModalOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-on-surface-variant">
                  Sélectionnez les créneaux horaires disponibles pour cette date.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {PRESET_TIME_SLOTS.map(slot => {
                    const isSelected = selectedTimeSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setSelectedTimeSlots(prev =>
                            isSelected ? prev.filter(s => s !== slot) : [...prev, slot]
                          );
                        }}
                        className={`text-xs font-medium p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-surface-container-low text-on-surface border-outline-variant hover:border-primary/50'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-secondary/10">
                  {editingTimeSlotId && (
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`${API_URL}/available-dates/${editingTimeSlotId}`, { method: 'DELETE' });
                        setAvailableDatesList(prev => prev.filter(d => d._id !== editingTimeSlotId));
                        setTimeSlotModalOpen(false);
                        addToast(`Date ${timeSlotDayNum} supprimée.`, 'info');
                      }}
                      className="px-4 py-2 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Supprimer la date
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setTimeSlotModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={selectedTimeSlots.length === 0}
                    onClick={async () => {
                      if (selectedTimeSlots.length === 0) return;
                      if (editingTimeSlotId) {
                        const res = await fetch(`${API_URL}/available-dates/${editingTimeSlotId}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ timeSlots: selectedTimeSlots })
                        });
                        if (res.ok) {
                          const updated = await res.json();
                          setAvailableDatesList(prev =>
                            prev.map(d => d._id === editingTimeSlotId ? updated : d)
                          );
                          addToast(`Horaires mis à jour pour le ${timeSlotDayNum}.`);
                        }
                      } else {
                        const res = await fetch(`${API_URL}/available-dates`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ date: timeSlotDateStr, timeSlots: selectedTimeSlots })
                        });
                        if (res.ok) {
                          const created = await res.json();
                          setAvailableDatesList(prev => [...prev, created]);
                          addToast(`Date ${timeSlotDayNum} ajoutée avec ${selectedTimeSlots.length} créneau(x).`);
                        }
                      }
                      setTimeSlotModalOpen(false);
                    }}
                    className="px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-container rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {editingTimeSlotId ? 'Enregistrer' : 'Ajouter la date'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
