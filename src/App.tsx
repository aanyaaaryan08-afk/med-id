import { useState, useEffect, useCallback } from 'react';
import { type PageId, type Consultation, type ConsultationItem } from '@/types';
import { DEMO_MED_ID, consultations as initialConsultations, patient as demoPatient, allergies as demoAllergies, conditions as demoConditions, medications as demoMedications, surgeries as demoSurgeries, tests as demoTests } from '@/data';
import { fetchConsultations } from '@/lib/consultations';
import { fetchItemsForPatient } from '@/lib/consultationItems';
import { fetchPatient, type PatientRecords, patientExists } from '@/lib/patients';
import { fetchDocumentsForPatient, type ConsultationDocument } from '@/lib/documents';
import { supabaseConfigError } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { Landing } from '@/pages/Landing';
import { Dashboard } from '@/pages/Dashboard';
import { EmergencyPage, EmergencyMode, EmergencyAccess } from '@/pages/Emergency';
import { Timeline } from '@/pages/Timeline';
import { Consultations } from '@/pages/Consultations';
import { Medications } from '@/pages/Medications';
import { Records } from '@/pages/Records';
import { Documents } from '@/pages/Documents';
import { DoctorAccess } from '@/pages/DoctorAccess';
import { Bracelet } from '@/pages/Bracelet';
import { DoctorLogin } from '@/pages/DoctorLogin';
import { DoctorDashboard } from '@/pages/DoctorDashboard';
import { Register } from '@/pages/Register';
import { AlertCircle, RefreshCw } from 'lucide-react';

type Screen = 'landing' | 'app' | 'doctor-access' | 'doctor-login' | 'doctor-portal' | 'emergency-access' | 'register';

interface ActivePatientData {
  records: PatientRecords;
  consultations: Consultation[];
  latestConsultation: Consultation | null;
  consultationItems: ConsultationItem[];
  documents: ConsultationDocument[];
}

const DEMO_DATA: ActivePatientData = {
  records: {
    patient: demoPatient,
    allergies: demoAllergies,
    conditions: demoConditions,
    medications: demoMedications,
    surgeries: demoSurgeries,
    tests: demoTests,
  },
  consultations: initialConsultations,
  latestConsultation: initialConsultations[0] ?? null,
  consultationItems: [],
  documents: [],
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [page, setPage] = useState<PageId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState('');
  const [previousScreen, setPreviousScreen] = useState<Screen>('landing');
  const [activeMedId, setActiveMedId] = useState(DEMO_MED_ID);
  const [isDemoPatient, setIsDemoPatient] = useState(true);
  const [activeData, setActiveData] = useState<ActivePatientData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadPatientData = useCallback(async (medId: string) => {
    setDataLoading(true);
    setLoadError('');

    if (supabaseConfigError) {
      setLoadError(supabaseConfigError);
      setDataLoading(false);
      return;
    }

    try {
      const records = await fetchPatient(medId);
      if (!records) {
        setActiveData(null);
        setLoadError('Patient record not found. Please verify your MED-ID and try again.');
        setDataLoading(false);
        return;
      }

      // Fetch secondary data in parallel — each returns [] on error, never throws
      const [consultations, consultationItems, documents] = await Promise.all([
        fetchConsultations(medId),
        fetchItemsForPatient(medId),
        fetchDocumentsForPatient(medId),
      ]);

      const latest = consultations.length > 0 ? consultations[0] : null;
      setActiveData({ records, consultations, latestConsultation: latest, consultationItems, documents });
    } catch {
      setActiveData(null);
      setLoadError('Could not load your medical profile. Please check your connection and try again.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (screen === 'app' && activeMedId) {
      loadPatientData(activeMedId);
    }
  }, [screen, activeMedId, loadPatientData]);

  const handleAccess = (id: string) => {
    setLoading(true);
    setActiveMedId(id);
    setIsDemoPatient(id === DEMO_MED_ID);
    setTimeout(() => {
      setScreen('app');
      setPage('dashboard');
      setLoading(false);
    }, 600);
  };

  const handleDoctorAccess = (id: string) => {
    setLoading(true);
    void id;
    setTimeout(() => {
      setScreen('app');
      setPage('dashboard');
      setLoading(false);
    }, 600);
  };

  const handleDoctorLogin = (id: string) => {
    setDoctorId(id);
    setScreen('doctor-portal');
  };

  const handleDoctorLogout = () => {
    setDoctorId('');
    setScreen('landing');
  };

  const handleLogout = () => {
    setScreen('landing');
    setPage('dashboard');
    setSidebarOpen(false);
    setActiveMedId(DEMO_MED_ID);
    setIsDemoPatient(true);
    setActiveData(null);
    setLoadError('');
  };

  const handleNavigate = (p: PageId) => {
    setPage(p);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEmergencyButton = () => {
    setPreviousScreen(screen);
    setScreen('emergency-access');
  };

  const handleEmergencyAccess = async (medId: string) => {
    const exists = await patientExists(medId);
    if (!exists) return;
    setActiveMedId(medId);
    setIsDemoPatient(medId === DEMO_MED_ID);
    await loadPatientData(medId);
    setEmergencyMode(true);
    setScreen(previousScreen);
  };

  const handleEmergencyAccessCancel = () => {
    setScreen(previousScreen);
  };

  const handleRegisterDone = (medId: string) => {
    setActiveMedId(medId);
    setIsDemoPatient(false);
    setScreen('app');
    setPage('dashboard');
  };

  useEffect(() => {
    if (emergencyMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [emergencyMode]);

  // Emergency Access is a standalone screen
  if (screen === 'emergency-access') {
    return (
      <EmergencyAccess
        onAccess={handleEmergencyAccess}
        onCancel={handleEmergencyAccessCancel}
      />
    );
  }

  if (screen === 'register') {
    return (
      <Register
        onDone={handleRegisterDone}
        onBack={() => setScreen('landing')}
      />
    );
  }

  if (screen === 'landing') {
    return (
      <>
        <Landing
          onAccess={handleAccess}
          onEmergency={handleEmergencyButton}
          onDoctorPortal={() => setScreen('doctor-login')}
          onRegister={() => setScreen('register')}
        />
        {emergencyMode && activeData && <EmergencyMode patient={activeData.records.patient} allergies={activeData.records.allergies} conditions={activeData.records.conditions} medications={activeData.records.medications} surgeries={activeData.records.surgeries} onExit={() => setEmergencyMode(false)} />}
        {loading && <FullScreenLoader label="Opening medical profile…" />}
      </>
    );
  }

  if (screen === 'doctor-login') {
    return (
      <DoctorLogin
        onLogin={handleDoctorLogin}
        onBack={() => setScreen('landing')}
      />
    );
  }

  if (screen === 'doctor-portal') {
    return (
      <>
        <DoctorDashboard
          doctorId={doctorId}
          onLogout={handleDoctorLogout}
          onEmergency={handleEmergencyButton}
        />
        {emergencyMode && activeData && <EmergencyMode patient={activeData.records.patient} allergies={activeData.records.allergies} conditions={activeData.records.conditions} medications={activeData.records.medications} surgeries={activeData.records.surgeries} onExit={() => setEmergencyMode(false)} />}
      </>
    );
  }

  if (screen === 'doctor-access') {
    return (
      <div className="min-h-screen bg-ink-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <DoctorAccess onAccess={handleDoctorAccess} />
        </div>
        {loading && <FullScreenLoader label="Verifying credentials…" />}
      </div>
    );
  }

  // --- Patient portal ---

  // Config error screen
  if (supabaseConfigError && screen === 'app') {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center animate-scale-in">
          <div className="inline-grid place-items-center h-16 w-16 rounded-2xl bg-red-100 text-red-600 mb-4">
            <AlertCircle size={28} />
          </div>
          <h1 className="font-display text-xl font-bold text-ink-900">Connection Error</h1>
          <p className="text-sm text-ink-500 mt-2">{supabaseConfigError}</p>
          <button onClick={handleLogout} className="btn-primary mt-6">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Loading error screen (patient not found, network failure, etc.)
  if (screen === 'app' && loadError && !activeData && !dataLoading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center animate-scale-in">
          <div className="inline-grid place-items-center h-16 w-16 rounded-2xl bg-red-100 text-red-600 mb-4">
            <AlertCircle size={28} />
          </div>
          <h1 className="font-display text-xl font-bold text-ink-900">Unable to Load Profile</h1>
          <p className="text-sm text-ink-500 mt-2">{loadError}</p>
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={() => loadPatientData(activeMedId)} className="btn-primary">
              <RefreshCw size={16} /> Retry
            </button>
            <button onClick={handleLogout} className="btn-secondary">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use real data if loaded; fall back to demo data ONLY for the demo patient
  const currentData: ActivePatientData = activeData ?? (isDemoPatient ? DEMO_DATA : {
    records: {
      patient: { ...demoPatient, medId: activeMedId, name: 'Loading…' },
      allergies: [],
      conditions: [],
      medications: [],
      surgeries: [],
      tests: [],
    },
    consultations: [],
    latestConsultation: null,
    consultationItems: [],
    documents: [],
  });

  const sortedConsultations = [...currentData.consultations].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-ink-50 flex">
      <Sidebar
        active={page}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        patient={currentData.records.patient}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          page={page}
          onMenu={() => setSidebarOpen(true)}
          onEmergency={handleEmergencyButton}
        />

        <main className="flex-1 px-4 sm:px-6 py-6 max-w-6xl w-full mx-auto">
          {dataLoading ? (
            <div className="py-20 text-center">
              <div className="inline-block h-10 w-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
              <p className="text-sm text-ink-500 mt-3">Loading medical profile…</p>
            </div>
          ) : (
            <>
              {loadError && activeData && (
                <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2 animate-fade-in-fast">
                  <AlertCircle size={16} className="text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-700">{loadError}</p>
                  <button onClick={() => loadPatientData(activeMedId)} className="ml-auto btn-ghost text-sm text-amber-700 hover:bg-amber-100 px-2 py-1 shrink-0">
                    <RefreshCw size={14} /> Retry
                </button>
                </div>
              )}
              {page === 'dashboard' && <Dashboard patient={currentData.records.patient} allergies={currentData.records.allergies} conditions={currentData.records.conditions} medications={currentData.records.medications} latestConsultation={currentData.latestConsultation} onNavigate={handleNavigate} />}
              {page === 'emergency' && <EmergencyPage patient={currentData.records.patient} allergies={currentData.records.allergies} conditions={currentData.records.conditions} medications={currentData.records.medications} surgeries={currentData.records.surgeries} onEnterMode={handleEmergencyButton} />}
              {page === 'timeline' && <Timeline consultations={sortedConsultations} />}
              {page === 'consultations' && (
                <Consultations consultations={sortedConsultations} />
              )}
              {page === 'medications' && <Medications medications={currentData.records.medications} />}
              {page === 'records' && <Records allergies={currentData.records.allergies} conditions={currentData.records.conditions} surgeries={currentData.records.surgeries} tests={currentData.records.tests} consultationItems={currentData.consultationItems} />}
              {page === 'documents' && <Documents documents={currentData.documents} consultations={sortedConsultations} patient={currentData.records.patient} />}
              {page === 'doctor-access' && <DoctorAccess onAccess={handleDoctorAccess} />}
              {page === 'bracelet' && <Bracelet patient={currentData.records.patient} />}
            </>
          )}
        </main>
      </div>

      {emergencyMode && activeData && <EmergencyMode patient={currentData.records.patient} allergies={currentData.records.allergies} conditions={currentData.records.conditions} medications={currentData.records.medications} surgeries={currentData.records.surgeries} onExit={() => setEmergencyMode(false)} />}
      {loading && <FullScreenLoader label="Verifying credentials…" />}
    </div>
  );
}

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 z-[60] bg-white/80 backdrop-blur-sm grid place-items-center animate-fade-in-fast">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-ink-600">{label}</p>
      </div>
    </div>
  );
}
