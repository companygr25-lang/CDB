
import React, { useState } from 'react';
import { Save, User, Calendar, CheckCircle2 } from 'lucide-react';
import { DeliveryRecord } from '../types';

interface MassEntryProps {
  onSave: (records: DeliveryRecord[]) => void;
}

const DRIVERS_CASA = [
  "AGILSON PINTO DA SILVA", "ALDO CESAR MONTEIRO DA SILVA", "CLAUDEMIR ELIAS DA SILVA", 
  "CLEBERSON SOARES DE AQUINO", "JADSON RODRIGO CAVALCANTI DE LIMA", "JOAO MARCELO DA SILVA CARNEIRO", 
  "JOSENILDO DE SOUZA PIMENTEL", "LUIZ ARNALDO ARAUJO DA SILVA", "VALDIR DE BARROS"
].sort();

const DRIVERS_AGREGADOS = [
  "AILTON VENANCIO", "EDGAR", "FABIO VITALINO", "FELIZBERTO HUMBERTO", "FRANCISCO", "GEAN", 
  "HERMES DA FONSECA", "IVALDO DE FREITAS", "IVAN MARINHO", "JOÃO MARCOS", "JOSE CESAR", 
  "JOSE IVAN", "JOSENILDO BARRETO", "JUCIELIO EDUARDO", "LIVIO ARCOVERDE", "LUCIANO FERREIRA", 
  "MAJOR", "ROBENILSON", "TIAGO", "VICENTE"
].sort();

const MassEntry: React.FC<MassEntryProps> = ({ onSave }) => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [entries, setEntries] = useState<Record<string, { entregas: string, valor: string }>>({});

  const handleInputChange = (driver: string, field: 'entregas' | 'valor', value: string) => {
    setEntries(prev => ({
      ...prev,
      [driver]: {
        ...prev[driver],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fix: Explicitly cast Object.entries to allow accessing properties on 'data'
    const entryList = Object.entries(entries) as [string, { entregas: string; valor: string }][];

    const newRecords: DeliveryRecord[] = entryList
      .filter(([_, data]) => (parseInt(data.entregas) || 0) > 0)
      .map(([driver, data], index) => ({
        id: btoa(`mass-${driver}-${date}-${Date.now()}-${index}`),
        dataProcessamento: date,
        motorista: driver,
        placa: '---',
        ajudantes: '',
        rota: 'LANÇAMENTO RÁPIDO',
        carga: '---',
        entregas: parseInt(data.entregas) || 0,
        valor: parseFloat(data.valor.replace(',', '.')) || 0,
        mes: date.substring(0, 7)
      }));

    if (newRecords.length === 0) {
      alert("Nenhum dado válido para salvar.");
      return;
    }

    onSave(newRecords);
    setEntries({});
    alert(`${newRecords.length} lançamentos realizados com sucesso!`);
  };

  const renderDriverList = (title: string, list: string[], colorClass: string) => (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 border-l-4 border-slate-200">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map(name => (
          <div key={name} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
            <div className="flex-1 min-w-0 pr-4">
              <h5 className="font-black text-slate-700 uppercase text-[10px] truncate">{name}</h5>
              <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Lançamento de {date.split('-').reverse().join('/')}</p>
            </div>
            <div className="flex gap-2">
              <div className="w-16">
                <input 
                  type="number" 
                  placeholder="Qtd" 
                  value={entries[name]?.entregas || ''}
                  onChange={(e) => handleInputChange(name, 'entregas', e.target.value)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-center focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
              <div className="w-20">
                <input 
                  type="text" 
                  placeholder="Valor R$" 
                  value={entries[name]?.valor || ''}
                  onChange={(e) => handleInputChange(name, 'valor', e.target.value)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-center focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20"><CheckCircle2 size={24}/></div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Lançamento em Lote</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Alimente vários motoristas simultaneamente</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data do Lançamento:</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {renderDriverList("Motoristas da Casa", DRIVERS_CASA, "blue")}
        {renderDriverList("Equipe Agregada", DRIVERS_AGREGADOS, "slate")}

        <div className="sticky bottom-6 left-0 right-0 z-20 flex justify-center">
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase shadow-2xl shadow-blue-500/40 transition-all flex items-center gap-3 hover:scale-105 active:scale-95"
          >
            <Save size={20} /> Salvar Todos os Lançamentos
          </button>
        </div>
      </form>
    </div>
  );
};

export default MassEntry;
