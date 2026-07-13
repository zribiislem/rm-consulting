import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  User,
  ShieldCheck,
  FileText,
  UploadCloud,
  FileCheck2,
  Trash2,
  Download,
  AlertCircle,
  Briefcase,
  Check,
} from 'lucide-react';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PortalModal({ isOpen, onClose }: PortalModalProps) {
  const [profileType, setProfileType] = useState<'client' | 'staff'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dummy uploaded files in the portal dashboard
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; date: string }[]>([
    { name: 'Rapport_Audit_Phoenicia_2024.pdf', size: '2.4 MB', date: '01/03/2025' },
    { name: 'Balance_Generale_Q1_2025.xlsx', size: '1.1 MB', date: '15/04/2025' },
  ]);

  // File Upload drag & drop refs/states
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!email || !password) {
      setAuthError('Veuillez renseigner tous les champs.');
      return;
    }

    // Standard credential checking
    if (profileType === 'client') {
      if (email === 'client@test.com' && password === 'client123') {
        setIsLoggedIn(true);
      } else {
        setAuthError("Email ou mot de passe incorrect. Astuce client: client@test.com / client123");
      }
    } else {
      if (email === 'staff@test.com' && password === 'staff123') {
        setIsLoggedIn(true);
      } else {
        setAuthError("Email ou mot de passe incorrect. Astuce collaborateur: staff@test.com / staff123");
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setAuthError('');
  };

  // Upload Management: supports drag-and-drop and manual select as requested
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const dateStr = new Date().toLocaleDateString('fr-FR');
    setUploadedFiles((prev) => [
      { name: file.name, size: `${fileSizeMB} MB`, date: dateStr },
      ...prev,
    ]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerManualSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="bg-white rounded-3xl w-full max-w-2xl relative shadow-2xl overflow-hidden z-10 border border-gray-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-primary p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-base">
                  RM
                </div>
                <div className="text-left">
                  <h3 className="font-display font-extrabold text-lg">Espace Collaborateurs &amp; Clients</h3>
                  <p className="text-[10px] text-white/70 uppercase tracking-widest font-sans font-medium">
                    {isLoggedIn ? 'Portail Sécurisé Connecté' : 'Portail d\'accès sécurisé'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-grow text-left">
              {!isLoggedIn ? (
                // --- LOGIN VIEW ---
                <div>
                  <div className="flex gap-4 border-b border-gray-100 mb-6">
                    <button
                      onClick={() => {
                        setProfileType('client');
                        setAuthError('');
                      }}
                      className={`pb-3 font-display font-bold text-sm sm:text-base flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                        profileType === 'client'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-400 hover:text-primary'
                      }`}
                    >
                      <User className="w-4 h-4" /> Espace Client
                    </button>
                    <button
                      onClick={() => {
                        setProfileType('staff');
                        setAuthError('');
                      }}
                      className={`pb-3 font-display font-bold text-sm sm:text-base flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                        profileType === 'staff'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-400 hover:text-primary'
                      }`}
                    >
                      <Briefcase className="w-4 h-4" /> Collaborateur RM
                    </button>
                  </div>

                  {/* Helpers */}
                  <div className="mb-6 p-4 bg-secondary/10 border border-secondary/20 rounded-xl">
                    <p className="text-xs text-on-secondary-container leading-relaxed font-sans font-medium">
                      🔒 <strong>Informations de démonstration :</strong>
                      <br />
                      {profileType === 'client' ? (
                        <>Utilisez l'email <code className="bg-white/80 px-1 rounded font-mono text-primary font-bold">client@test.com</code> avec le mot de passe <code className="bg-white/80 px-1 rounded font-mono text-primary font-bold">client123</code></>
                      ) : (
                        <>Utilisez l'email <code className="bg-white/80 px-1 rounded font-mono text-primary font-bold">staff@test.com</code> avec le mot de passe <code className="bg-white/80 px-1 rounded font-mono text-primary font-bold">staff123</code></>
                      )}
                    </p>
                  </div>

                  {authError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Adresse Email Professionnelle</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none text-gray-900"
                        placeholder="Ex: nom@societe.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Mot de passe</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none text-gray-900"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-container text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all mt-6"
                    >
                      <Lock className="w-4 h-4" />
                      Se Connecter de façon sécurisée
                    </button>
                  </form>
                </div>
              ) : (
                // --- INTERACTIVE DASHBOARD VIEW ---
                <div className="space-y-6">
                  {/* User greeting */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-primary tracking-wider font-sans">
                        Session Active : {profileType === 'client' ? 'Phoenicia Group' : 'Cabinet RM Team'}
                      </span>
                      <h4 className="font-display font-extrabold text-primary text-lg">
                        {profileType === 'client' ? 'Bienvenue, Espace Client Phoenicia' : 'Bienvenue, Expert Raouf'}
                      </h4>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Se déconnecter
                    </button>
                  </div>

                  {/* Interactive Drag & Drop File Upload Panel */}
                  <div>
                    <h5 className="font-display font-bold text-gray-800 text-sm mb-3">
                      Transmettre des justificatifs comptables au Cabinet
                    </h5>
                    
                    {/* Hidden input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.docx"
                    />

                    {/* Drag and drop Area */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={triggerManualSelect}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-secondary bg-secondary/5 scale-[0.99]'
                          : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                      }`}
                    >
                      <UploadCloud className="w-10 h-10 text-primary mx-auto mb-3" />
                      <p className="font-sans text-sm font-semibold text-gray-800 mb-1">
                        Glissez-déposez vos relevés ou pièces justificatives ici
                      </p>
                      <p className="font-sans text-xs text-gray-400">
                        Ou cliquez pour parcourir vos fichiers locaux (PDF, JPEG, Excel, Word max 10MB)
                      </p>
                    </div>
                  </div>

                  {/* Document Inventory List */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-display font-bold text-gray-800 text-sm">
                        Documents de l'exercice en cours :
                      </h5>
                      <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/25 px-2.5 py-0.5 rounded-full font-bold">
                        {uploadedFiles.length} fichiers disponibles
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto border border-gray-100 rounded-xl p-2 bg-gray-50">
                      {uploadedFiles.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                          Aucun document disponible pour le moment.
                        </div>
                      ) : (
                        uploadedFiles.map((file) => (
                          <div
                            key={file.name}
                            className="bg-white p-3.5 rounded-lg border border-gray-100 flex justify-between items-center text-xs group hover:border-primary transition-all"
                          >
                            <div className="flex items-center gap-3 text-left">
                              <div className="p-2 bg-primary/10 rounded text-primary">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <h6 className="font-sans font-bold text-gray-800 truncate max-w-[240px] sm:max-w-[340px]">
                                  {file.name}
                                </h6>
                                <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                                  {file.size} — Mis en ligne le {file.date}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition-colors"
                                title="Télécharger"
                                onClick={() => alert(`Téléchargement simulé de ${file.name}`)}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Supprimer"
                                onClick={() => handleDeleteFile(file.name)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 text-center text-xs text-gray-400 shrink-0">
              Cabinet RM Consulting — Encrypté selon les standards bancaires de sécurité.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
