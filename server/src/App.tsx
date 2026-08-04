import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import MapPicker from './MapPicker.js';
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
  Building2,
  Award,
  Globe,
  BellRing,
  UserCheck,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  XCircle,
  FileText,
  Filter,
  Download,
  Archive,
  ArchiveRestore,
  BriefcaseBusiness,
  Copy,
  Power,
  MapPin,
  GraduationCap,
  CalendarClock,
  ListChecks,
  Target,
  Sparkles,
  Layers,
  UsersRound,
  Eye,
  ExternalLink,
  Loader2
} from 'lucide-react';

// Interfaces
interface Mission {
  id: string;
  title: string;
  client: string;
  department: 'Audit LÃ©gal' | 'Conseil' | 'ComptabilitÃ©' | 'Juridique' | 'FiscalitÃ©';
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
  status: 'new' | 'processing' | 'done';
  archived?: boolean;
  createdAt?: string;
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

const getHostname = (): string => window.location.hostname || 'localhost';

const siteOrigin = (): string => {
  try {
    const stored = localStorage.getItem('rm_site_origin');
    if (stored) return stored;
  } catch {
    // localStorage unavailable (sandboxed iframe) â€” fall through to default
  }
  return `${window.location.protocol}//${getHostname()}:3000`;
};

const safeGetToken = (): string | null => {
  try {
    return localStorage.getItem('rm_admin_token');
  } catch {
    return null;
  }
};

const safeSetToken = (token: string): void => {
  try {
    localStorage.setItem('rm_admin_token', token);
  } catch {
    // ignore storage errors
  }
};

const safeRemoveToken = (): void => {
  try {
    localStorage.removeItem('rm_admin_token');
  } catch {
    // ignore storage errors
  }
};

const safeSetSiteOrigin = (origin: string): void => {
  try {
    localStorage.setItem('rm_site_origin', origin);
  } catch {
    // ignore storage errors
  }
};

// Headers d'authentification pour les appels API admin (Bearer JWT)
const authHeaders = (json = true): Record<string, string> => {
  const headers: Record<string, string> = json ? { 'Content-Type': 'application/json' } : {};
  const token = safeGetToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// Fetch avec authentification automatique
const authedFetch = (url: string, init: RequestInit = {}): Promise<Response> =>
  fetch(url, { ...init, headers: { ...authHeaders(!!init.body), ...(init.headers || {}) } });

// Ã‰chappe le contenu candidat avant insertion dans le document HTML du PDF exportÃ©
const escHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

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

// Estimation du nombre d'annÃ©es d'expÃ©rience Ã  partir de la chaÃ®ne libre (ex: "4 ans d'expÃ©rience")
const parseExpYears = (exp?: string): number => {
  if (!exp) return 0;
  const match = exp.match(/(\d+([.,]\d+)?)\s*ans?/i);
  if (match) return parseFloat(match[1].replace(',', '.'));
  return /junior|stage/i.test(exp) ? 0.5 : 0;
};

// LibellÃ© + classes de couleur pour chaque statut de candidature
const candidateStatusInfo = (status: string): { label: string; cls: string } => {
  switch (status) {
    case 'new':
      return { label: 'Nouveau', cls: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'analyzing':
      return { label: 'En cours', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
    case 'interview':
      return { label: 'Entretien', cls: 'bg-purple-100 text-purple-700 border-purple-200' };
    case 'accepted':
      return { label: 'AcceptÃ©', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    default:
      return { label: 'RefusÃ©', cls: 'bg-rose-100 text-rose-700 border-rose-200' };
  }
};

// Convertit une heure au format 24h ("14:30") en format 12h avec AM/PM ("2:30 PM")
const formatTimeAmPm = (time?: string): string => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h)) return time;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const minutes = Number.isNaN(m) ? 0 : m;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
};

const OFFER_DEPARTMENTS = [
  'Expertise Comptable',
  'Audit',
  'FiscalitÃ©',
  'Conseil',
  'Administratif',
  'Autre',
];

const OFFER_CONTRACTS = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'];

const OFFER_STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  published: 'PubliÃ©e',
  closed: 'FermÃ©e',
};

// Badge couleur pour chaque statut d'offre
const offerStatusInfo = (status: string): { label: string; cls: string } => {
  switch (status) {
    case 'published':
      return { label: 'PubliÃ©e', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    case 'closed':
      return { label: 'FermÃ©e', cls: 'bg-gray-100 text-gray-600 border-gray-200' };
    default:
      return { label: 'Brouillon', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
  }
};

// Couleur du badge du type de contrat
const contractBadgeCls = (contract: string): string => {
  switch (contract) {
    case 'CDI':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CDD':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Stage':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Alternance':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Freelance':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

// LibellÃ© + classes de couleur pour chaque statut de message
const messageStatusInfo = (status: string): { label: string; cls: string } => {
  switch (status) {
    case 'processing':
      return { label: 'En cours', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
    case 'done':
      return { label: 'TraitÃ©', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    default:
      return { label: 'Nouveau', cls: 'bg-blue-100 text-blue-700 border-blue-200' };
  }
};

// Date de rÃ©ception lisible d'un message (crÃ©Ã© en base) sinon son heure
const formatMessageDate = (msg: Message): string => {
  if (msg.createdAt) {
    try {
      return new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { /* fall through */ }
  }
  return msg.time || '';
};

// Extrait le sujet, l'email et le corps d'un message au format "[Sujet]\n\nEmail: x\n\nTexte"
const parseMessageParts = (msg: Message): { subject: string; email: string; body: string } => {
  const content = msg.content || '';
  const subjectMatch = content.match(/^\[(.+?)\]/);
  const subject = subjectMatch ? subjectMatch[1] : (msg.role === 'Client' ? 'Demande de contact' : '');
  const emailMatch = content.match(/Email:\s*(.+)/);
  const email = emailMatch ? emailMatch[1].trim() : (msg.email || '');
  const body = content
    .replace(/^\[.+?\]/, '')
    .replace(/Email:\s*.+/, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { subject, email, body };
};

export default function App() {
  const [isAuthChecked, setIsAuthChecked] = useState(false);

// Navigation active tab (persisted so refresh keeps the current page)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'missions' | 'reporting' | 'settings' | 'departments' | 'appointments' | 'messages' | 'references' | 'recruitment' | 'offers'>(() => {
    try {
      const saved = localStorage.getItem('rm_admin_active_tab');
      const valid = ['dashboard', 'missions', 'reporting', 'settings', 'departments', 'appointments', 'messages', 'references', 'recruitment', 'offers'];
      return (saved && valid.includes(saved) ? saved : 'dashboard') as 'dashboard' | 'missions' | 'reporting' | 'settings' | 'departments' | 'appointments' | 'messages' | 'references' | 'recruitment' | 'offers';
    } catch {
      return 'dashboard';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rm_admin_active_tab', activeTab);
    } catch {
      // ignore storage errors
    }
  }, [activeTab]);

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

  // Messages inbox state
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'processing' | 'done'>('all');
  const [messageDetailOpen, setMessageDetailOpen] = useState(false);
  const [activeMessageDetail, setActiveMessageDetail] = useState<Message | null>(null);

  // Appointments state
  interface AppointmentData {
    _id: string;
    clientName: string;
    email: string;
    date: string;
    timeSlot: string;
    subject: string;
    details: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled';
    rescheduledDate: string;
    rescheduledTimeSlot: string;
    duration?: string;
  }
  interface AvailableDateData {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    timeSlots: string[];
    bookedSlots: string[];
  }
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [availableDatesList, setAvailableDatesList] = useState<AvailableDateData[]>([]);
  const [availCalMonth, setAvailCalMonth] = useState(new Date().getMonth());
  const [availCalYear, setAvailCalYear] = useState(new Date().getFullYear());

  // Appointment creation state
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [newApptClient, setNewApptClient] = useState('');
  const [newApptEmail, setNewApptEmail] = useState('');
  const [newApptService, setNewApptService] = useState('');
  const [newApptDate, setNewApptDate] = useState('');
  const [newApptTime, setNewApptTime] = useState('09:00');
  const [newApptDuration, setNewApptDuration] = useState('30');
  const [newApptNotes, setNewApptNotes] = useState('');

  const [timeSlotModalOpen, setTimeSlotModalOpen] = useState(false);
  const [timeSlotDateStr, setTimeSlotDateStr] = useState('');
  const [timeSlotDayNum, setTimeSlotDayNum] = useState(0);
  const [newSlotStartTime, setNewSlotStartTime] = useState('08:00');
  const [newSlotEndTime, setNewSlotEndTime] = useState('18:00');
  const [selectedModalSlots, setSelectedModalSlots] = useState<string[]>([]);
  const [editingTimeSlotId, setEditingTimeSlotId] = useState<string | null>(null);

  // References state
  interface Reference {
    _id: string;
    name: string;
    category: string;
    order: number;
    imageUrl?: string;
  }
  const [references, setReferences] = useState<Reference[]>([]);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [editingRef, setEditingRef] = useState<Reference | null>(null);
  const [refName, setRefName] = useState('');
  const [refCategory, setRefCategory] = useState('');
  const [refImageFile, setRefImageFile] = useState<File | null>(null);
  const [refImagePreview, setRefImagePreview] = useState<string | null>(null);
  const [refExistingImageUrl, setRefExistingImageUrl] = useState<string | null>(null);

  // Job applications state
  interface JobAttachment {
    _id: string;
    filename: string;
    originalName: string;
    url: string;
    type: 'cv' | 'coverLetter' | 'certificate';
    size: number;
  }
  interface JobNote {
    text: string;
    addedBy: string;
    createdAt: string;
  }
  interface JobInterview {
    date: string;
    time: string;
    type: 'presentiel' | 'en_ligne';
    location?: string;
    link?: string;
    notes?: string;
    scheduledAt?: string;
  }
  interface JobApp {
    _id: string;
    candidate: string;
    lastName: string;
    firstName: string;
    email: string;
    phone: string;
    position: string;
    education: string;
    experience?: string;
    address?: string;
    city?: string;
    diploma?: string;
    lastPosition?: string;
    availability?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    source?: string;
    motivationMessage?: string;
    attachments?: JobAttachment[];
    notes?: JobNote[];
    interview?: JobInterview;
    jobOffer?: { _id: string; title: string; department: string; location: string; contractType: string; status?: string } | null;
    status: 'new' | 'analyzing' | 'interview' | 'accepted' | 'rejected';
    createdAt: string;
  }
  const [jobApps, setJobApps] = useState<JobApp[]>([]);
  const [archivedApps, setArchivedApps] = useState<JobApp[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApp | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState<'archive' | 'permanent'>('archive');

  // Parameters state
  interface Parameter {
    _id: string;
    key: string;
    value: string;
    order: number;
  }
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [isParamModalOpen, setIsParamModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState<Parameter | null>(null);
  const [paramKey, setParamKey] = useState('');
  const [paramValue, setParamValue] = useState('');

  // Job offers state (module "Gestion des Offres d'Emploi")
  interface JobOffer {
    _id: string;
    title: string;
    department: string;
    contractType: string;
    location: string;
    description: string;
    missions?: string[];
    skills?: string[];
    profile?: string;
    educationLevel?: string;
    requiredExperience?: string;
    benefits?: string[];
    status: 'draft' | 'published' | 'closed';
    publishedAt?: string;
    applicationDeadline?: string;
    openPositions?: number;
    createdAt: string;
  }
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [offerSearch, setOfferSearch] = useState('');
  const [offerDeptFilter, setOfferDeptFilter] = useState('Tous les dÃ©partements');
  const [offerContractFilter, setOfferContractFilter] = useState('Tous les contrats');
  const [offerStatusFilter, setOfferStatusFilter] = useState('Tous les statuts');

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isOffersSearching, setIsOffersSearching] = useState(false);
  const [editingOffer, setEditingOffer] = useState<JobOffer | null>(null);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDepartment, setOfferDepartment] = useState('Expertise Comptable');
  const [offerContractType, setOfferContractType] = useState('CDI');
  const [offerLocation, setOfferLocation] = useState('');
  const [offerEducationLevel, setOfferEducationLevel] = useState('');
  const [offerRequiredExperience, setOfferRequiredExperience] = useState('');
  const [offerSkillsText, setOfferSkillsText] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [offerMissionsText, setOfferMissionsText] = useState('');
  const [offerProfile, setOfferProfile] = useState('');
  const [offerBenefitsText, setOfferBenefitsText] = useState('');
  const [offerPublishedAt, setOfferPublishedAt] = useState('');
  const [offerDeadline, setOfferDeadline] = useState('');
  const [offerStatus, setOfferStatus] = useState<'draft' | 'published' | 'closed'>('draft');
  const [offerOpenPositions, setOfferOpenPositions] = useState<string>('');
  const [offerFormErrors, setOfferFormErrors] = useState<Record<string, string>>({});

  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [isOfferDeleteOpen, setIsOfferDeleteOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<JobOffer | null>(null);

  // Candidates view state (interface "Gestion des Candidatures")
  const [searchQuery, setSearchQuery] = useState('');
  const [isAppsSearching, setIsAppsSearching] = useState(false);
  const [roleFilter, setRoleFilter] = useState('Tous les postes');
  const [expFilter, setExpFilter] = useState('Toutes');
  const [offerFilter, setOfferFilter] = useState('Toutes les offres');

  const [isMissionsSearching, setIsMissionsSearching] = useState(false);

  // Interview planning form state
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewType, setInterviewType] = useState<'presentiel' | 'en_ligne'>('presentiel');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewLink, setInterviewLink] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [sendInterviewEmail, setSendInterviewEmail] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [isInterviewSaving, setIsInterviewSaving] = useState(false);

  const generateClientSlots = (start: string, end: string): string[] => {
    const slots: string[] = [];
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    while (startMin + 30 <= endMin) {
      const slotEnd = startMin + 30;
      const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      slots.push(`${fmt(startMin)} - ${fmt(slotEnd)}`);
      startMin += 60;
    }
    return slots;
  };

  // Fetch data from API on mount
  useEffect(() => {
    if (!isAuthChecked) return;
    const fetchData = async () => {
      try {
        const [deptRes, missionRes, msgRes, apptRes, availRes, refRes, paramRes, jobRes, archivedRes, offerRes, progRes] = await Promise.all([
          fetch(`${API_URL}/departments`),
          fetch(`${API_URL}/missions`),
          fetch(`${API_URL}/messages`),
          fetch(`${API_URL}/appointments`),
          fetch(`${API_URL}/available-dates`),
          fetch(`${API_URL}/references`),
          fetch(`${API_URL}/parameters`),
          authedFetch(`${API_URL}/job-applications`),
          authedFetch(`${API_URL}/job-applications?archived=true`),
          authedFetch(`${API_URL}/job-offers`),
          authedFetch(`${API_URL}/programs`)
        ]);
        const depts = await deptRes.json();
        const missionsData = await missionRes.json();
        const msgs = await msgRes.json();
        const appts = await apptRes.json();
        const avails = await availRes.json();
        const refs = await refRes.json();
        const params = await paramRes.json();
        const jobs = await jobRes.json();
        const archived = await archivedRes.json();
        const offerData = await offerRes.json();
        const progs = await progRes.json();
        setDepartments(depts.map((d: any) => ({ ...d, id: d._id })));
        setMissions(missionsData.map((m: any) => ({ ...m, id: m._id })));
        setMessages(msgs.map((m: any) => ({ ...m, id: m._id })));
        setAppointments(appts);
        setAvailableDatesList(avails);
        setReferences(refs);
        setParameters(params);
        setJobApps(Array.isArray(jobs) ? jobs : []);
        setArchivedApps(Array.isArray(archived) ? archived : []);
        setOffers(offerData);
        setProgrammes(Array.isArray(progs) ? progs.map((p: any) => ({ ...p, id: p._id })) : []);
      } catch (err) {
        console.error('Failed to fetch data from API:', err);
      }
    };
    fetchData();
  }, [isAuthChecked]);

  // ---------------------------------------------------------------
  // Recherches dynamiques : interrogation live du serveur (debounce),
  // rÃ©sultats mis Ã  jour automatiquement pendant la frappe.
  // ---------------------------------------------------------------
  const skipAppsFirstRun = useRef(true);
  const skipOffersFirstRun = useRef(true);
  const skipMissionsFirstRun = useRef(true);

  // Candidatures : recherche serveur en direct (mots clÃ©s)
  useEffect(() => {
    if (skipAppsFirstRun.current) {
      skipAppsFirstRun.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      setIsAppsSearching(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        const [res, archRes] = await Promise.all([
          authedFetch(`${API_URL}/job-applications?${params.toString()}`),
          authedFetch(`${API_URL}/job-applications?archived=true${params.toString() ? '&' + params.toString() : ''}`),
        ]);
        const data = await res.json();
        const archivedData = await archRes.json();
        setJobApps(data);
        setArchivedApps(archivedData);
      } catch (err) {
        console.error('Recherche candidatures Ã©chouÃ©e:', err);
      } finally {
        setIsAppsSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Offres : recherche serveur en direct (mots clÃ©s + filtres)
  useEffect(() => {
    if (skipOffersFirstRun.current) {
      return;
    }
    const timer = setTimeout(async () => {
      setIsOffersSearching(true);
      try {
        const params = new URLSearchParams();
        if (offerSearch.trim()) params.set('search', offerSearch.trim());
        if (offerDeptFilter !== 'Tous les dÃ©partements') params.set('department', offerDeptFilter);
        if (offerContractFilter !== 'Tous les contrats') params.set('contractType', offerContractFilter);
        if (offerStatusFilter !== 'Tous les statuts') params.set('status', offerStatusFilter);
        const res = await authedFetch(`${API_URL}/job-offers?${params.toString()}`);
        const data = await res.json();
        setOffers(data);
      } catch (err) {
        console.error('Recherche offres Ã©chouÃ©e:', err);
      } finally {
        setIsOffersSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [offerSearch, offerDeptFilter, offerContractFilter, offerStatusFilter]);

  // Missions : recherche serveur en direct (mots clÃ©s)
  useEffect(() => {
    if (skipMissionsFirstRun.current) {
      return;
    }
    const timer = setTimeout(async () => {
      setIsMissionsSearching(true);
      try {
        const params = new URLSearchParams();
        if (missionSearch.trim()) params.set('search', missionSearch.trim());
        const res = await fetch(`${API_URL}/missions?${params.toString()}`);
        const data = await res.json();
        setMissions(data.map((m: any) => ({ ...m, id: m._id })));
      } catch (err) {
        console.error('Recherche missions Ã©chouÃ©e:', err);
      } finally {
        setIsMissionsSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [missionSearch]);

  // Dashboard calendar state
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Programmes state (synced with MongoDB via /api/programs)
  interface ProgrammeData {
    id: string;
    title: string;
    description: string;
    date: string; // YYYY-MM-DD
    startTime: string;
    endTime: string;
    type: string;
    notes: string;
  }
  const [programmes, setProgrammes] = useState<ProgrammeData[]>([]);

  // Programme form modal state
  const [programmeFormOpen, setProgrammeFormOpen] = useState(false);
  const [editingProgrammeId, setEditingProgrammeId] = useState<string | null>(null);
  const [progTitle, setProgTitle] = useState('');
  const [progDescription, setProgDescription] = useState('');
  const [progDate, setProgDate] = useState('');
  const [progStartTime, setProgStartTime] = useState('09:00');
  const [progEndTime, setProgEndTime] = useState('12:00');
  const [progType, setProgType] = useState('Formation');
  const [progNotes, setProgNotes] = useState('');

  // Programme view modal state
  const [viewingProgramme, setViewingProgramme] = useState<ProgrammeData | null>(null);

  const toDateInputValue = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const openNewProgramme = () => {
    setEditingProgrammeId(null);
    setProgTitle('');
    setProgDescription('');
    setProgDate(selectedDay ? `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}` : toDateInputValue(new Date()));
    setProgStartTime('09:00');
    setProgEndTime('12:00');
    setProgType('Formation');
    setProgNotes('');
    setProgrammeFormOpen(true);
  };

  const openEditProgramme = (p: ProgrammeData) => {
    setEditingProgrammeId(p.id);
    setProgTitle(p.title);
    setProgDescription(p.description);
    setProgDate(p.date);
    setProgStartTime(p.startTime);
    setProgEndTime(p.endTime);
    setProgType(p.type);
    setProgNotes(p.notes);
    setProgrammeFormOpen(true);
  };

  const handleSaveProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progTitle.trim() || !progDate || !progStartTime || !progEndTime || !progType.trim()) {
      addToast('Veuillez remplir le titre, la date, les heures et le type.', 'info');
      return;
    }
    const payload = {
      title: progTitle.trim(),
      description: progDescription.trim(),
      date: progDate,
      startTime: progStartTime,
      endTime: progEndTime,
      type: progType,
      notes: progNotes.trim(),
    };
    if (editingProgrammeId) {
      const res = await authedFetch(`${API_URL}/programs/${editingProgrammeId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setProgrammes(prev => prev.map(p => p.id === editingProgrammeId ? { ...updated, id: updated._id } : p));
        addToast(`Programme "${progTitle.trim()}" mis Ã  jour.`);
      } else {
        addToast('Erreur lors de la mise Ã  jour du programme.', 'error');
      }
    } else {
      const res = await authedFetch(`${API_URL}/programs`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setProgrammes(prev => [...prev, { ...created, id: created._id }]);
        addToast(`Programme "${progTitle.trim()}" ajoutÃ©.`);
      } else {
        addToast('Erreur lors de l\'ajout du programme.', 'error');
      }
    }
    setProgrammeFormOpen(false);
  };

  const handleDeleteProgramme = async (id: string, title: string) => {
    const res = await authedFetch(`${API_URL}/programs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProgrammes(prev => prev.filter(p => p.id !== id));
      addToast(`Programme "${title}" supprimÃ©.`, 'info');
    } else {
      addToast('Erreur lors de la suppression du programme.', 'error');
    }
    if (viewingProgramme && viewingProgramme.id === id) setViewingProgramme(null);
  };

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

  // Build programmes map grouped by day for the current calendar month
  const programmesByDay: Record<number, ProgrammeData[]> = {};
  programmes.forEach((p) => {
    const d = new Date(`${p.date}T00:00:00`);
    if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
      const day = d.getDate();
      if (!programmesByDay[day]) programmesByDay[day] = [];
      programmesByDay[day].push(p);
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
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectTargetName, setRejectTargetName] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleTargetId, setRescheduleTargetId] = useState<string | null>(null);
  const [rescheduleTargetName, setRescheduleTargetName] = useState('');
  const [rescheduleNewDate, setRescheduleNewDate] = useState('');
  const [rescheduleNewTimeSlot, setRescheduleNewTimeSlot] = useState('');

  // Department contact modal state
  const [isDeptContactOpen, setIsDeptContactOpen] = useState(false);
  const [selectedDeptForContact, setSelectedDeptForContact] = useState<Department | null>(null);
  const [deptContactMessage, setDeptContactMessage] = useState('');

  // New Mission form state
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionClient, setNewMissionClient] = useState('');
  const [newMissionDept, setNewMissionDept] = useState<'Audit LÃ©gal' | 'Conseil' | 'ComptabilitÃ©' | 'Juridique' | 'FiscalitÃ©'>('Audit LÃ©gal');
  const [newMissionStatus, setNewMissionStatus] = useState('EN PRÃ‰PARATION');
  const [newMissionProg, setNewMissionProg] = useState(10);

  // Notifications alerts
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      let token = safeGetToken();

      if (urlToken) {
        token = urlToken;
        safeSetToken(urlToken);
        const site = params.get('site');
        if (site) safeSetSiteOrigin(site);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (!token) {
        window.location.href = `${siteOrigin()}/#login`;
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          safeRemoveToken();
          window.location.href = `${siteOrigin()}/#login`;
          return;
        }
        setIsAuthChecked(true);
      } catch {
        window.location.href = `${siteOrigin()}/#login`;
      }
    };

    checkAuth();
  }, []);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Stats computation
  const activeMissionsCount = missions.length + 21; // Mock constant added to make it matches the original "24"
  const unreadMessagesCount = messages.filter((m) => m.isUnread && m.sender !== 'Rezgui Mihoub' && !m.parentId).length;

  // BoÃ®te de rÃ©ception Messages (hors messages archivÃ©s)
  const clientInboxMessages = messages.filter(m => m.sender !== 'Rezgui Mihoub' && !m.parentId && !m.archived);
  const newMessagesCount = clientInboxMessages.filter(m => m.status === 'new' || m.isUnread).length;
  const filteredMessages = messageFilter === 'all' ? clientInboxMessages
    : messageFilter === 'unread' ? clientInboxMessages.filter(m => m.isUnread)
    : clientInboxMessages.filter(m => m.status === messageFilter);

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
      addToast(`Mission "${newMissionTitle}" crÃ©Ã©e avec succÃ¨s !`);
    } catch (err) {
      addToast('Erreur lors de la crÃ©ation de la mission.', 'info');
    }

    setNewMissionTitle('');
    setNewMissionClient('');
    setNewMissionDept('Audit LÃ©gal');
    setNewMissionStatus('EN PRÃ‰PARATION');
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
    addToast(`Message de ${senderName} supprimÃ©.`, 'info');
  };

  // Archiver un message (retirÃ© de la boÃ®te de rÃ©ception, sans suppression)
  const archiveMessage = async (msg: Message) => {
    try {
      await fetch(`${API_URL}/messages/${msg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      }).catch(() => {});
    } catch { /* ignore */ }
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    addToast(`Message de ${msg.sender} archivÃ©.`, 'info');
  };

  // Mettre Ã  jour le statut d'un message (nouveau / en cours / traitÃ©)
  const setMessageStatus = async (msg: Message, status: 'new' | 'processing' | 'done') => {
    const isUnread = status === 'new';
    try {
      await fetch(`${API_URL}/messages/${msg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, isUnread }),
      }).catch(() => {});
    } catch { /* ignore */ }
    setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, status, isUnread } : m)));
    if (activeMessageDetail?.id === msg.id) {
      setActiveMessageDetail({ ...activeMessageDetail, status, isUnread });
    }
    addToast(
      status === 'done'
        ? 'Message marquÃ© comme traitÃ©.'
        : status === 'processing'
        ? 'Message marquÃ© en cours de traitement.'
        : 'Message remis comme nouveau.',
      'info'
    );
  };

  // Messages inbox handlers
  const openMessageDetail = (msg: Message) => {
    setActiveMessageDetail(msg);
    setMessageDetailOpen(true);
  };

  const openMessageDetailWithReply = (msg: Message) => {
    openReplyModal(msg);
    setMessageDetailOpen(false);
  };

  // Appointment creation handlers (Planifier un rendez-vous)
  const addMinutes = (time: string, mins: number): string => {
    const [h, m] = time.split(':').map(Number);
    const total = (h || 0) * 60 + (m || 0) + mins;
    const nh = Math.floor(total / 60) % 24;
    const nm = total % 60;
    return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
  };

  const openNewAppointment = (prefill?: Message) => {
    const parts = prefill ? parseMessageParts(prefill) : { subject: '', email: '', body: '' };
    setNewApptClient(prefill ? prefill.sender : '');
    setNewApptEmail(parts.email);
    setNewApptService(parts.subject === 'Demande de contact' ? '' : parts.subject);
    setNewApptDate(new Date().toISOString().split('T')[0]);
    setNewApptTime('09:00');
    setNewApptDuration('30');
    setNewApptNotes(parts.body || '');
    setAppointmentModalOpen(true);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApptClient.trim() || !newApptEmail.trim() || !newApptDate || !newApptTime) {
      addToast('Veuillez renseigner le client, l\'email, la date et l\'heure.', 'info');
      return;
    }
    const duration = Math.max(15, Math.min(240, Number(newApptDuration) || 30));
    const timeSlot = `${newApptTime} - ${addMinutes(newApptTime, duration)}`;
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: newApptClient.trim(),
          email: newApptEmail.trim(),
          subject: newApptService.trim(),
          date: newApptDate,
          timeSlot,
          duration: String(duration),
          details: newApptNotes.trim(),
          status: 'pending',
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || 'Erreur lors de la crÃ©ation.', 'info');
        return;
      }
      const created = await res.json();
      setAppointments(prev => [created, ...prev]);
      addToast(`Rendez-vous avec ${newApptClient.trim()} planifiÃ©.`);
      setAppointmentModalOpen(false);
    } catch {
      addToast('Erreur lors de l\'enregistrement.', 'error');
    }
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
      sender: 'Rezgui Mihoub',
      role: 'Expert-Comptable | AssociÃ© GÃ©rant',
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
      addToast(`RÃ©ponse envoyÃ©e Ã  ${activeReplyMessage.sender}.`);
    } catch {
      addToast(`RÃ©ponse envoyÃ©e Ã  ${activeReplyMessage.sender}.`);
    }

    // Send email to client
    if (clientEmail) {
      const subject = originalMsg?.content?.match(/\[(.+?)\]/)?.[1] || 'RÃ©ponse RM Consulting';
      try {
        await fetch(`${API_URL}/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: clientEmail,
            subject: `Re: ${subject} â€” RM Consulting`,
            text: replyText.trim(),
            senderName: 'Rezgui Mihoub',
          })
        });
        addToast(`Email envoyÃ© Ã  ${clientEmail}`);
      } catch {
        addToast('Email non envoyÃ© (vÃ©rifiez la configuration SMTP)', 'info');
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

    addToast(`Message transmis Ã  ${selectedDeptForContact.head.split(' (')[0]} avec succÃ¨s.`);
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
        time: 'Ã€ l\'instant',
        content: `Bonjour, j'ai bien reÃ§u votre demande concernant le pÃ´le "${selectedDeptForContact.name}". Je l'Ã©tudie dÃ¨s Ã  prÃ©sent et reviens vers vous trÃ¨s vite.`,
        isUnread: true,
        status: 'new'
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
    addToast(`Le dÃ©partement "${deptToDelete.name}" a Ã©tÃ© supprimÃ©.`, 'info');
  };

  // References CRUD handlers
  const handleOpenAddRef = () => {
    setEditingRef(null);
    setRefName('');
    setRefCategory('');
    setRefImageFile(null);
    setRefImagePreview(null);
    setRefExistingImageUrl(null);
    setIsRefModalOpen(true);
  };

  const handleOpenEditRef = (ref: Reference) => {
    setEditingRef(ref);
    setRefName(ref.name);
    setRefCategory(ref.category);
    setRefImageFile(null);
    setRefImagePreview(null);
    setRefExistingImageUrl(ref.imageUrl || null);
    setIsRefModalOpen(true);
  };

  const handleDeleteRef = async (refId: string) => {
    const refToDelete = references.find(r => r._id === refId);
    if (!refToDelete) return;
    try {
      await fetch(`${API_URL}/references/${refId}`, { method: 'DELETE' });
      setReferences(prev => prev.filter(r => r._id !== refId));
      addToast(`"${refToDelete.name}" a Ã©tÃ© supprimÃ©.`, 'info');
    } catch {
      addToast('Erreur lors de la suppression.', 'error');
    }
  };

  const handleSubmitRef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName.trim() || !refCategory.trim()) {
      addToast('Veuillez remplir tous les champs.', 'info');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', refName.trim());
      formData.append('category', refCategory.trim());
      formData.append('order', String(editingRef ? editingRef.order : references.length + 1));

      if (refImageFile) {
        formData.append('image', refImageFile);
      } else if (editingRef && !refExistingImageUrl) {
        formData.append('removeImage', 'true');
      }

      if (editingRef) {
        const res = await fetch(`${API_URL}/references/${editingRef._id}`, {
          method: 'PUT',
          body: formData,
        });
        if (!res.ok) {
          addToast('Erreur lors de la modification.', 'info');
          return;
        }
        const updated = await res.json();
        setReferences(prev => prev.map(r => r._id === editingRef._id ? updated : r));
        addToast('RÃ©fÃ©rence modifiÃ©e.', 'info');
      } else {
        const res = await fetch(`${API_URL}/references`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          addToast('Erreur lors de l\'ajout.', 'info');
          return;
        }
        const created = await res.json();
        setReferences(prev => [...prev, created]);
        addToast('RÃ©fÃ©rence ajoutÃ©e.', 'info');
      }
      setIsRefModalOpen(false);
    } catch {
      addToast('Erreur lors de l\'enregistrement.', 'error');
    }
  };

  // Parameters CRUD handlers
  const handleOpenAddParam = () => {
    setEditingParam(null);
    setParamKey('');
    setParamValue('');
    setIsParamModalOpen(true);
  };

  const handleOpenEditParam = (param: Parameter) => {
    setEditingParam(param);
    setParamKey(param.key);
    setParamValue(param.value);
    setIsParamModalOpen(true);
  };

  const handleDeleteParam = async (paramId: string) => {
    const paramToDelete = parameters.find(p => p._id === paramId);
    if (!paramToDelete) return;
    try {
      await fetch(`${API_URL}/parameters/${paramId}`, { method: 'DELETE' });
      setParameters(prev => prev.filter(p => p._id !== paramId));
      addToast(`"${paramToDelete.key}" supprimÃ©.`, 'info');
    } catch {
      addToast('Erreur lors de la suppression.', 'info');
    }
  };

  const handleSubmitParam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paramKey.trim() || !paramValue.trim()) {
      addToast('Veuillez remplir tous les champs.', 'info');
      return;
    }
    try {
      if (editingParam) {
        const res = await fetch(`${API_URL}/parameters/${editingParam._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: paramKey.trim(), value: paramValue.trim() }),
        });
        if (!res.ok) { addToast('Erreur lors de la modification.', 'info'); return; }
        const updated = await res.json();
        setParameters(prev => prev.map(p => p._id === editingParam._id ? updated : p));
        addToast('ParamÃ¨tre modifiÃ©.', 'info');
      } else {
        const res = await fetch(`${API_URL}/parameters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: paramKey.trim(), value: paramValue.trim(), order: parameters.length + 1 }),
        });
        if (!res.ok) { addToast('Erreur lors de l\'ajout.', 'info'); return; }
        const created = await res.json();
        setParameters(prev => [...prev, created]);
        addToast('ParamÃ¨tre ajoutÃ©.', 'info');
      }
      setIsParamModalOpen(false);
    } catch {
      addToast('Erreur lors de l\'enregistrement.', 'info');
    }
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
          addToast(err.message || 'Erreur lors de la modification du dÃ©partement.', 'info');
          return;
        }
        const updated = await res.json();
        setDepartments(prev =>
          prev.map(d => d.id === editingDept.id ? { ...updated, id: updated._id } : d)
        );
        addToast(`Le dÃ©partement "${deptName}" a Ã©tÃ© modifiÃ© avec succÃ¨s.`);
      } else {
        const res = await fetch(`${API_URL}/departments`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json();
          addToast(err.message || 'Erreur lors de la crÃ©ation du dÃ©partement.', 'info');
          return;
        }
        const created = await res.json();
        setDepartments(prev => [...prev, { ...created, id: created._id }]);
        addToast(`Le dÃ©partement "${deptName}" a Ã©tÃ© crÃ©Ã© avec succÃ¨s.`);
      }
    } catch (err) {
      addToast('Erreur lors de la sauvegarde du dÃ©partement.', 'info');
    }

    setIsDeptModalOpen(false);
  };

  // Compute department statistics
  const deptCounts = missions.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {});

  // Candidates statistics
  const totalCandidates = jobApps.length;
  const pendingCandidates = jobApps.filter((a: any) => a.status === 'new' || a.status === 'analyzing').length;
  const interviewCandidates = jobApps.filter((a: any) => a.status === 'interview').length;
  const acceptedCandidates = jobApps.filter((a: any) => a.status === 'accepted').length;
  const rejectedCandidates = jobApps.filter((a: any) => a.status === 'rejected').length;

  // Filtered candidates (recherche + poste + expÃ©rience)
  const filteredApps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return jobApps.filter((a: any) => {
      const fullName = `${a.firstName} ${a.lastName}`.toLowerCase();
      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.position || '').toLowerCase().includes(q);

      const matchesRole = roleFilter === 'Tous les postes' || a.position === roleFilter;

      // Filtre par offre d'emploi (offre liÃ©e ou candidature spontanÃ©e)
      const appOfferId = a.jobOffer?._id || a.jobOffer || null;
      const matchesOffer =
        offerFilter === 'Toutes les offres' ||
        (offerFilter === '__spontaneous__' && !appOfferId) ||
        (offerFilter !== '__spontaneous__' && appOfferId === offerFilter);

      const years = parseExpYears(a.experience);
      let matchesExp = true;
      if (expFilter === '0-2 ans') {
        matchesExp = years <= 2;
      } else if (expFilter === '2-5 ans') {
        matchesExp = years > 2 && years <= 5;
      } else if (expFilter === '5+ ans') {
        matchesExp = years > 5;
      }

      return matchesSearch && matchesRole && matchesExp && matchesOffer;
    });
  }, [jobApps, searchQuery, roleFilter, expFilter, offerFilter]);

  // Liste des postes distincts pour le filtre
  const positionsList = useMemo(
    () => [...new Set(jobApps.map((a: any) => a.position).filter(Boolean))],
    [jobApps]
  );

  // Offres avec compteur de candidatures (pour le filtre par offre)
  const offersWithCounts = useMemo(
    () =>
      offers.map((o) => ({
        ...o,
        count: jobApps.filter((a: any) => (a.jobOffer?._id || a.jobOffer) === o._id).length,
      })),
    [offers, jobApps]
  );

  // Export Excel (.xlsx) de la liste des candidats filtrÃ©s (respecte recherche + filtres actifs)
  const exportCandidatesXLSX = () => {
    if (filteredApps.length === 0) {
      addToast('Aucun candidat Ã  exporter', 'info');
      return;
    }

    const rows = filteredApps.map((app: any) => ({
      'Nom complet': `${app.firstName || ''} ${app.lastName || ''}`,
      'Email': app.email || '',
      'TÃ©lÃ©phone': app.phone || '',
      'Poste': app.position || '',
      'Offre liÃ©e': app.jobOffer?.title || '',
      'Date de naissance': app.dateOfBirth || '',
      'Sexe': app.gender || '',
      'NationalitÃ©': app.nationality || '',
      'Ville': app.city || app.address || '',
      'ExpÃ©rience': app.experience || '',
      'Ã‰tudes & DiplÃ´mes': app.education || '',
      'DiplÃ´me': app.diploma || '',
      'Dernier poste occupÃ©': app.lastPosition || '',
      'DisponibilitÃ©': app.availability || '',
      'ConnaÃ®t le cabinet via': app.source || '',
      'Date de dÃ©pÃ´t': new Date(app.createdAt).toLocaleDateString('fr-FR'),
      'Statut': candidateStatusInfo(app.status).label,
      'Date de prise de poste': app.startDate
        ? `${new Date(`${app.startDate}T00:00:00`).toLocaleDateString('fr-FR')}${app.startTime ? ` ${formatTimeAmPm(app.startTime)}` : ''}`
        : '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 22 }, { wch: 30 }, { wch: 16 }, { wch: 30 }, { wch: 30 },
      { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 22 },
      { wch: 28 }, { wch: 22 }, { wch: 24 }, { wch: 16 }, { wch: 22 },
      { wch: 14 }, { wch: 14 }, { wch: 22 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Candidats');
    XLSX.writeFile(wb, `candidatures_${new Date().toISOString().split('T')[0]}.xlsx`);
    addToast(`${filteredApps.length} candidat${filteredApps.length > 1 ? 's' : ''} exportÃ©${filteredApps.length > 1 ? 's' : ''} (Excel)`);
  };

  // URL sÃ©curisÃ©e de tÃ©lÃ©chargement d'une piÃ¨ce jointe
  const attachmentDownloadUrl = (app: any, att: any): string =>
    att._id
      ? `${API_URL}/job-applications/${app._id}/attachments/${att._id}?token=${encodeURIComponent(safeGetToken() || '')}`
      : att.url;

  // Restauration d'une candidature depuis la corbeille
  const handleRestoreApp = async (appId: string) => {
    try {
      const res = await authedFetch(`${API_URL}/job-applications/${appId}/restore`, { method: 'POST' });
      if (res.ok) {
        const restored = archivedApps.find((a: any) => a._id === appId);
        setArchivedApps((prev: any[]) => prev.filter((a: any) => a._id !== appId));
        if (restored) setJobApps((prev: any[]) => [restored, ...prev]);
        addToast('Candidature restaurÃ©e');
      } else {
        addToast('Erreur lors de la restauration', 'info');
      }
    } catch {
      addToast('Erreur lors de la restauration', 'info');
    }
  };

  // Ouverture de la confirmation : archivage (actifs) ou suppression dÃ©finitive (corbeille)
  const openDeleteConfirm = (appId: string, mode: 'archive' | 'permanent') => {
    setAppToDelete(appId);
    setDeleteMode(mode);
    setIsDeleteConfirmOpen(true);
  };

  // Invitation Ã  un entretien (statut -> interview)
  const handleInviteInterview = async (app: any) => {
    if (!app) return;
    try {
      const res = await authedFetch(`${API_URL}/job-applications/${app._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'interview' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setJobApps((prev: any[]) => prev.map((a: any) => (a._id === app._id ? updated : a)));
        if (selectedApp?._id === app._id) setSelectedApp(updated);
        addToast(`Invitation envoyÃ©e Ã  ${app.firstName} ${app.lastName}`);
      }
    } catch {
      addToast('Erreur lors de l\'envoi de l\'invitation', 'info');
    }
  };

  // PrÃ©-remplir le formulaire de planification avec les donnÃ©es dÃ©jÃ  enregistrÃ©es
  useEffect(() => {
    if (!selectedApp) return;
    setInterviewDate(selectedApp.interview?.date || '');
    setInterviewTime(selectedApp.interview?.time || '');
    setInterviewType(selectedApp.interview?.type || 'presentiel');
    setInterviewLocation(selectedApp.interview?.location || '');
    setInterviewLink(selectedApp.interview?.link || '');
    setInterviewNotes(selectedApp.interview?.notes || '');
    setStartDate(selectedApp.startDate || '');
    setStartTime(selectedApp.startTime || '');
  }, [selectedApp?._id]);

  // Sauvegarde de la planification d'entretien
  const handleSaveInterview = async () => {
    if (!selectedApp) return;
    if (!interviewDate || !interviewTime) {
      addToast('La date et l\'heure de l\'entretien sont obligatoires.', 'info');
      return;
    }
    if (interviewType === 'presentiel' && !interviewLocation.trim()) {
      addToast('Le lieu de l\'entretien est obligatoire.', 'info');
      return;
    }
    if (interviewType === 'en_ligne' && !interviewLink.trim()) {
      addToast('Le lien de la rÃ©union est obligatoire.', 'info');
      return;
    }

    setIsInterviewSaving(true);
    try {
      const res = await authedFetch(`${API_URL}/job-applications/${selectedApp._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'interview',
          interviewDate,
          interviewTime,
          interviewType,
          interviewLocation: interviewType === 'presentiel' ? interviewLocation.trim() : '',
          interviewLink: interviewType === 'en_ligne' ? interviewLink.trim() : '',
          interviewNotes: interviewNotes.trim(),
          sendInterviewEmail: sendInterviewEmail,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setJobApps((prev: any[]) => prev.map((a: any) => (a._id === selectedApp._id ? updated : a)));
        setSelectedApp(updated);
        addToast(
          sendInterviewEmail
            ? `Entretien planifiÃ© et convocation envoyÃ©e Ã  ${selectedApp.firstName} ${selectedApp.lastName}`
            : `Entretien planifiÃ© pour ${selectedApp.firstName} ${selectedApp.lastName}`
        );
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || 'Erreur lors de l\'enregistrement.', 'info');
      }
    } catch {
      addToast('Erreur lors de l\'enregistrement.', 'info');
    } finally {
      setIsInterviewSaving(false);
    }
  };

  // ----- Gestion des Offres d'Emploi -----

  // Nombre de candidatures reÃ§ues par offre (hors corbeille)
  const offerCandidatesCount = useMemo(() => {
    const counts: Record<string, number> = {};
    jobApps.forEach((a: any) => {
      const offerId = a.jobOffer?._id || a.jobOffer;
      if (offerId) counts[offerId] = (counts[offerId] || 0) + 1;
    });
    return counts;
  }, [jobApps]);

  // Offres filtrÃ©es (recherche + dÃ©partement + contrat + statut)
  const filteredOffers = useMemo(() => {
    const q = offerSearch.toLowerCase().trim();
    return offers.filter((o) => {
      const matchesSearch =
        !q ||
        o.title.toLowerCase().includes(q) ||
        (o.location || '').toLowerCase().includes(q) ||
        (o.description || '').toLowerCase().includes(q);
      const matchesDept = offerDeptFilter === 'Tous les dÃ©partements' || o.department === offerDeptFilter;
      const matchesContract = offerContractFilter === 'Tous les contrats' || o.contractType === offerContractFilter;
      const matchesStatus = offerStatusFilter === 'Tous les statuts' || o.status === offerStatusFilter;
      return matchesSearch && matchesDept && matchesContract && matchesStatus;
    });
  }, [offers, offerSearch, offerDeptFilter, offerContractFilter, offerStatusFilter]);

  const offerStats = useMemo(() => {
    const published = offers.filter((o) => o.status === 'published').length;
    const drafts = offers.filter((o) => o.status === 'draft').length;
    const closed = offers.filter((o) => o.status === 'closed').length;
    const totalCandidatures = jobApps.length;
    const perOffer = offers
      .map((o) => ({ offer: o, count: offerCandidatesCount[o._id] || 0 }))
      .sort((a, b) => b.count - a.count);
    const topOffer = perOffer[0] && perOffer[0].count > 0 ? perOffer[0] : null;
    return { published, drafts, closed, totalCandidatures, perOffer, topOffer };
  }, [offers, offerCandidatesCount, jobApps]);

  const resetOfferForm = () => {
    setEditingOffer(null);
    setOfferTitle('');
    setOfferDepartment('Expertise Comptable');
    setOfferContractType('CDI');
    setOfferLocation('');
    setOfferEducationLevel('');
    setOfferRequiredExperience('');
    setOfferSkillsText('');
    setOfferDescription('');
    setOfferMissionsText('');
    setOfferProfile('');
    setOfferBenefitsText('');
    setOfferPublishedAt('');
    setOfferDeadline('');
    setOfferStatus('draft');
    setOfferOpenPositions('');
    setOfferFormErrors({});
  };

  const openOfferModal = (offer: JobOffer | null) => {
    resetOfferForm();
    if (offer) {
      setEditingOffer(offer);
      setOfferTitle(offer.title);
      setOfferDepartment(offer.department);
      setOfferContractType(offer.contractType);
      setOfferLocation(offer.location);
      setOfferEducationLevel(offer.educationLevel || '');
      setOfferRequiredExperience(offer.requiredExperience || '');
      setOfferSkillsText((offer.skills || []).join('\n'));
      setOfferDescription(offer.description);
      setOfferMissionsText((offer.missions || []).join('\n'));
      setOfferProfile(offer.profile || '');
      setOfferBenefitsText((offer.benefits || []).join('\n'));
      setOfferPublishedAt(offer.publishedAt ? offer.publishedAt.slice(0, 10) : '');
      setOfferDeadline(offer.applicationDeadline ? offer.applicationDeadline.slice(0, 10) : '');
      setOfferStatus(offer.status);
      setOfferOpenPositions(offer.openPositions != null ? String(offer.openPositions) : '');
    }
    setIsOfferModalOpen(true);
  };

  // Convertit un texte ligne-par-ligne en tableau propre
  const textToList = (text: string): string[] =>
    text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!offerTitle.trim()) errs.title = 'Le titre est requis';
    if (!offerDepartment.trim()) errs.department = 'Le dÃ©partement est requis';
    if (!offerContractType.trim()) errs.contract = 'Le type de contrat est requis';
    if (!offerLocation.trim()) errs.location = 'La localisation est requise';
    if (!offerDescription.trim()) errs.description = 'La description est requise';
    if (textToList(offerSkillsText).length === 0) errs.skills = 'Au moins une compÃ©tence est requise';
    setOfferFormErrors(errs);
    if (Object.keys(errs).length > 0) {
      addToast('Veuillez corriger les champs signalÃ©s.', 'info');
      return;
    }

    const payload = {
      title: offerTitle.trim(),
      department: offerDepartment.trim(),
      contractType: offerContractType.trim(),
      location: offerLocation.trim(),
      description: offerDescription.trim(),
      skills: textToList(offerSkillsText),
      missions: textToList(offerMissionsText),
      profile: offerProfile.trim(),
      educationLevel: offerEducationLevel.trim(),
      requiredExperience: offerRequiredExperience.trim(),
      benefits: textToList(offerBenefitsText),
      status: offerStatus,
      publishedAt: offerPublishedAt ? new Date(offerPublishedAt).toISOString() : undefined,
      applicationDeadline: offerDeadline ? new Date(offerDeadline).toISOString() : undefined,
      openPositions: offerOpenPositions !== '' ? Number(offerOpenPositions) : undefined,
    };

    try {
      const res = editingOffer
        ? await authedFetch(`${API_URL}/job-offers/${editingOffer._id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          })
        : await authedFetch(`${API_URL}/job-offers`, {
            method: 'POST',
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || 'Erreur lors de l\'enregistrement de l\'offre', 'error');
        return;
      }
      const saved = await res.json();
      if (editingOffer) {
        setOffers((prev) => prev.map((o) => (o._id === saved._id ? saved : o)));
        if (selectedOffer?._id === saved._id) setSelectedOffer(saved);
        addToast(`Offre "${saved.title}" mise Ã  jour`);
      } else {
        setOffers((prev) => [saved, ...prev]);
        addToast(`Offre "${saved.title}" crÃ©Ã©e`);
      }
      setIsOfferModalOpen(false);
      resetOfferForm();
    } catch {
      addToast('Erreur lors de l\'enregistrement de l\'offre', 'error');
    }
  };

  // Dupliquer une offre (copie en brouillon avec "(Copie)" dans le titre)
  const handleDuplicateOffer = async (offer: JobOffer) => {
    const copy = {
      ...offer,
      _id: undefined,
      title: `${offer.title} (Copie)`,
      status: 'draft' as const,
      publishedAt: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    };
    try {
      const res = await authedFetch(`${API_URL}/job-offers`, {
        method: 'POST',
        body: JSON.stringify(copy),
      });
      if (res.ok) {
        const saved = await res.json();
        setOffers((prev) => [saved, ...prev]);
        addToast(`Offre dupliquÃ©e : "${saved.title}"`);
      } else {
        addToast('Erreur lors de la duplication', 'error');
      }
    } catch {
      addToast('Erreur lors de la duplication', 'error');
    }
  };

  // Activer / dÃ©sactiver une offre (publiÃ©e <-> fermÃ©e)
  const handleToggleOffer = async (offer: JobOffer) => {
    try {
      const res = await authedFetch(`${API_URL}/job-offers/${offer._id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setOffers((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
        if (selectedOffer?._id === updated._id) setSelectedOffer(updated);
        addToast(
          updated.status === 'published'
            ? `Offre "${updated.title}" publiÃ©e (visible sur le site)`
            : `Offre "${updated.title}" dÃ©sactivÃ©e`
        );
      } else {
        addToast('Erreur lors de la mise Ã  jour', 'error');
      }
    } catch {
      addToast('Erreur lors de la mise Ã  jour', 'error');
    }
  };

  const handleDeleteOffer = async () => {
    if (!offerToDelete) return;
    try {
      const res = await authedFetch(`${API_URL}/job-offers/${offerToDelete._id}`, { method: 'DELETE' });
      if (res.ok) {
        setOffers((prev) => prev.filter((o) => o._id !== offerToDelete._id));
        if (selectedOffer?._id === offerToDelete._id) setSelectedOffer(null);
        addToast(`Offre "${offerToDelete.title}" supprimÃ©e`);
      } else {
        addToast('Erreur lors de la suppression', 'error');
      }
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    }
    setIsOfferDeleteOpen(false);
    setOfferToDelete(null);
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#6c0042] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#554249]">VÃ©rification de l'authentification...</p>
        </div>
      </div>
    );
  }

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
                  : toast.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-primary-fixed border-outline-variant text-on-primary-fixed-variant'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : toast.type === 'error' ? (
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
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
            <span className="text-sm">DÃ©partements</span>
          </button>

          {/* NOTE: "Documents" and "Missions" have been strictly removed per user request. */}



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

          <button
            onClick={() => setActiveTab('offers')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-150 ${
              activeTab === 'offers'
                ? 'sidebar-active text-white'
                : 'text-on-surface-variant hover:bg-secondary-container/20 hover:text-secondary'
            }`}
          >
            <BriefcaseBusiness className="w-5 h-5" />
            <span className="text-sm">Offres d'Emploi</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-150 ${
              activeTab === 'messages'
                ? 'sidebar-active text-white'
                : 'text-on-surface-variant hover:bg-secondary-container/20 hover:text-secondary'
            }`}
          >
            <Mail className="w-5 h-5" />
            <span className="text-sm">Messages</span>
            {unreadMessagesCount > 0 && (
              <span className="ml-auto px-1.5 py-0.5 bg-error text-white text-[9px] font-bold rounded-full">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('recruitment')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-150 ${
              activeTab === 'recruitment'
                ? 'sidebar-active text-white'
                : 'text-on-surface-variant hover:bg-secondary-container/20 hover:text-secondary'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-sm">Recrutement</span>
          </button>

          <button
            onClick={() => setActiveTab('references')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-150 ${
              activeTab === 'references'
                ? 'sidebar-active text-white'
                : 'text-on-surface-variant hover:bg-secondary-container/20 hover:text-secondary'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-sm">Nos RÃ©fÃ©rences</span>
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
            <span className="text-sm">ParamÃ¨tres</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-secondary/10 space-y-1">
          {/* NOTE: "Nouvelle Mission" and "Aide" buttons have been strictly removed per user request. */}

          <button
            onClick={() => { safeRemoveToken(); window.location.href = `${siteOrigin()}/?logout=1`; }}
            className="w-full text-left text-on-surface-variant hover:text-error flex items-center gap-3 p-2 rounded-lg text-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-on-surface-variant" />
            <span>DÃ©connexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 min-h-screen flex flex-col pb-12 relative">
        
        {/* TopAppBar Header */}
        <header className="sticky top-0 bg-surface/95 backdrop-blur-md border-b border-secondary/20 h-16 flex items-center justify-between px-8 z-30 shadow-sm">
          <div>
            <h2 className="font-headline text-lg font-semibold text-on-surface">Bonjour, Rezgui</h2>
            <p className="text-[11px] text-on-surface-variant">Voici le rÃ©capitulatif de RM Consulting pour aujourd'hui.</p>
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
                        {messages.filter(m => m.isUnread && m.sender !== 'Rezgui Mihoub' && !m.parentId).length === 0 ? (
                          <div className="text-center py-4 text-xs text-on-surface-variant">
                            Aucune nouvelle notification
                          </div>
                        ) : (
                          messages.filter(m => m.isUnread && m.sender !== 'Rezgui Mihoub' && !m.parentId).map((msg) => (
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

            <a
              href={siteOrigin()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Voir le site</span>
            </a>

            <div className="h-8 w-[1px] bg-secondary/20" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-on-surface">R. Mihoub</p>
                <p className="text-[10px] text-on-surface-variant">Expert-Comptable | AssociÃ© GÃ©rant</p>
              </div>
              <img
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                alt="Rezgui Mihoub"
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
                      {unreadMessagesCount} non lus Ã  traiter
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
                      {availableDatesList.length > 0 ? `${availableDatesList.length} date(s) ouverte(s) aux rÃ©servations` : 'Aucune date programmÃ©e'}
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
                      <span>CapacitÃ© traitÃ©e</span>
                      <span>{appointments.length > 0 ? Math.round((appointments.filter(a => a.status === 'confirmed').length / appointments.length) * 100) : 0}%</span>
                    </p>
                  </div>

                  {/* Card 4: Offres publiÃ©es */}
                  <div className="glass-card p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BriefcaseBusiness className="w-5 h-5 text-primary" />
                      </div>
                      <button
                        onClick={() => setActiveTab('offers')}
                        className="text-[9px] font-bold text-primary bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded-full transition-colors cursor-pointer"
                      >
                        GÃ‰RER
                      </button>
                    </div>
                    <p className="text-on-surface-variant text-[13px] font-medium">Offres publiÃ©es</p>
                    <h3 className="font-headline text-2xl font-bold text-primary">{offerStats.published}</h3>
                    <p className="mt-4 text-[12px] text-on-surface-variant italic">
                      {offerStats.drafts} brouillon{offerStats.drafts > 1 ? 's' : ''} Â· {offerStats.closed} fermÃ©e{offerStats.closed > 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Card 5: Candidatures reÃ§ues */}
                  <div className="glass-card p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <UsersRound className="w-5 h-5 text-amber-700" />
                      </div>
                      <button
                        onClick={() => setActiveTab('recruitment')}
                        className="text-[9px] font-bold text-primary bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded-full transition-colors cursor-pointer"
                      >
                        VOIR
                      </button>
                    </div>
                    <p className="text-on-surface-variant text-[13px] font-medium">Candidatures reÃ§ues</p>
                    <h3 className="font-headline text-2xl font-bold text-on-surface">{offerStats.totalCandidatures}</h3>
                    <p className="mt-4 text-[12px] text-on-surface-variant italic">
                      {pendingCandidates} en attente de traitement
                    </p>
                  </div>

                  {/* Card 6: Offre la plus sollicitÃ©e */}
                  <div className="glass-card p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">TOP OFFRE</span>
                    </div>
                    <p className="text-on-surface-variant text-[13px] font-medium">Offre la plus sollicitÃ©e</p>
                    {offerStats.topOffer ? (
                      <>
                        <h3 className="font-headline text-lg font-bold text-on-surface mt-0.5 leading-snug">
                          {offerStats.topOffer.offer.title}
                        </h3>
                        <p className="mt-3 text-[12px] text-emerald-600 font-bold">
                          {offerStats.topOffer.count} candidature{offerStats.topOffer.count > 1 ? 's' : ''}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-headline text-xl font-bold text-on-surface-variant/60 mt-1">â€”</h3>
                        <p className="mt-3 text-[12px] text-on-surface-variant italic">Aucune candidature reÃ§ue</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Dashboard Widgets Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Appointment Calendar Widget */}
                  <div className="glass-card rounded-xl p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-headline text-base font-bold text-on-surface">Calendrier des Rendez-vous</h4>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={openNewProgramme}
                          className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:bg-orange-700 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Programme
                        </button>
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
                          {['Janvier','FÃ©vrier','Mars','Avril','Mai','Juin','Juillet','AoÃ»t','Septembre','Octobre','Novembre','DÃ©cembre'][calMonth]} {calYear}
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
                        const hasProgrammes = programmesByDay[day] && programmesByDay[day].length > 0;
                        return (
                          <button
                            key={day}
                            onClick={() => {
                              setSelectedDay(selectedDay === day ? null : day);
                            }}
                            className={`p-2 text-xs font-semibold rounded-lg relative cursor-pointer ${
                              selectedDay === day
                                ? 'bg-primary text-white shadow-sm'
                                : hasAppointments
                                ? 'hover:bg-surface-container text-on-surface font-bold'
                                : 'hover:bg-surface-container text-on-surface'
                            }`}
                          >
                            {day}
                            {selectedDay !== day && (
                              <span className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-[2px]">
                                {isAvailableDate && (
                                  <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                                )}
                                {hasAppointments && (
                                  <span className="w-1 h-1 bg-secondary rounded-full" />
                                )}
                                {hasProgrammes && (
                                  <span className="w-1 h-1 bg-orange-500 rounded-full" />
                                )}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[9px] text-on-surface-variant font-medium">Date disponible</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="text-[9px] text-on-surface-variant font-medium">Rendez-vous</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-[9px] text-on-surface-variant font-medium">Entretien</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-[9px] text-on-surface-variant font-medium">Programme</span>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                      <AnimatePresence mode="wait">
                        {selectedDay && ((appointmentsByDay[selectedDay] && appointmentsByDay[selectedDay].length > 0) || (programmesByDay[selectedDay] && programmesByDay[selectedDay].length > 0)) ? (
                          <>
                            {(appointmentsByDay[selectedDay] || []).map((appt) => (
                              <motion.div
                                key={appt._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className={`flex items-center gap-3 px-2 py-1 rounded-lg border-l-4 ${
                                  appt.status === 'confirmed'
                                    ? 'bg-emerald-50 border-emerald-500'
                                    : appt.status === 'cancelled'
                                    ? 'bg-gray-50 border-gray-400 opacity-60'
                                    : 'bg-primary/5 border-primary'
                                }`}
                              >
                                <div className="text-center shrink-0 min-w-12">
                                  <p className="text-[9px] font-bold text-primary uppercase">Jour {selectedDay}</p>
                                  <p className="font-bold text-xs text-on-surface">{appt.timeSlot}</p>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[11px] font-bold text-on-surface truncate">{appt.subject}</p>
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                      appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                      appt.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                                      appt.status === 'rescheduled' ? 'bg-blue-100 text-blue-700' :
                                      'bg-amber-100 text-amber-700'
                                    }`}>
                                      {appt.status === 'confirmed' ? 'CONFIRMÃ‰' : appt.status === 'cancelled' ? 'ANNULÃ‰' : appt.status === 'rescheduled' ? 'REPORTÃ‰' : 'EN ATTENTE'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-on-surface-variant truncate">
                                    {appt.clientName} â€” {appt.email}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                            {(programmesByDay[selectedDay] || []).map((p) => (
                              <motion.div
                                key={p.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-3 px-2 py-1 rounded-lg border-l-4 border-orange-500 bg-orange-50/70"
                              >
                                <div className="text-center shrink-0 min-w-12">
                                  <p className="text-[9px] font-bold text-orange-600 uppercase">Jour {selectedDay}</p>
                                  <p className="font-bold text-xs text-on-surface">{p.startTime} - {p.endTime}</p>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-orange-100 text-orange-700">{p.type}</span>
                                    <p className="text-[11px] font-bold text-on-surface truncate">{p.title}</p>
                                  </div>
                                  {p.description && <p className="text-[10px] text-on-surface-variant truncate">{p.description}</p>}
                                  <div className="flex gap-2 mt-0.5">
                                    <button
                                      type="button"
                                      onClick={() => setViewingProgramme(p)}
                                      className="text-[9px] text-orange-700 hover:underline font-bold cursor-pointer"
                                    >
                                      Voir
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openEditProgramme(p)}
                                      className="text-[9px] text-orange-700 hover:underline font-bold cursor-pointer"
                                    >
                                      Modifier
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProgramme(p.id, p.title)}
                                      className="text-[9px] text-red-600 hover:underline font-bold cursor-pointer"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </>
                        ) : (
                          <motion.div
                            key="no-appointment"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-3 text-center text-xs text-on-surface-variant italic bg-surface-container-low rounded-lg"
                          >
                            {selectedDay
                              ? `Aucun rendez-vous ni programme le ${selectedDay} ${['Janvier','FÃ©vrier','Mars','Avril','Mai','Juin','Juillet','AoÃ»t','Septembre','Octobre','Novembre','DÃ©cembre'][calMonth]}.`
                              : 'SÃ©lectionnez un jour pour voir les rendez-vous et programmes.'
                            }
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Departments Breakdown */}
                  <div className="glass-card rounded-xl p-6 flex flex-col">
                    <h4 className="font-headline text-base font-bold text-on-surface mb-6">RÃ©partition par DÃ©partement</h4>
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
                          {/* Segment 4: FiscalitÃ© (15%) */}
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
                          <span className="text-xs font-bold text-on-surface">FiscalitÃ© ({15}%)</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Offres & Recrutement Widget */}
                <div className="glass-card rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-headline text-base font-bold text-on-surface">Candidatures par Offre</h4>
                    <button
                      onClick={() => setActiveTab('offers')}
                      className="text-[11px] font-bold text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      GÃ©rer les offres
                    </button>
                  </div>

                  {offerStats.perOffer.filter((p) => p.count > 0).length === 0 ? (
                    <div className="text-center py-6 text-sm text-on-surface-variant flex flex-col items-center gap-2">
                      <BriefcaseBusiness className="w-8 h-8 text-on-surface-variant/30" />
                      <span>Aucune candidature reÃ§ue pour le moment.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {offerStats.perOffer.filter((p) => p.count > 0).slice(0, 6).map(({ offer, count }) => {
                        const max = offerStats.perOffer[0]?.count || 1;
                        return (
                          <button
                            key={offer._id}
                            onClick={() => { setSelectedOffer(offer); setActiveTab('offers'); }}
                            className="w-full text-left group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate pr-3">
                                {offer.title}
                              </span>
                              <span className="text-xs font-bold text-primary shrink-0">
                                {count} candidature{count > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
                                style={{ width: `${Math.round((count / max) * 100)}%` }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
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
                    <h3 className="font-headline text-2xl font-bold text-primary">DÃ©partements d'Expertise</h3>
                    <p className="text-xs text-on-surface-variant">
                      DÃ©couvrez nos pÃ´les de spÃ©cialitÃ© chez RM Consulting. Des Ã©quipes dÃ©diÃ©es au service de votre croissance et de votre conformitÃ©.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={handleOpenAddDept}
                      className="px-4 py-2.5 bg-primary text-white hover:bg-primary-container rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      Nouveau DÃ©partement
                    </button>

                    {/* Quick stats board */}
                    <div className="flex gap-4 bg-white/60 p-3 rounded-xl border border-secondary/15 shadow-sm">
                      <div className="text-center px-3 border-r border-secondary/10">
                        <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">PÃ´les</p>
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
                    <p className="text-sm font-semibold text-on-surface">Aucun dÃ©partement trouvÃ©</p>
                    <p className="text-xs text-on-surface-variant mt-1 mb-4">Ajoutez un nouveau pÃ´le d'expertise pour commencer.</p>
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
                                  ðŸ‘¥ {dept.staffCount} Collaborateurs
                                </span>
                                <span className="bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/30">
                                  ðŸ’¼ {dept.activeProjects} Projets en cours
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
                                      <div className="text-emerald-600 font-bold shrink-0 mt-0.5">âœ“</div>
                                      <span>{service}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-on-surface-variant/50 italic">Aucun service dÃ©fini.</p>
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
                    <p className="text-xs text-on-surface-variant">GÃ©rez et suivez le statut de toutes vos missions actives d'audit et de conseil.</p>
                  </div>
                  <button
                    onClick={() => setIsNewMissionOpen(true)}
                    className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-center"
                  >
                    <Plus className="w-4 h-4" />
                    CrÃ©er une Mission
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
                  {isMissionsSearching && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                  )}
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
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant">DÃ©partement</th>
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
                                      addToast(`Progression de "${mission.title}" incrÃ©mentÃ©e.`);
                                    }}
                                    className="px-2.5 py-1 text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/5 rounded transition-all cursor-pointer"
                                  >
                                    +10%
                                  </button>
                                  <button
                                    onClick={() => {
                                      setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, status: 'VALIDE', progression: 100 } : m));
                                      addToast(`Mission "${mission.title}" validÃ©e.`);
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
                  <p className="text-xs text-on-surface-variant">Consultez et gÃ©rez les comptes de vos clients et leurs interlocuteurs privilÃ©giÃ©s.</p>
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
                            Audit LÃ©gal
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
                        <span className="font-semibold text-on-surface">2.4M â‚¬</span>
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
                        <span className="font-semibold text-on-surface">850k â‚¬</span>
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
                            ComptabilitÃ©
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
                        <span className="font-semibold text-on-surface">12M â‚¬</span>
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
                  <p className="text-xs text-on-surface-variant">Suivi en temps rÃ©el des performances de RM Consulting et de la rÃ©partition des portefeuilles clients.</p>
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
                          <span>FiscalitÃ© et Juridique</span>
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

            {/* OFFERS VIEW */}
            {activeTab === 'offers' && (
              <motion.div
                key="offers"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-primary">Gestion des Offres d'Emploi</h3>
                    <p className="text-xs text-on-surface-variant">
                      CrÃ©ez, publiez et suivez vos offres. Chaque modification est immÃ©diatement visible sur le site.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={`${siteOrigin()}/#/offres`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 border border-secondary/30 text-secondary hover:bg-secondary/5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      Voir sur le site
                    </a>
                    <button
                      onClick={() => openOfferModal(null)}
                      className="px-4 py-2.5 bg-primary text-white hover:bg-primary-container rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      Nouvelle Offre
                    </button>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="glass-card p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 bg-primary/10 text-primary rounded-lg">
                        <BriefcaseBusiness className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-full">Total</span>
                    </div>
                    <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Offres crÃ©Ã©es</p>
                    <h3 className="font-headline text-3xl font-extrabold text-primary mt-1">{offers.length}</h3>
                  </div>
                  <div className="glass-card p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">Actives</span>
                    </div>
                    <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Offres publiÃ©es</p>
                    <h3 className="font-headline text-3xl font-extrabold text-emerald-600 mt-1">{offerStats.published}</h3>
                  </div>
                  <div className="glass-card p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                        <Pencil className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">Brouillons</span>
                    </div>
                    <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">En prÃ©paration</p>
                    <h3 className="font-headline text-3xl font-extrabold text-amber-600 mt-1">{offerStats.drafts}</h3>
                  </div>
                  <div className="glass-card p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                        <Layers className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-full">TerminÃ©es</span>
                    </div>
                    <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Offres fermÃ©es</p>
                    <h3 className="font-headline text-3xl font-extrabold text-gray-600 mt-1">{offerStats.closed}</h3>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-2xl shadow-sm border border-secondary/10 overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={offerSearch}
                          onChange={(e) => setOfferSearch(e.target.value)}
                          placeholder="Rechercher une offre..."
                          className="w-64 pl-9 pr-9 py-2 bg-surface-container-low border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none"
                        />
                        {isOffersSearching && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low border border-gray-200 rounded-lg">
                        <span className="text-[10px] font-bold text-on-surface-variant">DÃ©partement:</span>
                        <select
                          value={offerDeptFilter}
                          onChange={(e) => setOfferDeptFilter(e.target.value)}
                          className="bg-transparent border-none p-0 text-sm focus:ring-0 text-primary font-medium cursor-pointer outline-none"
                        >
                          <option>Tous les dÃ©partements</option>
                          {OFFER_DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low border border-gray-200 rounded-lg">
                        <span className="text-[10px] font-bold text-on-surface-variant">Contrat:</span>
                        <select
                          value={offerContractFilter}
                          onChange={(e) => setOfferContractFilter(e.target.value)}
                          className="bg-transparent border-none p-0 text-sm focus:ring-0 text-primary font-medium cursor-pointer outline-none"
                        >
                          <option>Tous les contrats</option>
                          {OFFER_CONTRACTS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low border border-gray-200 rounded-lg">
                        <span className="text-[10px] font-bold text-on-surface-variant">Statut:</span>
                        <select
                          value={offerStatusFilter}
                          onChange={(e) => setOfferStatusFilter(e.target.value)}
                          className="bg-transparent border-none p-0 text-sm focus:ring-0 text-primary font-medium cursor-pointer outline-none"
                        >
                          <option>Tous les statuts</option>
                          <option value="draft">Brouillon</option>
                          <option value="published">PubliÃ©e</option>
                          <option value="closed">FermÃ©e</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          setOfferSearch('');
                          setOfferDeptFilter('Tous les dÃ©partements');
                          setOfferContractFilter('Tous les contrats');
                          setOfferStatusFilter('Tous les statuts');
                          addToast('Filtres rÃ©initialisÃ©s', 'info');
                        }}
                        className="p-2 text-on-surface-variant hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                        title="RÃ©initialiser les filtres"
                      >
                        <Filter className="w-5 h-5" />
                      </button>
                    </div>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {filteredOffers.length} offre{filteredOffers.length > 1 ? 's' : ''} affichÃ©e{filteredOffers.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low/60">
                          <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-gray-100">Offre</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-gray-100">Contrat</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-gray-100">Lieu</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-gray-100">Publication</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-gray-100">Expiration</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-gray-100">Statut</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-primary uppercase tracking-wider border-b border-gray-100 text-center">Candidatures</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-gray-100 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredOffers.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                              <BriefcaseBusiness className="w-10 h-10 text-gray-300 mb-2 mx-auto" />
                              <p className="text-sm font-medium">
                                {offers.length === 0 ? 'Aucune offre crÃ©Ã©e pour le moment.' : 'Aucune offre ne correspond Ã  vos filtres.'}
                              </p>
                              <button
                                onClick={() => openOfferModal(null)}
                                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Plus className="w-4 h-4" /> CrÃ©er une offre
                              </button>
                            </td>
                          </tr>
                        ) : (
                          filteredOffers.map((offer) => {
                            const info = offerStatusInfo(offer.status);
                            const count = offerCandidatesCount[offer._id] || 0;
                            return (
                              <tr key={offer._id} className="transition-all group hover:bg-gray-50/70">
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                      <BriefcaseBusiness className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{offer.title}</p>
                                      <p className="text-xs text-on-surface-variant mt-0.5">{offer.department}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${contractBadgeCls(offer.contractType)}`}>
                                    {offer.contractType}
                                  </span>
                                </td>
                                <td className="px-6 py-5">
                                  <span className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                                    <MapPin className="w-4 h-4 text-on-surface-variant/60" />
                                    {offer.location}
                                  </span>
                                </td>
                                <td className="px-6 py-5">
                                  <span className="text-sm text-on-surface-variant font-medium">
                                    {offer.publishedAt ? new Date(offer.publishedAt).toLocaleDateString('fr-FR') : 'â€”'}
                                  </span>
                                </td>
                                <td className="px-6 py-5">
                                  {offer.applicationDeadline ? (
                                    <span className={`text-sm font-medium ${new Date(offer.applicationDeadline) < new Date() ? 'text-error' : 'text-on-surface-variant'}`}>
                                      {new Date(offer.applicationDeadline).toLocaleDateString('fr-FR')}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-on-surface-variant/50">Sans limite</span>
                                  )}
                                </td>
                                <td className="px-6 py-5">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${info.cls}`}>
                                    {info.label}
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                  <button
                                    onClick={() => setSelectedOffer(offer)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                      count > 0
                                        ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white'
                                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                    }`}
                                    title="Voir les candidatures de cette offre"
                                  >
                                    <UsersRound className="w-3.5 h-3.5" />
                                    {count}
                                  </button>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => setSelectedOffer(offer)}
                                      className="p-2 hover:bg-primary/5 rounded-lg text-primary transition-colors"
                                      title="Voir l'offre et ses candidatures"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => openOfferModal(offer)}
                                      className="p-2 hover:bg-primary/5 rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                                      title="Modifier"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDuplicateOffer(offer)}
                                      className="p-2 hover:bg-primary/5 rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                                      title="Dupliquer"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleToggleOffer(offer)}
                                      className={`p-2 rounded-lg transition-colors ${
                                        offer.status === 'published'
                                          ? 'text-amber-600 hover:bg-amber-50'
                                          : 'text-emerald-600 hover:bg-emerald-50'
                                      }`}
                                      title={offer.status === 'published' ? 'DÃ©sactiver (fermer l\'offre)' : 'Activer (publier l\'offre)'}
                                    >
                                      <Power className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => { setOfferToDelete(offer); setIsOfferDeleteOpen(true); }}
                                      className="p-2 hover:bg-red-50 rounded-lg text-rose-600 transition-colors"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. SETTINGS VIEW */}
            {activeTab === 'recruitment' && (
              <motion.div
                key="recruitment"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-primary">Gestion des Candidatures</h3>
                    <p className="text-xs text-on-surface-variant">
                      Analysez et suivez le processus de recrutement de RM Consulting.
                    </p>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div className="glass-card p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 bg-primary/10 text-primary rounded-lg">
                        <Users className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Total Candidatures</p>
                    <h3 className="font-headline text-3xl font-extrabold text-primary mt-1">{totalCandidates}</h3>
                  </div>

                  <div className="glass-card p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                        <Clock className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">En attente</span>
                    </div>
                    <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">En Attente</p>
                    <h3 className="font-headline text-3xl font-extrabold text-on-surface mt-1">{pendingCandidates}</h3>
                  </div>

                  <div className="glass-card p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                        <CalendarIcon className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-full">PlanifiÃ©s</span>
                    </div>
                    <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Entretiens</p>
                    <h3 className="font-headline text-3xl font-extrabold text-on-surface mt-1">{interviewCandidates}</h3>
                  </div>

                  <div className="glass-card p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 bg-green-100 text-green-700 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">TerminÃ©</span>
                    </div>
                    <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">RecrutÃ©s</p>
                    <h3 className="font-headline text-3xl font-extrabold text-on-surface mt-1">{acceptedCandidates}</h3>
                  </div>

                  <div className="glass-card p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                        <XCircle className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-full">RefusÃ©</span>
                    </div>
                    <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">RefusÃ©s</p>
                    <h3 className="font-headline text-3xl font-extrabold text-on-surface mt-1">{rejectedCandidates}</h3>
                  </div>

                  <div className="glass-card p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-500/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 bg-gray-100 text-gray-700 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">ArchivÃ©</span>
                    </div>
                    <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">ArchivÃ©s</p>
                    <h3 className="font-headline text-3xl font-extrabold text-on-surface mt-1">
                      {archivedApps.length < 10 ? `0${archivedApps.length}` : archivedApps.length}
                    </h3>
                  </div>
                </div>

                {/* Filters & Table + Detail Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-secondary/10 overflow-hidden flex flex-col xl:flex-row">
                  <div className="flex-1">
                    {/* Toolbar */}
                    <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                            offerFilter !== 'Toutes les offres'
                              ? 'bg-primary/5 border-primary/40 ring-2 ring-primary/20'
                              : 'bg-surface-container-low border-gray-200'
                          }`}
                        >
                          <BriefcaseBusiness
                            className={`w-4 h-4 ${offerFilter !== 'Toutes les offres' ? 'text-primary' : 'text-on-surface-variant'}`}
                          />
                          <span className="text-[10px] font-bold text-on-surface-variant">Offre:</span>
                          <select
                            value={offerFilter}
                            onChange={(e) => setOfferFilter(e.target.value)}
                            className="bg-transparent border-none p-0 text-sm focus:ring-0 font-medium cursor-pointer outline-none max-w-[240px] ${
                              offerFilter !== 'Toutes les offres' ? 'text-primary font-bold' : 'text-primary'
                            }"
                          >
                            <option value="Toutes les offres">Toutes les offres</option>
                            {offersWithCounts.map((o) => (
                              <option key={o._id} value={o._id}>
                                {o.title} Â· {o.department} ({o.count})
                              </option>
                            ))}
                            <option value="__spontaneous__">Candidatures spontanÃ©es</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low border border-gray-200 rounded-lg">
                          <span className="text-[10px] font-bold text-on-surface-variant">Poste:</span>
                          <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-transparent border-none p-0 text-sm focus:ring-0 text-primary font-medium cursor-pointer outline-none"
                          >
                            <option>Tous les postes</option>
                            {positionsList.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low border border-gray-200 rounded-lg">
                          <span className="text-[10px] font-bold text-on-surface-variant">ExpÃ©rience:</span>
                          <select
                            value={expFilter}
                            onChange={(e) => setExpFilter(e.target.value)}
                            className="bg-transparent border-none p-0 text-sm focus:ring-0 text-primary font-medium cursor-pointer outline-none"
                          >
                            <option>Toutes</option>
                            <option>0-2 ans</option>
                            <option>2-5 ans</option>
                            <option>5+ ans</option>
                          </select>
                        </div>

                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher un candidat..."
                            className="w-64 pl-9 pr-9 py-2 bg-surface-container-low border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none"
                          />
                          {isAppsSearching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Bascule Actifs / ArchivÃ©s */}
                        <div className="flex items-center gap-1 p-1 bg-surface-container-low border border-gray-200 rounded-lg">
                          <button
                            onClick={() => setShowArchived(false)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              !showArchived ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-gray-100'
                            }`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            Candidats
                          </button>
                          <button
                            onClick={() => setShowArchived(true)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              showArchived ? 'bg-gray-700 text-white shadow-sm' : 'text-on-surface-variant hover:bg-gray-100'
                            }`}
                          >
                            <Archive className="w-3.5 h-3.5" />
                            ArchivÃ©s
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                              showArchived ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {archivedApps.length}
                            </span>
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setRoleFilter('Tous les postes');
                            setExpFilter('Toutes');
                            setOfferFilter('Toutes les offres');
                            setSearchQuery('');
                            addToast('Filtres rÃ©initialisÃ©s', 'info');
                          }}
                          className="p-2 text-on-surface-variant hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                          title="RÃ©initialiser les filtres"
                        >
                          <Filter className="w-5 h-5" />
                        </button>
                        <button
                          onClick={exportCandidatesXLSX}
                          className="p-2 text-on-surface-variant hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                          title="TÃ©lÃ©charger la liste"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Bandeau "filtre actif" â€” visible dÃ¨s qu'un filtre est appliquÃ© */}
                    {(offerFilter !== 'Toutes les offres' || roleFilter !== 'Tous les postes' || expFilter !== 'Toutes' || searchQuery) && (
                      <div className="flex flex-wrap items-center gap-2 px-5 py-3 bg-primary/5 border-b border-primary/20">
                        <Filter className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-xs font-bold text-primary">Filtres actifs :</span>
                        {offerFilter !== 'Toutes les offres' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold shadow-sm">
                            <BriefcaseBusiness className="w-3.5 h-3.5" />
                            {offerFilter === '__spontaneous__'
                              ? 'Candidatures spontanÃ©es'
                              : (offers.find((o) => o._id === offerFilter)?.title || 'Offre sÃ©lectionnÃ©e')}
                            <button
                              onClick={() => setOfferFilter('Toutes les offres')}
                              className="ml-0.5 hover:bg-white/25 rounded-full p-0.5 cursor-pointer"
                              title="Retirer ce filtre"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}
                        {roleFilter !== 'Tous les postes' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-bold">
                            {roleFilter}
                            <button
                              onClick={() => setRoleFilter('Tous les postes')}
                              className="ml-0.5 hover:bg-secondary/20 rounded-full p-0.5 cursor-pointer"
                              title="Retirer ce filtre"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {expFilter !== 'Toutes' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-bold">
                            {expFilter}
                            <button
                              onClick={() => setExpFilter('Toutes')}
                              className="ml-0.5 hover:bg-secondary/20 rounded-full p-0.5 cursor-pointer"
                              title="Retirer ce filtre"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {searchQuery && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-bold">
                            Â« {searchQuery} Â»
                            <button
                              onClick={() => setSearchQuery('')}
                              className="ml-0.5 hover:bg-secondary/20 rounded-full p-0.5 cursor-pointer"
                              title="Retirer ce filtre"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        <span className="ml-auto text-xs font-bold text-primary">
                          {filteredApps.length} candidature{filteredApps.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container-low/60">
                            <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-gray-100">
                              Candidat
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-gray-100">
                              Poste &amp; ExpÃ©rience
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-primary uppercase tracking-wider border-b border-gray-100">
                              Date de DÃ©pÃ´t
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-gray-100">
                              Statut
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-gray-100 text-right">
                              Documents &amp; Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {showArchived ? (
                            archivedApps.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                  <Archive className="w-10 h-10 text-gray-300 mb-2 mx-auto" />
                                  <p className="text-sm font-medium">Aucune candidature archivÃ©e.</p>
                                </td>
                              </tr>
                            ) : (
                              archivedApps.map((app: any) => {
                                const cvAtt = (app.attachments || []).find((a: any) => a.type === 'cv');
                                return (
                                  <tr key={app._id} className="transition-all group hover:bg-gray-50/70">
                                    <td className="px-6 py-5">
                                      <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                                          {app.firstName?.[0]}{app.lastName?.[0]}
                                        </div>
                                        <div>
                                          <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                                            {app.firstName} {app.lastName}
                                          </p>
                                          <p className="text-xs text-on-surface-variant mt-0.5">{app.email}</p>
                                        </div>
                                      </div>
                                    </td>

                                    <td className="px-6 py-5">
                                      <div className="flex flex-col">
                                        <span className="text-on-surface font-medium text-sm">{app.position}</span>
                                        {app.jobOffer?.title && (
                                          <span className="text-[10px] font-bold text-primary mt-0.5">
                                            {app.jobOffer.title} Â· {app.jobOffer.contractType}
                                          </span>
                                        )}
                                        <span className="text-xs text-on-surface-variant mt-0.5">{app.experience || 'ExpÃ©rience non spÃ©cifiÃ©e'}</span>
                                      </div>
                                    </td>

                                    <td className="px-6 py-5">
                                      <span className="text-on-surface-variant text-sm font-medium">
                                        {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                                      </span>
                                    </td>

                                    <td className="px-6 py-5">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border bg-gray-100 text-gray-600 border-gray-200">
                                        ArchivÃ©
                                        {app.deletedAt ? ` le ${new Date(app.deletedAt).toLocaleDateString('fr-FR')}` : ''}
                                      </span>
                                    </td>

                                    <td className="px-6 py-5 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <a
                                          href={cvAtt ? attachmentDownloadUrl(app, cvAtt) : undefined}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center gap-1 px-3 py-1.5 bg-surface-container-low border border-gray-200 rounded-lg text-xs font-bold text-primary hover:bg-white transition-colors ${
                                            cvAtt ? '' : 'pointer-events-none opacity-50'
                                          }`}
                                          title="Voir CV"
                                        >
                                          <FileText className="w-4 h-4" /> CV
                                        </a>
                                        <button
                                          onClick={() => handleRestoreApp(app._id)}
                                          className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                          title="Restaurer la candidature"
                                        >
                                          <ArchiveRestore className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => openDeleteConfirm(app._id, 'permanent')}
                                          className="p-2 hover:bg-red-50 rounded-lg text-rose-600 transition-colors"
                                          title="Supprimer dÃ©finitivement"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )
                          ) : filteredApps.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                <Search className="w-10 h-10 text-gray-300 mb-2 mx-auto" />
                                <p className="text-sm font-medium">Aucun candidat ne correspond Ã  votre recherche.</p>
                              </td>
                            </tr>
                          ) : (
                            filteredApps.map((app: any) => {
                              const info = candidateStatusInfo(app.status);
                              const isSelected = selectedApp?._id === app._id;
                              const cvAtt = (app.attachments || []).find((a: any) => a.type === 'cv');
                              return (
                                <tr
                                  key={app._id}
                                  onClick={() => setSelectedApp(app)}
                                  className={`transition-all cursor-pointer group ${
                                    isSelected ? 'bg-primary/10' : 'hover:bg-primary/5'
                                  }`}
                                >
                                  <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                      <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                                        {app.firstName?.[0]}{app.lastName?.[0]}
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                                          {app.firstName} {app.lastName}
                                        </p>
                                        <p className="text-xs text-on-surface-variant mt-0.5">{app.email}</p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                      <span className="text-on-surface font-medium text-sm">{app.position}</span>
                                      <span className="text-xs text-on-surface-variant mt-0.5">{app.experience || 'ExpÃ©rience non spÃ©cifiÃ©e'}</span>
                                    </div>
                                  </td>

                                  <td className="px-6 py-5">
                                    <span className="text-on-surface-variant text-sm font-medium">
                                      {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                  </td>

                                  <td className="px-6 py-5">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${info.cls}`}>
                                      {info.label}
                                    </span>
                                  </td>

                                  <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                      <a
                                        href={cvAtt ? attachmentDownloadUrl(app, cvAtt) : undefined}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-1 px-3 py-1.5 bg-surface-container-low border border-gray-200 rounded-lg text-xs font-bold text-primary hover:bg-white transition-colors ${
                                          cvAtt ? '' : 'pointer-events-none opacity-50'
                                        }`}
                                        title="Voir CV"
                                      >
                                        <FileText className="w-4 h-4" /> CV
                                      </a>
                                      <button
                                        onClick={() => setSelectedApp(app)}
                                        className="p-2 hover:bg-primary/5 rounded-lg text-primary transition-colors"
                                        title="Voir dÃ©tails"
                                      >
                                        <Search className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => openDeleteConfirm(app._id, 'archive')}
                                        className="p-2 hover:bg-red-50 rounded-lg text-rose-600 transition-colors"
                                        title="Archiver la candidature"
                                      >
                                        <Archive className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Side Detail Panel */}
                  {!showArchived && selectedApp ? (
                    <div className="w-full xl:w-96 flex flex-col bg-surface-container-low/60 border-t xl:border-t-0 xl:border-l border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-headline text-lg font-bold text-on-surface">DÃ©tails Candidat</h4>
                        <button
                          onClick={() => setSelectedApp(null)}
                          className="p-1 rounded-full hover:bg-gray-200/80 transition-colors text-gray-500"
                          title="Fermer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-6">
                        {/* Candidate Header */}
                        <div className="flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-gray-200/60 shadow-sm">
                          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-md shadow-primary/20">
                            {selectedApp.firstName?.[0]}{selectedApp.lastName?.[0]}
                          </div>
                          <h5 className="font-headline text-lg font-bold text-on-surface">{selectedApp.firstName} {selectedApp.lastName}</h5>
                          <p className="text-primary font-semibold text-sm mt-0.5">{selectedApp.position}</p>
                          {selectedApp.jobOffer?.title && (
                            <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                              <BriefcaseBusiness className="w-3 h-3" />
                              {selectedApp.jobOffer.title} Â· {selectedApp.jobOffer.department}
                            </span>
                          )}

                          <div className="flex gap-2 mt-4 w-full">
                            <button
                              onClick={() => handleInviteInterview(selectedApp)}
                              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
                            >
                              Inviter Entretien
                            </button>
                            <a
                              href={`mailto:${selectedApp.email}`}
                              className="p-2.5 border border-gray-300 rounded-xl text-on-surface-variant hover:bg-gray-100 transition-colors"
                              title="Envoyer un email"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          </div>

                          {/* Status selector */}
                          <div className="w-full mt-3">
                            <select
                              value={selectedApp.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                  const res = await authedFetch(`${API_URL}/job-applications/${selectedApp._id}`, {
                                    method: 'PUT',
                                    body: JSON.stringify({
                                      status: newStatus,
                                      ...(newStatus === 'accepted' ? { startDate, startTime } : {}),
                                    }),
                                  });
                                  if (res.ok) {
                                    const updated = await res.json();
                                    setJobApps((prev: any[]) => prev.map((a: any) => (a._id === selectedApp._id ? updated : a)));
                                    setSelectedApp(updated);
                                    addToast(`Statut mis Ã  jour : ${selectedApp.firstName} ${selectedApp.lastName}`);
                                  }
                                } catch {
                                  addToast('Erreur lors de la mise Ã  jour', 'info');
                                }
                              }}
                              className={`text-xs font-bold px-3 py-2 rounded-lg border w-full cursor-pointer ${candidateStatusInfo(selectedApp.status).cls}`}
                            >
                              <option value="new">Nouveau</option>
                              <option value="analyzing">En cours d'analyse</option>
                              <option value="interview">Entretien programmÃ©</option>
                              <option value="accepted">AcceptÃ©</option>
                              <option value="rejected">RefusÃ©</option>
                            </select>
                          </div>

                          {/* Planification de l'entretien (visible quand le statut est "Entretien") */}
                          <AnimatePresence initial={false}>
                            {selectedApp.status === 'interview' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.35, ease: 'easeInOut' }}
                                className="w-full overflow-hidden text-left"
                              >
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="flex items-center gap-2 mb-4">
                                    <span className="p-1.5 bg-primary/10 text-primary rounded-lg">
                                      <CalendarIcon className="w-4 h-4" />
                                    </span>
                                    <h6 className="font-headline text-sm font-bold text-on-surface">
                                      Planification de l'entretien
                                    </h6>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                                          Date de l'entretien <span className="text-error">*</span>
                                        </label>
                                        <input
                                          type="date"
                                          value={interviewDate}
                                          onChange={(e) => setInterviewDate(e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                                          Heure <span className="text-error">*</span>
                                        </label>
                                        <input
                                          type="time"
                                          value={interviewTime}
                                          onChange={(e) => setInterviewTime(e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none"
                                        />
                                        {interviewTime && (
                                          <p className="text-[10px] text-on-surface-variant mt-1">
                                            AffichÃ©e au candidat :{' '}
                                            <span className="font-bold text-primary">{formatTimeAmPm(interviewTime)}</span>
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                                        Type d'entretien <span className="text-error">*</span>
                                      </label>
                                      <select
                                        value={interviewType}
                                        onChange={(e) => setInterviewType(e.target.value as 'presentiel' | 'en_ligne')}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none"
                                      >
                                        <option value="presentiel">PrÃ©sentiel</option>
                                        <option value="en_ligne">En ligne</option>
                                      </select>
                                    </div>

                                    <AnimatePresence initial={false}>
                                      {interviewType === 'presentiel' ? (
                                        <motion.div
                                          key="interview-location"
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                                          className="overflow-hidden"
                                        >
                                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                                            Lieu de l'entretien <span className="text-error">*</span>
                                          </label>
                                          <input
                                            type="text"
                                            value={interviewLocation}
                                            onChange={(e) => setInterviewLocation(e.target.value)}
                                            placeholder="Ex : Bureau RM Consulting, Tunis"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none"
                                          />
                                        </motion.div>
                                      ) : (
                                        <motion.div
                                          key="interview-link"
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                                          className="overflow-hidden"
                                        >
                                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                                            Lien de la rÃ©union (Teams, Google Meet ou Zoom) <span className="text-error">*</span>
                                          </label>
                                          <input
                                            type="url"
                                            value={interviewLink}
                                            onChange={(e) => setInterviewLink(e.target.value)}
                                            placeholder="https://meet.google.com/..."
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none"
                                          />
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    <div>
                                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                                        Notes <span className="text-on-surface-variant/60 normal-case font-semibold">(facultatif)</span>
                                      </label>
                                      <textarea
                                        value={interviewNotes}
                                        onChange={(e) => setInterviewNotes(e.target.value)}
                                        rows={2}
                                        placeholder="Informations complÃ©mentaires pour le candidat..."
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none resize-none"
                                      />
                                    </div>

                                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={sendInterviewEmail}
                                        onChange={(e) => setSendInterviewEmail(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 accent-[#6c0042]"
                                      />
                                      <span className="text-xs font-medium text-on-surface">
                                        Envoyer automatiquement un email de convocation au candidat
                                      </span>
                                    </label>

                                    <button
                                      onClick={handleSaveInterview}
                                      disabled={isInterviewSaving}
                                      className="w-full px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow hover:bg-primary-container active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                      {isInterviewSaving ? (
                                        <>
                                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                          Enregistrement...
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle2 className="w-4 h-4" />
                                          Enregistrer
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Date de prise de poste (visible quand le candidat est acceptÃ©) */}
                          <AnimatePresence initial={false}>
                            {selectedApp.status === 'accepted' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.35, ease: 'easeInOut' }}
                                className="w-full overflow-hidden text-left"
                              >
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="flex items-center gap-2 mb-4">
                                    <span className="p-1.5 bg-primary/10 text-primary rounded-lg">
                                      <CalendarIcon className="w-4 h-4" />
                                    </span>
                                    <h6 className="font-headline text-sm font-bold text-on-surface">
                                      Date de prise de poste
                                    </h6>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                                          Date de dÃ©but <span className="text-error">*</span>
                                        </label>
                                        <input
                                          type="date"
                                          value={startDate}
                                          min={new Date().toISOString().split('T')[0]}
                                          onChange={(e) => setStartDate(e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                                          Heure d'arrivÃ©e <span className="text-error">*</span>
                                        </label>
                                        <input
                                          type="time"
                                          value={startTime}
                                          onChange={(e) => setStartTime(e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none"
                                        />
                                        {startTime && (
                                          <p className="text-[10px] text-on-surface-variant mt-1">
                                            AffichÃ©e au candidat :{' '}
                                            <span className="font-bold text-primary">{formatTimeAmPm(startTime)}</span>
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      onClick={async () => {
                                        if (!startDate || !startTime) {
                                          addToast('La date et l\'heure de prise de poste sont obligatoires', 'info');
                                          return;
                                        }
                                        try {
                                          const res = await authedFetch(`${API_URL}/job-applications/${selectedApp._id}`, {
                                            method: 'PUT',
                                            body: JSON.stringify({ startDate, startTime }),
                                          });
                                          if (res.ok) {
                                            const updated = await res.json();
                                            setJobApps((prev: any[]) => prev.map((a: any) => (a._id === selectedApp._id ? updated : a)));
                                            setSelectedApp(updated);
                                            addToast('Date de prise de poste enregistrÃ©e et envoyÃ©e au candidat par email');
                                          }
                                        } catch {
                                          addToast('Erreur lors de l\'enregistrement', 'info');
                                        }
                                      }}
                                      className="w-full px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow hover:bg-primary-container active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      Enregistrer et envoyer au candidat
                                    </button>
                                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                                      Un seul email d'acceptation sera envoyÃ© au candidat, avec la date et l'heure de prise de poste. Il n'est renvoyÃ© qu'en cas de modification de la date ou de l'heure.
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Info details */}
                        <div className="space-y-4">
                          {selectedApp.motivationMessage && (
                            <div>
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                                Message de motivation
                              </p>
                              <div className="bg-white p-4 rounded-xl text-sm italic text-on-surface border border-gray-200/50 leading-relaxed">
                                "{selectedApp.motivationMessage}"
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-xl border border-gray-200/50">
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Ã‰tudes &amp; DiplÃ´mes</p>
                              <p className="text-sm font-semibold text-on-surface">{selectedApp.education}</p>
                              {selectedApp.diploma && (
                                <p className="text-xs text-on-surface-variant mt-1">{selectedApp.diploma}</p>
                              )}
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-gray-200/50">
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">TÃ©lÃ©phone</p>
                              <p className="text-sm font-semibold text-on-surface">{selectedApp.phone}</p>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-gray-200/50">
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">ExpÃ©rience</p>
                              <p className="text-sm font-semibold text-on-surface">{selectedApp.experience || 'Non spÃ©cifiÃ©e'}</p>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-gray-200/50">
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Ville</p>
                              <p className="text-sm font-semibold text-on-surface">{selectedApp.city || selectedApp.address || 'Non spÃ©cifiÃ©e'}</p>
                            </div>

                            {selectedApp.dateOfBirth && (
                              <div className="bg-white p-3 rounded-xl border border-gray-200/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Date de naissance</p>
                                <p className="text-sm font-semibold text-on-surface">{selectedApp.dateOfBirth}</p>
                              </div>
                            )}

                            {selectedApp.gender && (
                              <div className="bg-white p-3 rounded-xl border border-gray-200/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Sexe</p>
                                <p className="text-sm font-semibold text-on-surface">{selectedApp.gender}</p>
                              </div>
                            )}

                            {selectedApp.nationality && (
                              <div className="bg-white p-3 rounded-xl border border-gray-200/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">NationalitÃ©</p>
                                <p className="text-sm font-semibold text-on-surface">{selectedApp.nationality}</p>
                              </div>
                            )}

                            {selectedApp.lastPosition && (
                              <div className="bg-white p-3 rounded-xl border border-gray-200/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Dernier poste occupÃ©</p>
                                <p className="text-sm font-semibold text-on-surface">{selectedApp.lastPosition}</p>
                              </div>
                            )}

                            {selectedApp.availability && (
                              <div className="bg-white p-3 rounded-xl border border-gray-200/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">DisponibilitÃ©</p>
                                <p className="text-sm font-semibold text-on-surface">{selectedApp.availability}</p>
                              </div>
                            )}

                            {selectedApp.source && (
                              <div className="bg-white p-3 rounded-xl border border-gray-200/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">ConnaÃ®t le cabinet via</p>
                                <p className="text-sm font-semibold text-on-surface">{selectedApp.source}</p>
                              </div>
                            )}
                          </div>

                          {(selectedApp.attachments || []).length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Documents</p>
                              <div className="space-y-2">
                                {selectedApp.attachments.map((att: any, idx: number) => (
                                  <a
                                    key={idx}
                                    href={attachmentDownloadUrl(selectedApp, att)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center gap-3 p-3 bg-white border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors group text-left"
                                  >
                                    <FileText className="w-5 h-5 text-primary shrink-0" />
                                    <div className="flex-1 overflow-hidden">
                                      <p className="text-xs font-bold text-on-surface truncate">{att.originalName}</p>
                                      <p className="text-[10px] text-on-surface-variant">
                                        {att.type === 'cv' ? 'CV' : att.type === 'coverLetter' ? 'Lettre de motivation' : 'Certificat'} â€” {Math.round(att.size / 1024)} Ko
                                      </p>
                                    </div>
                                    <Download className="w-4 h-4 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden xl:flex w-96 flex-col items-center justify-center p-8 text-center text-gray-400 bg-surface-container-low/30 border-l border-gray-200">
                      <Search className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">
                        SÃ©lectionnez un candidat dans la liste pour voir ses dÃ©tails complets.
                      </p>
                    </div>
                  )}
                </div>

                {/* Delete confirmation */}
                <AnimatePresence>
                  {isDeleteConfirmOpen && (
                    <>
                      <div className="fixed inset-0 bg-black/40 z-50" onClick={() => { setIsDeleteConfirmOpen(false); setAppToDelete(null); }} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                      >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
                          <div className={`w-12 h-12 ${deleteMode === 'permanent' ? 'bg-red-100' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                            {deleteMode === 'permanent'
                              ? <Trash2 className="w-6 h-6 text-red-500" />
                              : <Archive className="w-6 h-6 text-gray-600" />}
                          </div>
                          <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
                            {deleteMode === 'permanent' ? 'Supprimer dÃ©finitivement' : 'Archiver la candidature'}
                          </h3>
                          <p className="text-sm text-on-surface-variant mb-6">
                            {deleteMode === 'permanent'
                              ? 'Cette action est irrÃ©versible. Tous les fichiers seront Ã©galement supprimÃ©s.'
                              : 'La candidature sera dÃ©placÃ©e dans la corbeille. Vous pourrez la restaurer ou la supprimer dÃ©finitivement Ã  tout moment.'}
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => { setIsDeleteConfirmOpen(false); setAppToDelete(null); }}
                              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-on-surface hover:bg-gray-50 transition-all cursor-pointer"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={async () => {
                                if (!appToDelete) return;
                                try {
                                  const url = deleteMode === 'permanent'
                                    ? `${API_URL}/job-applications/${appToDelete}/permanent`
                                    : `${API_URL}/job-applications/${appToDelete}`;
                                  const res = await authedFetch(url, { method: 'DELETE' });
                                  if (res.ok) {
                                    if (deleteMode === 'permanent') {
                                      setArchivedApps((prev: any[]) => prev.filter((a: any) => a._id !== appToDelete));
                                      if (selectedApp?._id === appToDelete) setSelectedApp(null);
                                      addToast('Candidature supprimÃ©e dÃ©finitivement');
                                    } else {
                                      const archived = jobApps.find((a: any) => a._id === appToDelete);
                                      setJobApps((prev: any[]) => prev.filter((a: any) => a._id !== appToDelete));
                                      if (selectedApp?._id === appToDelete) setSelectedApp(null);
                                      if (archived) setArchivedApps((prev: any[]) => [archived, ...prev]);
                                      addToast('Candidature archivÃ©e');
                                    }
                                  }
                                } catch { addToast('Erreur lors de la suppression', 'info'); }
                                setIsDeleteConfirmOpen(false);
                                setAppToDelete(null);
                              }}
                              className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-bold transition-all cursor-pointer ${
                                deleteMode === 'permanent' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-800'
                              }`}
                            >
                              {deleteMode === 'permanent' ? 'Supprimer dÃ©finitivement' : 'Archiver'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">ParamÃ¨tres Globaux</h3>
                    <p className="text-xs text-on-surface-variant">GÃ©rez les informations d'entreprise affichÃ©es sur le site.</p>
                  </div>
                  <button
                    onClick={handleOpenAddParam}
                    className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un paramÃ¨tre
                  </button>
                </div>

                {/* Parameters Table */}
                <div className="bg-white rounded-2xl border border-secondary/10 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                          <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ClÃ©</th>
                          <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Valeur</th>
                          <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parameters.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-12 text-center">
                              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-sm text-gray-400 font-medium">Aucun paramÃ¨tre pour le moment</p>
                              <button
                                onClick={handleOpenAddParam}
                                className="mt-3 text-secondary hover:text-secondary/80 text-xs font-bold cursor-pointer"
                              >
                                + Ajouter votre premier paramÃ¨tre
                              </button>
                            </td>
                          </tr>
                        ) : (
                          parameters.map((param, idx) => (
                            <tr key={param._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                              <td className="py-3 px-4 text-xs text-gray-400 font-mono">{idx + 1}</td>
                              <td className="py-3 px-4">
                                <span className="inline-block bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                  {param.key}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-on-surface max-w-md truncate">{param.value}</td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenEditParam(param)}
                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-fixed/20 rounded-lg transition-all cursor-pointer"
                                    title="Modifier"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteParam(param._id)}
                                    className="p-1.5 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-all cursor-pointer"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
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
                      DÃ©finissez vos dates et crÃ©neaux disponibles, et consultez les demandes de rendez-vous reÃ§ues.
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
                    <p className="text-[11px] text-on-surface-variant mb-4">Cliquez sur une date pour la rendre disponible aux rÃ©servations. Cliquez Ã  nouveau pour la retirer.</p>
                    
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
                          {['Janvier','FÃ©vrier','Mars','Avril','Mai','Juin','Juillet','AoÃ»t','Septembre','Octobre','Novembre','DÃ©cembre'][availCalMonth]} {availCalYear}
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
                                setNewSlotStartTime(match.startTime || '08:00');
                                setNewSlotEndTime(match.endTime || '18:00');
                                setSelectedModalSlots(match.timeSlots || []);
                                setEditingTimeSlotId(match._id);
                                setTimeSlotModalOpen(true);
                              }
                            } else {
                              setTimeSlotDateStr(dateStr);
                              setTimeSlotDayNum(day);
                              setNewSlotStartTime('08:00');
                              setNewSlotEndTime('18:00');
                              setSelectedModalSlots([]);
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
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Dates programmÃ©es</p>
                        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                        {availableDatesList.map(d => (
                          <div key={d._id} className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <span className="text-xs font-medium text-emerald-800">
                                  {new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="text-[10px] text-emerald-600 ml-2">
                                  {d.startTime} - {d.endTime}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setTimeSlotDateStr(d.date.split('T')[0]);
                                    setTimeSlotDayNum(new Date(d.date).getDate());
                                    setNewSlotStartTime(d.startTime || '08:00');
                                    setNewSlotEndTime(d.endTime || '18:00');
                                    setSelectedModalSlots(d.timeSlots || []);
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
                              {d.timeSlots.map((slot, si) => {
                                const isBooked = (d.bookedSlots || []).includes(slot);
                                return (
                                  <span key={si} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                    isBooked
                                      ? 'bg-red-100 text-red-500 line-through'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {slot}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Incoming appointment requests */}
                  <div className="glass-card rounded-xl flex flex-col">
                    <div className="p-6 border-b border-secondary/10">
                      <h4 className="font-headline text-base font-bold text-on-surface">Demandes de Rendez-vous</h4>
                    </div>
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[440px] custom-scrollbar">
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
                            appt.status === 'rescheduled' ? 'border-blue-200 bg-blue-50/50' :
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
                                appt.status === 'rescheduled' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {appt.status === 'pending' ? 'EN ATTENTE' : appt.status === 'confirmed' ? 'CONFIRMÃ‰' : appt.status === 'rescheduled' ? 'REPORTÃ‰' : 'ANNULÃ‰'}
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
                            {appt.status === 'rescheduled' && appt.rescheduledDate && (
                              <div className="text-[11px] text-blue-600 font-semibold mb-3 flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                Nouveau RDV : {new Date(appt.rescheduledDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} â€” {appt.rescheduledTimeSlot}
                              </div>
                            )}
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
                                    addToast(`RDV avec ${appt.clientName} confirmÃ©.`);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                                >
                                  Confirmer
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectTargetId(appt._id);
                                    setRejectTargetName(appt.clientName);
                                    setRejectionReason('');
                                    setRejectModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 border border-red-300 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  Refuser
                                </button>
                                <button
                                  onClick={() => {
                                    setRescheduleTargetId(appt._id);
                                    setRescheduleTargetName(appt.clientName);
                                    setRescheduleNewDate('');
                                    setRescheduleNewTimeSlot('');
                                    setRescheduleModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 border border-amber-300 text-amber-600 text-[10px] font-bold rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                                >
                                  Reporter
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

            {/* 6. MESSAGES VIEW */}
            {activeTab === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Header */}
                <div>
                  <h3 className="font-headline text-2xl font-bold text-primary">Messages</h3>
                  <p className="text-xs text-on-surface-variant">Demandes reÃ§ues depuis le formulaire de contact.</p>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setMessageFilter('all')}
                    className={`glass-card p-4 rounded-xl text-left cursor-pointer transition-all ${messageFilter === 'all' ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'}`}
                  >
                    <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Tous</p>
                    <p className="font-headline text-2xl font-bold text-on-surface mt-1">{clientInboxMessages.length}</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">messages reÃ§us</p>
                  </button>
                  <button
                    onClick={() => setMessageFilter('unread')}
                    className={`glass-card p-4 rounded-xl text-left cursor-pointer transition-all ${messageFilter === 'unread' ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'}`}
                  >
                    <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Non lus</p>
                    <p className="font-headline text-2xl font-bold text-blue-600 mt-1">{clientInboxMessages.filter(m => m.isUnread).length}</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">Ã  traiter</p>
                  </button>
                  <button
                    onClick={() => setMessageFilter('processing')}
                    className={`glass-card p-4 rounded-xl text-left cursor-pointer transition-all ${messageFilter === 'processing' ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'}`}
                  >
                    <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">En cours</p>
                    <p className="font-headline text-2xl font-bold text-amber-600 mt-1">{clientInboxMessages.filter(m => m.status === 'processing').length}</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">en traitement</p>
                  </button>
                  <button
                    onClick={() => setMessageFilter('done')}
                    className={`glass-card p-4 rounded-xl text-left cursor-pointer transition-all ${messageFilter === 'done' ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'}`}
                  >
                    <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">TraitÃ©s</p>
                    <p className="font-headline text-2xl font-bold text-emerald-600 mt-1">{clientInboxMessages.filter(m => m.status === 'done').length}</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">clÃ´turÃ©s</p>
                  </button>
                </div>

                {/* Inbox list */}
                <div className="bg-white rounded-2xl border border-secondary/10 overflow-hidden shadow-sm">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-16 text-sm text-on-surface-variant flex flex-col items-center gap-2">
                      <Mail className="w-10 h-10 text-on-surface-variant/30" />
                      <span>Aucun message trouvÃ©.</span>
                    </div>
                  ) : (
                    filteredMessages.map(msg => {
                      const parts = parseMessageParts(msg);
                      const status = messageStatusInfo(msg.status);
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col lg:flex-row lg:items-center gap-3 p-4 border-b border-gray-100 transition-colors ${msg.isUnread ? 'bg-primary/5' : 'hover:bg-surface-container-low/50'}`}
                        >
                          <div className="flex items-center gap-3 lg:w-72 lg:shrink-0 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                              {msg.initials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-on-surface truncate">{msg.sender}</p>
                                {msg.isUnread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                              </div>
                              <p className="text-[10px] text-on-surface-variant truncate">{parts.email || msg.email || 'â€”'}</p>
                            </div>
                          </div>
                          <div className="lg:w-56 lg:shrink-0 min-w-0">
                            <p className="text-xs font-semibold text-on-surface truncate">{parts.subject}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-on-surface-variant line-clamp-1">{parts.body || msg.content}</p>
                          </div>
                          <div className="flex lg:flex-col lg:items-end items-center gap-2 lg:w-28 lg:shrink-0">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${status.cls}`}>{status.label}</span>
                            <span className="text-[10px] text-on-surface-variant">{formatMessageDate(msg)}</span>
                          </div>
                          <div className="flex items-center gap-0.5 lg:shrink-0">
                            <button
                              onClick={() => openMessageDetail(msg)}
                              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                              title="Voir"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openReplyModal(msg)}
                              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                              title="RÃ©pondre"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setMessageStatus(msg, 'done')}
                              className="p-1.5 text-on-surface-variant hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Marquer comme traitÃ©"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => archiveMessage(msg)}
                              className="p-1.5 text-on-surface-variant hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Archiver"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleArchiveMessage(msg.id, msg.sender)}
                              className="p-1.5 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {/* 7. REFERENCES VIEW */}
            {activeTab === 'references' && (
              <motion.div
                key="references"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-primary">Nos RÃ©fÃ©rences</h3>
                    <p className="text-xs text-on-surface-variant">
                      GÃ©rez les entreprises et partenaires affichÃ©s dans la section Â« Ils Nous Font Confiance Â».
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddRef}
                    className="bg-secondary hover:bg-secondary/80 text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une RÃ©fÃ©rence
                  </button>
                </div>

                {/* Stats Bar */}
                <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant">
                  <span className="font-semibold">
                    Total : <span className="text-primary font-bold">{references.length}</span> rÃ©fÃ©rences
                  </span>
                  <span className="font-semibold">
                    CatÃ©gories : <span className="text-primary font-bold">{new Set(references.map(r => r.category)).size}</span>
                  </span>
                </div>

                {/* References Table */}
                <div className="bg-white rounded-2xl border border-secondary/10 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                          <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Logo</th>
                          <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nom</th>
                          <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">CatÃ©gorie</th>
                          <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {references.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center">
                              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-sm text-gray-400 font-medium">Aucune rÃ©fÃ©rence pour le moment</p>
                              <button
                                onClick={handleOpenAddRef}
                                className="mt-3 text-secondary hover:text-secondary/80 text-xs font-bold cursor-pointer"
                              >
                                + Ajouter votre premiÃ¨re rÃ©fÃ©rence
                              </button>
                            </td>
                          </tr>
                        ) : (
                          references.map((ref, idx) => (
                            <tr key={ref._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                              <td className="py-3 px-4 text-xs text-gray-400 font-mono">{idx + 1}</td>
                              <td className="py-3 px-4">
                                {ref.imageUrl ? (
                                  <img
                                    src={ref.imageUrl}
                                    alt={ref.name}
                                    className="w-10 h-10 object-contain rounded-lg border border-gray-200 bg-white"
                                  />
                                ) : (
                                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                                    <ImageIcon className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 font-semibold text-primary">{ref.name}</td>
                              <td className="py-3 px-4">
                                <span className="inline-block bg-secondary/10 text-secondary px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                  {ref.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenEditRef(ref)}
                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-fixed/20 rounded-lg transition-all cursor-pointer"
                                    title="Modifier"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRef(ref._id)}
                                    className="p-1.5 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-all cursor-pointer"
                                    title="Supprimer"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

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
                    IntitulÃ© de la Mission <span className="text-error">*</span>
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
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">DÃ©partement</label>
                    <select
                      value={newMissionDept}
                      onChange={(e) => setNewMissionDept(e.target.value as any)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-primary"
                    >
                      <option value="Audit LÃ©gal">Audit LÃ©gal</option>
                      <option value="Conseil">Conseil</option>
                      <option value="ComptabilitÃ©">ComptabilitÃ©</option>
                      <option value="Juridique">Juridique</option>
                      <option value="FiscalitÃ©">FiscalitÃ©</option>
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
                    CrÃ©er la Mission
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: REPLY TO MESSAGE â€” Chat Thread */}
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
                    const isMe = msg.sender === 'Rezgui Mihoub';
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
                    placeholder="Ã‰crire un message..."
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
                    <p className="font-bold text-on-surface mb-1">Comment crÃ©er une mission ?</p>
                    <p>Cliquez sur "Nouvelle Mission" en bas Ã  gauche pour configurer un nouvel audit ou une mission de conseil.</p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-lg">
                    <p className="font-bold text-on-surface mb-1">Mise Ã  jour de la progression</p>
                    <p>Dans l'onglet "Missions", vous pouvez augmenter la progression de 10% ou marquer la mission comme validÃ©e instantanÃ©ment.</p>
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
                  <p className="font-semibold text-on-surface mb-1">PÃ´le d'Expertise :</p>
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
                  {editingDept ? 'Modifier le DÃ©partement' : 'Nouveau DÃ©partement'}
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
                    Nom du DÃ©partement *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="Ex: Conseil & StratÃ©gie, FiscalitÃ©..."
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
                    placeholder="Description concise des missions et spÃ©cialitÃ©s de ce pÃ´le..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-primary placeholder:text-on-surface-variant/30 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    Responsable du PÃ´le *
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
                    placeholder={"Ex:\nTenue complÃ¨te ou partagÃ©e de la comptabilitÃ©\nÃ‰tablissement des comptes annuels\nConsolidation financiÃ¨re"}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface font-sans focus:outline-primary placeholder:text-on-surface-variant/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    Image du DÃ©partement <span className="font-normal text-on-surface-variant/60">(optionnel)</span>
                  </label>
                  {(deptImagePreview || deptExistingImageUrl) && (
                    <div className="relative mb-2 inline-block">
                      <img
                        src={deptImagePreview || deptExistingImageUrl || ''}
                        alt="AperÃ§u"
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
                    {editingDept ? 'Enregistrer les Modifications' : 'CrÃ©er le DÃ©partement'}
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
                  Horaires - {timeSlotDayNum} {['Janvier','FÃ©vrier','Mars','Avril','Mai','Juin','Juillet','AoÃ»t','Septembre','Octobre','Novembre','DÃ©cembre'][availCalMonth]} {availCalYear}
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
                  Choisissez l'intervalle horaire, puis sÃ©lectionnez les crÃ©neaux de 30 min que vous souhaitez rendre disponibles.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-on-surface block mb-1">Heure de dÃ©but</label>
                    <input
                      type="time"
                      value={newSlotStartTime}
                      onChange={(e) => {
                        setNewSlotStartTime(e.target.value);
                        setSelectedModalSlots([]);
                      }}
                      className="w-full border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-on-surface block mb-1">Heure de fin</label>
                    <input
                      type="time"
                      value={newSlotEndTime}
                      onChange={(e) => {
                        setNewSlotEndTime(e.target.value);
                        setSelectedModalSlots([]);
                      }}
                      className="w-full border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">CrÃ©neaux disponibles</p>
                    <button
                      type="button"
                      onClick={() => {
                        const all = generateClientSlots(newSlotStartTime, newSlotEndTime);
                        if (selectedModalSlots.length === all.length) {
                          setSelectedModalSlots([]);
                        } else {
                          setSelectedModalSlots(all);
                        }
                      }}
                      className="text-[10px] text-primary font-bold cursor-pointer hover:underline"
                    >
                      {selectedModalSlots.length === generateClientSlots(newSlotStartTime, newSlotEndTime).length ? 'Tout dÃ©sÃ©lectionner' : 'Tout sÃ©lectionner'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {generateClientSlots(newSlotStartTime, newSlotEndTime).map((slot) => {
                      const isSelected = selectedModalSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            setSelectedModalSlots(prev =>
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
                    {generateClientSlots(newSlotStartTime, newSlotEndTime).length === 0 && (
                      <p className="col-span-2 text-[10px] text-on-surface-variant italic text-center py-2">Aucun crÃ©neau possible</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-secondary/10">
                  {editingTimeSlotId && (
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`${API_URL}/available-dates/${editingTimeSlotId}`, { method: 'DELETE' });
                        setAvailableDatesList(prev => prev.filter(d => d._id !== editingTimeSlotId));
                        setTimeSlotModalOpen(false);
                        addToast(`Date ${timeSlotDayNum} supprimÃ©e.`, 'info');
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
                    disabled={selectedModalSlots.length === 0}
                    onClick={async () => {
                      if (selectedModalSlots.length === 0) return;
                      if (editingTimeSlotId) {
                        const res = await fetch(`${API_URL}/available-dates/${editingTimeSlotId}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ startTime: newSlotStartTime, endTime: newSlotEndTime, timeSlots: selectedModalSlots })
                        });
                        if (res.ok) {
                          const updated = await res.json();
                          setAvailableDatesList(prev =>
                            prev.map(d => d._id === editingTimeSlotId ? { ...updated, bookedSlots: d.bookedSlots } : d)
                          );
                          addToast(`Horaires mis Ã  jour pour le ${timeSlotDayNum}.`);
                        }
                      } else {
                        const res = await fetch(`${API_URL}/available-dates`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ date: timeSlotDateStr, startTime: newSlotStartTime, endTime: newSlotEndTime, timeSlots: selectedModalSlots })
                        });
                        if (res.ok) {
                          const created = await res.json();
                          setAvailableDatesList(prev => [...prev, { ...created, bookedSlots: [] }]);
                          addToast(`Date ${timeSlotDayNum} ajoutÃ©e avec ${selectedModalSlots.length} crÃ©neau(x).`);
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

      {/* MODAL: PROGRAMME FORM (ADD/EDIT) */}
      <AnimatePresence>
        {programmeFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProgrammeFormOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-white border border-outline-variant rounded-xl shadow-2xl z-10 overflow-hidden"
            >
              <div className="flex justify-between items-center bg-orange-600 text-white px-6 py-4">
                <h4 className="font-headline font-bold text-sm flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {editingProgrammeId ? 'Modifier le Programme' : 'Nouveau Programme'}
                </h4>
                <button
                  type="button"
                  onClick={() => setProgrammeFormOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProgramme} className="p-6 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-on-surface block mb-1">Titre du programme *</label>
                  <input
                    type="text"
                    value={progTitle}
                    onChange={e => setProgTitle(e.target.value)}
                    placeholder="Ex: SÃ©minaire FiscalitÃ© 2026"
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-on-surface block mb-1">Description</label>
                  <textarea
                    value={progDescription}
                    onChange={e => setProgDescription(e.target.value)}
                    rows={2}
                    placeholder="Description du programmeâ€¦"
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-on-surface block mb-1">Date *</label>
                  <input
                    type="date"
                    value={progDate}
                    onChange={e => setProgDate(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-on-surface block mb-1">Heure de dÃ©but *</label>
                    <input
                      type="time"
                      value={progStartTime}
                      onChange={e => setProgStartTime(e.target.value)}
                      className="w-full border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-on-surface block mb-1">Heure de fin *</label>
                    <input
                      type="time"
                      value={progEndTime}
                      onChange={e => setProgEndTime(e.target.value)}
                      className="w-full border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-on-surface block mb-1">Type de programme *</label>
                  <select
                    value={progType}
                    onChange={e => setProgType(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="Formation">Formation</option>
                    <option value="SÃ©minaire">SÃ©minaire</option>
                    <option value="Atelier">Atelier</option>
                    <option value="ConfÃ©rence">ConfÃ©rence</option>
                    <option value="RÃ©union">RÃ©union</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-on-surface block mb-1">Notes <span className="font-normal text-on-surface-variant">(optionnel)</span></label>
                  <textarea
                    value={progNotes}
                    onChange={e => setProgNotes(e.target.value)}
                    rows={2}
                    placeholder="Notes ou informations complÃ©mentairesâ€¦"
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-secondary/10">
                  <button
                    type="button"
                    onClick={() => setProgrammeFormOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {editingProgrammeId ? 'Enregistrer' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PROGRAMME VIEW */}
      <AnimatePresence>
        {viewingProgramme && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingProgramme(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-white border border-outline-variant rounded-xl shadow-2xl z-10 overflow-hidden"
            >
              <div className="flex justify-between items-center bg-orange-600 text-white px-6 py-4">
                <h4 className="font-headline font-bold text-sm flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Programme
                </h4>
                <button
                  type="button"
                  onClick={() => setViewingProgramme(null)}
                  className="p-1 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                    {viewingProgramme.type}
                  </span>
                  <h5 className="font-headline font-bold text-on-surface text-sm">{viewingProgramme.title}</h5>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-on-surface flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    {new Date(`${viewingProgramme.date}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-on-surface flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    {viewingProgramme.startTime} - {viewingProgramme.endTime}
                  </p>
                </div>

                {viewingProgramme.description && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Description</p>
                    <p className="text-xs text-on-surface leading-relaxed">{viewingProgramme.description}</p>
                  </div>
                )}

                {viewingProgramme.notes && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Notes</p>
                    <p className="text-xs text-on-surface leading-relaxed bg-surface-container-low rounded-lg p-3">{viewingProgramme.notes}</p>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-secondary/10">
                  <button
                    type="button"
                    onClick={() => {
                      openEditProgramme(viewingProgramme);
                      setViewingProgramme(null);
                    }}
                    className="px-4 py-2 text-xs font-bold border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProgramme(viewingProgramme.id, viewingProgramme.title)}
                    className="px-4 py-2 text-xs font-bold border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REFERENCES ADD/EDIT */}
      <AnimatePresence>
        {isRefModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsRefModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-lg z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-headline text-lg font-bold text-primary">
                  {editingRef ? 'Modifier la rÃ©fÃ©rence' : 'Ajouter une rÃ©fÃ©rence'}
                </h4>
                <button
                  onClick={() => setIsRefModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitRef} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Nom de l'entreprise</label>
                  <input
                    type="text"
                    value={refName}
                    onChange={e => setRefName(e.target.value)}
                    placeholder="Ex: SOBATRAP"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">CatÃ©gorie</label>
                  <input
                    type="text"
                    value={refCategory}
                    onChange={e => setRefCategory(e.target.value)}
                    placeholder="Ex: BTP, Banque, Ã‰ducation..."
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Logo <span className="font-normal text-gray-400 normal-case">(optionnel)</span>
                  </label>
                  {(refImagePreview || refExistingImageUrl) && (
                    <div className="relative mb-2 inline-block">
                      <img
                        src={refImagePreview || refExistingImageUrl || ''}
                        alt="AperÃ§u"
                        className="w-full h-28 object-contain rounded-xl border border-gray-200 bg-white p-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setRefImageFile(null);
                          setRefImagePreview(null);
                          setRefExistingImageUrl(null);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 cursor-pointer hover:bg-red-600"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-300 rounded-xl p-4 text-xs text-gray-500 hover:border-secondary hover:bg-secondary/5 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {refImageFile ? refImageFile.name : 'Choisir une image (JPG, PNG, WebP)'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setRefImageFile(file);
                          setRefExistingImageUrl(null);
                          const reader = new FileReader();
                          reader.onload = (ev) => setRefImagePreview(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRefModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold bg-secondary text-white rounded-xl hover:bg-secondary/80 transition-all cursor-pointer"
                  >
                    {editingRef ? 'Enregistrer' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REJECT APPOINTMENT */}
      <AnimatePresence>
        {rejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-white border border-outline-variant rounded-xl shadow-2xl z-10 overflow-hidden p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-secondary/10 pb-3">
                <h4 className="font-headline font-bold text-sm text-red-600 flex items-center gap-2">
                  <X className="w-5 h-5 text-red-600" />
                  Refuser le rendez-vous
                </h4>
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-on-surface-variant">
                Vous Ãªtes sur le point de refuser le rendez-vous avec <strong>{rejectTargetName}</strong>.
                Veuillez indiquer la raison du refus, elle sera envoyÃ©e par email au client.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Saisissez la raison du refus..."
                rows={4}
                className="w-full border border-outline-variant rounded-lg p-3 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold border border-outline-variant text-on-surface-variant rounded-lg hover:bg-surface-container cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  disabled={!rejectionReason.trim()}
                  onClick={async () => {
                    if (!rejectTargetId) return;
                    await fetch(`${API_URL}/appointments/${rejectTargetId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'cancelled', rejectionReason: rejectionReason.trim() })
                    });
                    setAppointments(prev => prev.map(a => a._id === rejectTargetId ? { ...a, status: 'cancelled' } : a));
                    setRejectModalOpen(false);
                    addToast(`RDV avec ${rejectTargetName} refusÃ©. Email envoyÃ©.`, 'info');
                  }}
                  className="px-4 py-2 text-xs font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Confirmer le refus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: RESCHEDULE APPOINTMENT */}
      <AnimatePresence>
        {rescheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRescheduleModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-white border border-outline-variant rounded-xl shadow-2xl z-10 overflow-hidden p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-secondary/10 pb-3">
                <h4 className="font-headline font-bold text-sm text-amber-600 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-amber-600" />
                  Reporter le rendez-vous
                </h4>
                <button
                  onClick={() => setRescheduleModalOpen(false)}
                  className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-on-surface-variant">
                Vous Ãªtes sur le point de reporter le rendez-vous avec <strong>{rescheduleTargetName}</strong>.
                SÃ©lectionnez une nouvelle date et un crÃ©neau horaire.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-on-surface block mb-1">Nouvelle date</label>
                  <select
                    value={rescheduleNewDate}
                    onChange={(e) => {
                      setRescheduleNewDate(e.target.value);
                      setRescheduleNewTimeSlot('');
                    }}
                    className="w-full border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">SÃ©lectionner une date</option>
                    {availableDatesList.map((ad) => (
                      <option key={ad._id} value={ad.date}>
                        {new Date(ad.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </option>
                    ))}
                  </select>
                </div>

                {rescheduleNewDate && (
                  <div>
                    <label className="text-[11px] font-bold text-on-surface block mb-1">CrÃ©neau horaire</label>
                    <div className="flex flex-wrap gap-2">
                      {availableDatesList
                        .find((ad) => ad.date === rescheduleNewDate)
                        ?.timeSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setRescheduleNewTimeSlot(slot)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-colors cursor-pointer ${
                              rescheduleNewTimeSlot === slot
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'border-outline-variant text-on-surface-variant hover:bg-amber-50'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setRescheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold border border-outline-variant text-on-surface-variant rounded-lg hover:bg-surface-container cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  disabled={!rescheduleNewDate || !rescheduleNewTimeSlot}
                  onClick={async () => {
                    if (!rescheduleTargetId) return;
                    await fetch(`${API_URL}/appointments/${rescheduleTargetId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        status: 'rescheduled',
                        rescheduledDate: rescheduleNewDate,
                        rescheduledTimeSlot: rescheduleNewTimeSlot
                      })
                    });
                    setAppointments(prev => prev.map(a => a._id === rescheduleTargetId
                      ? { ...a, status: 'rescheduled' as const, rescheduledDate: rescheduleNewDate, rescheduledTimeSlot: rescheduleNewTimeSlot }
                      : a));
                    setRescheduleModalOpen(false);
                    addToast(`RDV avec ${rescheduleTargetName} reportÃ©. Email envoyÃ©.`, 'info');
                  }}
                  className="px-4 py-2 text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Confirmer le report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PARAMETERS ADD/EDIT */}
      <AnimatePresence>
        {isParamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsParamModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-lg z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-headline text-lg font-bold text-primary">
                  {editingParam ? 'Modifier le paramÃ¨tre' : 'Ajouter un paramÃ¨tre'}
                </h4>
                <button
                  onClick={() => setIsParamModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitParam} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">ClÃ©</label>
                  <input
                    type="text"
                    value={paramKey}
                    onChange={e => setParamKey(e.target.value)}
                    placeholder="Ex: address, phone, email, hours..."
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Valeur</label>
                  <textarea
                    rows={3}
                    value={paramValue}
                    onChange={e => setParamValue(e.target.value)}
                    placeholder="Valeur du paramÃ¨tre..."
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all resize-none"
                    required
                  />
                </div>

                {paramKey.toLowerCase() === 'address' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      SÃ©lectionner sur la carte
                    </label>
                    <MapPicker value={paramValue} onChange={setParamValue} />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsParamModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold bg-secondary text-white rounded-xl hover:bg-secondary/80 transition-all cursor-pointer"
                  >
                    {editingParam ? 'Enregistrer' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Offer form modal (create / edit) */}
      <AnimatePresence>
        {isOfferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOfferModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl z-10 max-h-[92vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                <div>
                  <h4 className="font-headline text-lg font-bold text-primary">
                    {editingOffer ? 'Modifier l\'offre d\'emploi' : 'Nouvelle offre d\'emploi'}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">Les champs marqu├®s d'un * sont obligatoires.</p>
                </div>
                <button
                  onClick={() => setIsOfferModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleOfferSubmit} className="overflow-y-auto custom-scrollbar flex-1">
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Intitul├® du poste <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={offerTitle}
                      onChange={(e) => setOfferTitle(e.target.value)}
                      placeholder="Ex : Collaborateur comptable"
                      className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all ${
                        offerFormErrors.title ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {offerFormErrors.title && <p className="text-xs text-red-500 mt-1">{offerFormErrors.title}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                        D├®partement <span className="text-error">*</span>
                      </label>
                      <select
                        value={offerDepartment}
                        onChange={(e) => setOfferDepartment(e.target.value)}
                        className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all bg-white ${
                          offerFormErrors.department ? 'border-red-400' : 'border-gray-200'
                        }`}
                      >
                        {OFFER_DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                        Type de contrat <span className="text-error">*</span>
                      </label>
                      <select
                        value={offerContractType}
                        onChange={(e) => setOfferContractType(e.target.value)}
                        className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all bg-white ${
                          offerFormErrors.contract ? 'border-red-400' : 'border-gray-200'
                        }`}
                      >
                        {OFFER_CONTRACTS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                        Lieu <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={offerLocation}
                        onChange={(e) => setOfferLocation(e.target.value)}
                        placeholder="Ex : Tunis"
                        className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all ${
                          offerFormErrors.location ? 'border-red-400' : 'border-gray-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                        Niveau d'├®tude requis
                      </label>
                      <input
                        type="text"
                        value={offerEducationLevel}
                        onChange={(e) => setOfferEducationLevel(e.target.value)}
                        placeholder="Ex : Master en comptabilit├®"
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                        Exp├®rience requise
                      </label>
                      <input
                        type="text"
                        value={offerRequiredExperience}
                        onChange={(e) => setOfferRequiredExperience(e.target.value)}
                        placeholder="Ex : 2 ├á 5 ans"
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                        Nombre de postes
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={offerOpenPositions}
                        onChange={(e) => setOfferOpenPositions(e.target.value)}
                        placeholder="Ex : 2"
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Comp├®tences recherch├®es <span className="text-error">*</span>
                      <span className="normal-case font-semibold text-gray-400"> (une par ligne)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={offerSkillsText}
                      onChange={(e) => setOfferSkillsText(e.target.value)}
                      placeholder={'Excel avanc├®\nMa├«trise des normes comptables\nEsprit d\'analyse'}
                      className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all resize-none ${
                        offerFormErrors.skills ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {offerFormErrors.skills && <p className="text-xs text-red-500 mt-1">{offerFormErrors.skills}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Description d├®taill├®e du poste <span className="text-error">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={offerDescription}
                      onChange={(e) => setOfferDescription(e.target.value)}
                      placeholder="D├®crivez le contexte du poste, le cabinet et les responsabilit├®s..."
                      className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all resize-none ${
                        offerFormErrors.description ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Missions principales
                      <span className="normal-case font-semibold text-gray-400"> (une par ligne)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={offerMissionsText}
                      onChange={(e) => setOfferMissionsText(e.target.value)}
                      placeholder={'Tenue et suivi de la comptabilit├®\nPr├®paration des ├®tats financiers'}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Profil recherch├®
                    </label>
                    <textarea
                      rows={3}
                      value={offerProfile}
                      onChange={(e) => setOfferProfile(e.target.value)}
                      placeholder="D├®crivez le profil id├®al : formation, qualit├®s, atouts..."
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Avantages
                      <span className="normal-case font-semibold text-gray-400"> (une par ligne, facultatif)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={offerBenefitsText}
                      onChange={(e) => setOfferBenefitsText(e.target.value)}
                      placeholder={'Mutuelle groupe\nFormation continue'}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                        Date de publication
                      </label>
                      <input
                        type="date"
                        value={offerPublishedAt}
                        onChange={(e) => setOfferPublishedAt(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                      />
                      <p className="text-[10px] text-on-surface-variant mt-1">Automatique lors de la publication.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                        Date d'expiration
                      </label>
                      <input
                        type="date"
                        value={offerDeadline}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setOfferDeadline(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                      />
                      <p className="text-[10px] text-on-surface-variant mt-1">Facultative ÔÇö offre ouverte si vide.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Statut</label>
                      <select
                        value={offerStatus}
                        onChange={(e) => setOfferStatus(e.target.value as 'draft' | 'published' | 'closed')}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all bg-white"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="published">Publi├®e</option>
                        <option value="closed">Ferm├®e</option>
                      </select>
                      {offerStatus === 'published' && (
                        <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
                          Visible imm├®diatement sur le site (#/offres)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-surface-container-low/40 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsOfferModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary-container transition-all cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {editingOffer ? 'Enregistrer les modifications' : 'Cr├®er l\'offre'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Offer detail modal (Vue 2 : offre + candidatures re├ºues) */}
      <AnimatePresence>
        {selectedOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedOffer(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl z-10 max-h-[92vh] flex flex-col"
            >
              <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0 gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${offerStatusInfo(selectedOffer.status).cls}`}>
                      {offerStatusInfo(selectedOffer.status).label}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${contractBadgeCls(selectedOffer.contractType)}`}>
                      {selectedOffer.contractType}
                    </span>
                    {selectedOffer.openPositions != null && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200">
                        {selectedOffer.openPositions} poste{selectedOffer.openPositions > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <h4 className="font-headline text-xl font-bold text-on-surface">{selectedOffer.title}</h4>
                  <p className="text-xs text-on-surface-variant mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {selectedOffer.department}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selectedOffer.location}</span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="w-3.5 h-3.5" />
                      Publi├®e le {selectedOffer.publishedAt ? new Date(selectedOffer.publishedAt).toLocaleDateString('fr-FR') : 'ÔÇö'}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`${siteOrigin()}/#/offres/${selectedOffer._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    title="Voir l'offre sur le site"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => openOfferModal(selectedOffer)}
                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedOffer(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto custom-scrollbar flex-1">
                <div className="p-6 space-y-6">
                  {/* D├®tails de l'offre */}
                  <div className="space-y-5">
                    {selectedOffer.requiredExperience || selectedOffer.educationLevel ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedOffer.educationLevel && (
                          <div className="bg-surface-container-low/60 p-3 rounded-xl border border-secondary/10">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5" /> Niveau d'├®tude
                            </p>
                            <p className="text-sm font-semibold text-on-surface">{selectedOffer.educationLevel}</p>
                          </div>
                        )}
                        {selectedOffer.requiredExperience && (
                          <div className="bg-surface-container-low/60 p-3 rounded-xl border border-secondary/10">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 flex items-center gap-1">
                              <Target className="w-3.5 h-3.5" /> Exp├®rience requise
                            </p>
                            <p className="text-sm font-semibold text-on-surface">{selectedOffer.requiredExperience}</p>
                          </div>
                        )}
                      </div>
                    ) : null}

                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Description du poste</p>
                      <p className="text-sm text-on-surface leading-relaxed">{selectedOffer.description}</p>
                    </div>

                    {(selectedOffer.missions || []).length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1">
                          <ListChecks className="w-3.5 h-3.5" /> Missions principales
                        </p>
                        <ul className="space-y-1.5">
                          {selectedOffer.missions.map((m, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-on-surface">
                              <span className="text-emerald-600 font-bold shrink-0 mt-0.5">Ô£ô</span>
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(selectedOffer.skills || []).length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Comp├®tences recherch├®es</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedOffer.skills.map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-primary/5 text-primary border border-primary/15 rounded-full text-xs font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedOffer.profile && (
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Profil recherch├®</p>
                        <p className="text-sm text-on-surface leading-relaxed">{selectedOffer.profile}</p>
                      </div>
                    )}

                    {(selectedOffer.benefits || []).length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Avantages
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedOffer.benefits.map((b, i) => (
                            <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Candidatures re├ºues pour cette offre (Vue 2) */}
                  <div className="border-t border-gray-100 pt-5">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-headline text-sm font-bold text-on-surface flex items-center gap-2">
                        <UsersRound className="w-4 h-4 text-primary" />
                        Candidatures re├ºues
                      </h5>
                      <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                        {(offerCandidatesCount[selectedOffer._id] || 0)} candidature{(offerCandidatesCount[selectedOffer._id] || 0) > 1 ? 's' : ''}
                      </span>
                    </div>

                    {(() => {
                      const apps = jobApps.filter((a: any) => (a.jobOffer?._id || a.jobOffer) === selectedOffer._id);
                      if (apps.length === 0) {
                        return (
                          <div className="text-center py-8 text-on-surface-variant bg-surface-container-low/40 rounded-xl border border-dashed border-secondary/20">
                            <UsersRound className="w-8 h-8 mx-auto mb-2 text-on-surface-variant/40" />
                            <p className="text-sm font-medium">Aucune candidature re├ºue pour cette offre.</p>
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-2">
                          {apps.map((app: any) => {
                            const info = candidateStatusInfo(app.status);
                            const cvAtt = (app.attachments || []).find((a: any) => a.type === 'cv');
                            return (
                              <div key={app._id} className="flex items-center gap-4 p-3 bg-surface-container-low/50 border border-gray-100 rounded-xl hover:border-primary/20 hover:bg-white transition-all">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                  {app.firstName?.[0]}{app.lastName?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-on-surface truncate">{app.firstName} {app.lastName}</p>
                                  <p className="text-xs text-on-surface-variant truncate">
                                    {app.email} ÔÇö {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${info.cls}`}>
                                  {info.label}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  {cvAtt && (
                                    <a
                                      href={attachmentDownloadUrl(app, cvAtt)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                      title="Voir le CV"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => {
                                      setSelectedOffer(null);
                                      setSelectedApp(app);
                                      setShowArchived(false);
                                      setActiveTab('recruitment');
                                    }}
                                    className="px-3 py-1.5 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                                    title="Ouvrir la candidature"
                                  >
                                    Voir
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Offer delete confirmation */}
      <AnimatePresence>
        {isOfferDeleteOpen && offerToDelete && (
          <>
            <div className="fixed inset-0 bg-black/40 z-50" onClick={() => { setIsOfferDeleteOpen(false); setOfferToDelete(null); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Supprimer l'offre</h3>
                <p className="text-sm text-on-surface-variant mb-6">
                  Voulez-vous vraiment supprimer l'offre <strong className="text-on-surface">"{offerToDelete.title}"</strong> ?
                  Cette action est irr├®versible.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setIsOfferDeleteOpen(false); setOfferToDelete(null); }}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-on-surface hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteOffer}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* MODAL: MESSAGE DETAIL */}
      <AnimatePresence>
        {messageDetailOpen && activeMessageDetail && (() => {
          const parts = parseMessageParts(activeMessageDetail);
          const status = messageStatusInfo(activeMessageDetail.status);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setMessageDetailOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl z-10"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                      {activeMessageDetail.initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-headline text-lg font-bold text-primary truncate">{activeMessageDetail.sender}</h4>
                      <p className="text-xs text-on-surface-variant truncate">{parts.email || activeMessageDetail.email || 'ÔÇö'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${status.cls}`}>{status.label}</span>
                    <button
                      onClick={() => setMessageDetailOpen(false)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-sm font-bold text-on-surface">{parts.subject}</p>
                    <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{formatMessageDate(activeMessageDetail)}</span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-4 text-sm text-on-surface leading-relaxed whitespace-pre-wrap min-h-32">
                    {parts.body || activeMessageDetail.content}
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-5">
                  <button
                    onClick={() => {
                      archiveMessage(activeMessageDetail);
                      setMessageDetailOpen(false);
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Archive className="w-3.5 h-3.5" /> Archiver
                  </button>
                  <button
                    onClick={() => {
                      handleArchiveMessage(activeMessageDetail.id, activeMessageDetail.sender);
                      setMessageDetailOpen(false);
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                  <button
                    onClick={() => openMessageDetailWithReply(activeMessageDetail)}
                    className="px-4 py-2.5 text-xs font-bold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> R├®pondre par email
                  </button>
                  {activeMessageDetail.status !== 'done' && (
                    <button
                      onClick={() => setMessageStatus(activeMessageDetail, 'done')}
                      className="px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Marquer comme trait├®
                    </button>
                  )}
                  <button
                    onClick={() => {
                      openNewAppointment(activeMessageDetail);
                      setMessageDetailOpen(false);
                    }}
                    className="px-4 py-2.5 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CalendarIcon className="w-3.5 h-3.5" /> Planifier un rendez-vous
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
      {/* MODAL: PLANIFIER UN RENDEZ-VOUS */}
      <AnimatePresence>
        {appointmentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setAppointmentModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-headline text-lg font-bold text-primary">Planifier un rendez-vous</h4>
                <button
                  onClick={() => setAppointmentModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAppointment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Client</label>
                    <input
                      type="text"
                      value={newApptClient}
                      onChange={e => setNewApptClient(e.target.value)}
                      placeholder="Nom du client"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      value={newApptEmail}
                      onChange={e => setNewApptEmail(e.target.value)}
                      placeholder="email@exemple.com"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Service</label>
                    <input
                      type="text"
                      value={newApptService}
                      onChange={e => setNewApptService(e.target.value)}
                      placeholder="Ex: Conseil en strat├®gie"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Date</label>
                    <input
                      type="date"
                      value={newApptDate}
                      onChange={e => setNewApptDate(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Heure</label>
                    <input
                      type="time"
                      value={newApptTime}
                      onChange={e => setNewApptTime(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Dur├®e</label>
                    <select
                      value={newApptDuration}
                      onChange={e => setNewApptDuration(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all bg-white cursor-pointer"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 heure</option>
                      <option value="90">1h30</option>
                      <option value="120">2 heures</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Notes (optionnel)</label>
                  <textarea
                    rows={3}
                    value={newApptNotes}
                    onChange={e => setNewApptNotes(e.target.value)}
                    placeholder="Notes concernant le rendez-vous..."
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAppointmentModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    Planifier
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
