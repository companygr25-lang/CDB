
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Upload as UploadIcon, 
  Truck, 
  PlusCircle, 
  Menu,
  X,
  Trash2,
  AlertCircle
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Uploader from './components/Uploader';
import ManualEntry from './components/ManualEntry';
import { DeliveryRecord, Occurrence, ViewType } from './types';

const App: React.FC = () => {
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Filtro de Mês Global
  const today = new Date();
  const [activeMonth, setActiveMonth] = useState(today.toISOString().substring(0, 7));

  useEffect(() => {
    const savedRecords = localStorage.getItem('cbd_entregas_data');
    const savedOccurrences = localStorage.getItem('cbd_entregas_occurrences');
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (e) {
        console.error("Erro ao carregar registros", e);
      }
    }
    if (savedOccurrences) {
      try {
        setOccurrences(JSON.parse(savedOccurrences));
      } catch (e) {
        console.error("Erro ao carregar ocorrências", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cbd_entregas_data', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('cbd_entregas_occurrences', JSON.stringify(occurrences));
  }, [occurrences]);

  const handleAddRecords = (newRecords: DeliveryRecord[]) => {
    setRecords(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const filteredNew = newRecords.filter(r => !existingIds.has(r.id));
      return [...prev, ...filteredNew];
    });
  };

  const handleUpdateRecord = (updatedRecord: DeliveryRecord) => {
    setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleAddOccurrence = (occurrence: Occurrence) => {
    setOccurrences(prev => [...prev, occurrence]);
  };

  const handleClearAllData = () => {
    setRecords([]);
    setOccurrences([]);
    localStorage.removeItem('cbd_entregas_data');
    localStorage.removeItem('cbd_entregas_occurrences');
    setShowClearConfirm(false);
    alert("Todos os dados foram apagados com sucesso.");
  };

  // Estatísticas filtradas pelo mês ativo para o cabeçalho
  const filteredStats = useMemo(() => {
    const rCount = records.filter(r => r.dataProcessamento.startsWith(activeMonth)).length;
    const oCount = occurrences.filter(o => o.data.startsWith(activeMonth)).length;
    return { rCount, oCount };
  }, [records, occurrences, activeMonth]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'manual', label: 'Lançar Carga Extra', icon: <PlusCircle size={20} /> },
    { id: 'upload', label: 'Importar Planilha/Foto', icon: <UploadIcon size={20} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Apagar Tudo?</h3>
              <p className="text-sm text-slate-500 font-medium mb-8">Esta ação é irreversível e apagará todos os registros acumulados e ocorrências do banco de dados local.</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-sm uppercase">Cancelar</button>
                <button onClick={handleClearAllData} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-sm uppercase shadow-lg shadow-red-600/20">Limpar Banco</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button 
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transition-transform md:relative md:translate-x-0 border-r border-slate-800
      `}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20">
              <Truck size={24} />
            </div>
            <div>
              <h1 className="font-black text-xl text-white tracking-tighter leading-none">CBD</h1>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mt-1">Logística & BI</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as ViewType);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm
                  ${currentView === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'hover:bg-slate-800 hover:text-white'}
                `}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800 space-y-4">
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-red-600/20"
            >
              <Trash2 size={16} /> Limpar Todos os Dados
            </button>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">CBD Entregas v1.0</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight capitalize">
            {currentView === 'dashboard' ? 'Painel de Controle' : currentView === 'manual' ? 'Lançar Carga Extra' : 'Importar Dados'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-slate-100 rounded-full px-4 py-1.5 text-[10px] font-black text-slate-600 border border-slate-200 uppercase tracking-widest">
               {filteredStats.rCount} Registros | {filteredStats.oCount} Ocorrências no Mês
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {currentView === 'dashboard' && (
            <Dashboard 
              records={records} 
              occurrences={occurrences} 
              onAddOccurrence={handleAddOccurrence} 
              onDeleteRecord={handleDeleteRecord}
              onAddRecords={handleAddRecords} 
              onUpdateRecord={handleUpdateRecord}
              activeMonth={activeMonth}
              setActiveMonth={setActiveMonth}
            />
          )}
          {currentView === 'manual' && <ManualEntry onSave={(record) => handleAddRecords([record])} />}
          {currentView === 'upload' && <Uploader onDataImported={handleAddRecords} />}
        </div>
      </main>
    </div>
  );
};

export default App;
