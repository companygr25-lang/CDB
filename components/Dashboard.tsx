
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area, Legend
} from 'recharts';
import { Truck, Users, DollarSign, TrendingUp, Package, ArrowLeft, AlertTriangle, X, UserCheck, Hash, MapPin, Search, ListFilter, Trash2, AlertCircle, Calendar, Save, CheckCircle2, Info, ChevronDown, Edit3, CalendarDays, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DeliveryRecord, Occurrence } from '../types';

interface DashboardProps {
  records: DeliveryRecord[];
  occurrences: Occurrence[];
  onAddOccurrence: (occurrence: Occurrence) => void;
  onDeleteRecord: (id: string) => void;
  onAddRecords: (records: DeliveryRecord[]) => void;
  onUpdateRecord: (record: DeliveryRecord) => void;
  activeMonth: string;
  setActiveMonth: (month: string) => void;
}

const DRIVERS_CASA = [
  "AGILSON PINTO DA SILVA", "ALDO CESAR MONTEIRO DA SILVA", "CLAUDEMIR ELIAS DA SILVA", 
  "CLEBERSON SOARES de AQUINO", "JADSON RODRIGO CAVALCANTI DE LIMA", "JOAO MARCELO DA SILVA CARNEIRO", 
  "JOSENILDO DE SOUZA PIMENTEL", "LUIZ ARNALDO ARAUJO DA SILVA", "VALDIR DE BARROS"
].sort();

const DRIVERS_AGREGADOS = [
  "AILTON VENANCIO", "EDGAR", "FABIO VITALINO", "FELIZBERTO HUMBERTO", "FRANCISCO", "GEAN", 
  "HERMES DA FONSECA", "IVALDO DE FREITAS", "IVAN MARINHO", "JOÃO MARCOS", "JOSE CESAR", 
  "JOSE IVAN", "JOSENILDO BARRETO", "JUCIELIO EDUARDO", "LIVIO ARCOVERDE", "LUCIANO FERREIRA", 
  "MAJOR", "ROBENILSON", "TIAGO", "VICENTE"
].sort();

const Dashboard: React.FC<DashboardProps> = ({ 
  records, 
  occurrences, 
  onAddOccurrence, 
  onDeleteRecord, 
  onAddRecords, 
  onUpdateRecord,
  activeMonth,
  setActiveMonth
}) => {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [driverSearch, setDriverSearch] = useState('');
  const [showOccurrenceModal, setShowOccurrenceModal] = useState(false);
  const [calendarModalLoad, setCalendarModalLoad] = useState<DeliveryRecord | null>(null);
  
  const [occForm, setOccForm] = useState({
    tipo: 'Volta' as 'Volta' | 'Devolução',
    motivo: '',
    quantidade: '',
    valor: ''
  });

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    const todayStr = new Date().toISOString().substring(0, 7);
    months.add(todayStr);
    records.forEach(r => months.add(r.dataProcessamento.substring(0, 7)));
    occurrences.forEach(o => months.add(o.data.substring(0, 7)));
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [records, occurrences]);

  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const label = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  // BI: Tendência Histórica (Últimos 6 Meses)
  const historicalTrendData = useMemo(() => {
    const sortedMonths = [...availableMonths].reverse().slice(-6);
    return sortedMonths.map(m => {
      const mRecs = records.filter(r => r.dataProcessamento.startsWith(m));
      const mOccs = occurrences.filter(o => o.data.startsWith(m));
      const totalEntregas = mRecs.reduce((acc, curr) => acc + curr.entregas, 0);
      const totalVoltas = mOccs.reduce((acc, curr) => acc + curr.quantidade, 0);
      return {
        month: m.split('-').reverse().join('/'),
        entregas: totalEntregas - totalVoltas,
        voltas: totalVoltas
      };
    });
  }, [records, occurrences, availableMonths]);

  const stats = useMemo(() => {
    const filter = (data: any[], m: string) => data.filter(d => (d.dataProcessamento || d.data).startsWith(m));
    
    const currentRecs = filter(records, activeMonth);
    const currentOccs = filter(occurrences, activeMonth);

    // Comparação com mês anterior
    const prevMonthIndex = availableMonths.indexOf(activeMonth) + 1;
    const prevMonth = availableMonths[prevMonthIndex];
    const prevRecs = prevMonth ? filter(records, prevMonth) : [];
    const prevOccs = prevMonth ? filter(occurrences, prevMonth) : [];

    const calculateTotals = (recs: any[], occs: any[]) => {
      const bruto = recs.reduce((acc, curr) => acc + curr.entregas, 0);
      const voltas = occs.reduce((acc, curr) => acc + curr.quantidade, 0);
      const valBruto = recs.reduce((acc, curr) => acc + curr.valor, 0);
      const valVoltas = occs.reduce((acc, curr) => acc + curr.valor, 0);
      return { ok: bruto - voltas, v: voltas, liq: valBruto - valVoltas, loss: valVoltas };
    };

    const cur = calculateTotals(currentRecs, currentOccs);
    const pre = calculateTotals(prevRecs, prevOccs);

    const calcDelta = (c: number, p: number) => p === 0 ? 0 : ((c - p) / p) * 100;

    const allDrivers = [...DRIVERS_CASA, ...DRIVERS_AGREGADOS];
    const driverGroups = allDrivers.reduce((acc: any, nome) => {
      acc[nome] = {
        nome,
        totalEntregas: 0,
        totalOcorrencias: 0,
        totalValorBruto: 0,
        totalValorOcorrencias: 0,
        ultimoAjudante: '',
        ultimaRota: '',
        tipo: DRIVERS_CASA.includes(nome) ? 'Casa' : 'Agregado'
      };
      return acc;
    }, {});

    currentRecs.forEach(curr => {
      if (driverGroups[curr.motorista]) {
        driverGroups[curr.motorista].totalEntregas += curr.entregas;
        driverGroups[curr.motorista].totalValorBruto += curr.valor;
        if (curr.ajudantes) driverGroups[curr.motorista].ultimoAjudante = curr.ajudantes;
        if (curr.rota) driverGroups[curr.motorista].ultimaRota = curr.rota;
      }
    });

    currentOccs.forEach(occ => {
      if (driverGroups[occ.motorista]) {
        driverGroups[occ.motorista].totalOcorrencias += occ.quantidade;
        driverGroups[occ.motorista].totalValorOcorrencias += occ.valor;
      }
    });

    return { 
      cur, 
      deltas: {
        ok: calcDelta(cur.ok, pre.ok),
        v: calcDelta(cur.v, pre.v),
        liq: calcDelta(cur.liq, pre.liq),
        loss: calcDelta(cur.loss, pre.loss)
      },
      driverList: Object.values(driverGroups) 
    };
  }, [records, occurrences, activeMonth, availableMonths]);

  const uniqueLoads = useMemo(() => {
    if (!selectedDriver) return [];
    const driverRecs = records.filter(r => r.motorista === selectedDriver && r.dataProcessamento.startsWith(activeMonth));
    const seen = new Set();
    return driverRecs.filter(r => {
      const key = `${r.rota}-${r.carga}-${r.placa}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [records, selectedDriver, activeMonth]);

  const handleSaveOccurrence = () => {
    if (!selectedDriver || !occForm.motivo || !occForm.quantidade) {
      alert("Por favor, preencha o motivo e a quantidade.");
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const newOcc: Occurrence = {
      id: btoa(`occ-${selectedDriver}-${Date.now()}`),
      motorista: selectedDriver,
      data: today,
      tipo: occForm.tipo,
      motivo: occForm.motivo.toUpperCase(),
      quantidade: parseInt(occForm.quantidade) || 0,
      valor: parseFloat(occForm.valor.replace(',', '.')) || 0
    };
    onAddOccurrence(newOcc);
    setOccForm({ tipo: 'Volta', motivo: '', quantidade: '', valor: '' });
    setShowOccurrenceModal(false);
  };

  const DeltaTag = ({ val, inverse = false }: { val: number, inverse?: boolean }) => {
    if (val === 0) return null;
    const isPos = val > 0;
    const color = (isPos && !inverse) || (!isPos && inverse) ? 'emerald' : 'red';
    return (
      <span className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-${color}-50 text-${color}-600 border border-${color}-100 ml-2`}>
        {isPos ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
        {Math.abs(val).toFixed(0)}%
      </span>
    );
  };

  if (selectedDriver) {
    const driverData = (stats.driverList as any[]).find(d => d.nome === selectedDriver);
    const valLiq = (driverData?.totalValorBruto || 0) - (driverData?.totalValorOcorrencias || 0);

    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-10">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedDriver(null)} className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-all group">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Voltar ao Painel
          </button>
          <button onClick={() => setShowOccurrenceModal(true)} className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-amber-600 transition-colors">
            <AlertTriangle size={14} /> Lançar Ocorrência
          </button>
        </div>

        <div className="bg-white px-6 py-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <div className="flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${driverData?.tipo === 'Casa' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'} shadow-lg flex-shrink-0`}>
              <Users size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-slate-900 uppercase truncate leading-none mb-2">{driverData?.nome}</h2>
              <div className="flex gap-2">
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-900 text-white uppercase tracking-widest">{driverData?.tipo}</span>
                {driverData?.ultimoAjudante && <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 uppercase flex items-center gap-1 border border-emerald-100"><UserCheck size={10}/> {driverData.ultimoAjudante}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-8 sm:gap-12 text-center sm:text-right">
            <div><p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1.5 tracking-widest">Entregas</p><p className="text-2xl font-black text-blue-600 tracking-tighter">{(driverData?.totalEntregas || 0) - (driverData?.totalOcorrencias || 0)}</p></div>
            <div><p className="text-[9px] font-black text-amber-500 uppercase leading-none mb-1.5 tracking-widest">Voltas</p><p className="text-2xl font-black text-amber-500 tracking-tighter">{driverData?.totalOcorrencias || 0}</p></div>
            <div className="min-w-[100px]"><p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1.5 tracking-widest">Líquido</p><p className="text-2xl font-black text-emerald-600 tracking-tighter">R$ {valLiq.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Cargas de {formatMonthLabel(activeMonth)}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniqueLoads.map(load => (
              <div key={load.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"><Package size={18}/></div>
                  <div className="min-w-0">
                    <h4 className="font-black text-xs uppercase text-slate-800 truncate leading-none mb-1">{load.carga}</h4>
                    <p className="text-[8px] font-black text-slate-400 uppercase truncate flex items-center gap-1"><MapPin size={10} className="text-blue-400"/> {load.rota}</p>
                  </div>
                </div>
                <button onClick={() => setCalendarModalLoad(load)} className="p-3 bg-blue-600 text-white rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all">
                  <CalendarDays size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {showOccurrenceModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] overflow-hidden max-w-md w-full shadow-2xl animate-in zoom-in-95 border border-slate-200">
              <div className="bg-amber-500 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3"><AlertTriangle size={24} /><h3 className="text-base font-black uppercase">Nova Ocorrência</h3></div>
                <button onClick={() => setShowOccurrenceModal(false)} className="p-2 hover:bg-white/20 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                  <select value={occForm.tipo} onChange={(e) => setOccForm({...occForm, tipo: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none">
                    <option value="Volta">VOLTA</option>
                    <option value="Devolução">DEVOLUÇÃO</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivo</label>
                  <input type="text" placeholder="EX: AUSENTE" value={occForm.motivo} onChange={(e) => setOccForm({...occForm, motivo: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qtd</label>
                    <input type="number" placeholder="0" value={occForm.quantidade} onChange={(e) => setOccForm({...occForm, quantidade: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm text-blue-600 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor R$</label>
                    <input type="text" placeholder="0,00" value={occForm.valor} onChange={(e) => setOccForm({...occForm, valor: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm text-emerald-600 outline-none" />
                  </div>
                </div>
                <button onClick={handleSaveOccurrence} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4">Salvar Ocorrência</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Filtro Analítico */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20"><Calendar size={22} /></div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Histórico de Dados</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 tracking-tighter">Comparação Mensal e Visualização de BI</p>
          </div>
        </div>
        
        <div className="relative w-full sm:w-80 group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none group-hover:scale-110 transition-transform"><CalendarDays size={20} /></div>
          <select 
            value={activeMonth} 
            onChange={(e) => setActiveMonth(e.target.value)} 
            className="w-full pl-14 pr-12 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-sm text-slate-700 outline-none hover:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
          >
            {availableMonths.map(m => <option key={m} value={m}>{formatMonthLabel(m)}</option>)}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={20} /></div>
        </div>
      </div>

      {/* Cards de BI com Deltas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Package size={24}/>, label: "Entregas OK", val: stats.cur.ok, delta: stats.deltas.ok, color: "blue", prefix: "" },
          { icon: <AlertTriangle size={24}/>, label: "Voltas/Dev.", val: stats.cur.v, delta: stats.deltas.v, color: "amber", prefix: "", inv: true },
          { icon: <DollarSign size={24}/>, label: "Faturamento", val: stats.cur.liq, delta: stats.deltas.liq, color: "emerald", prefix: "R$ " },
          { icon: <Hash size={24}/>, label: "Perda/Abat.", val: stats.cur.loss, delta: stats.deltas.loss, color: "red", prefix: "R$ ", inv: true }
        ].map((c, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4 group hover:translate-y-[-4px] transition-all">
            <div className="flex justify-between items-start">
              <div className={`w-11 h-11 bg-${c.color}-50 text-${c.color}-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6`}>{c.icon}</div>
              <DeltaTag val={c.delta} inverse={c.inv} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 truncate">{c.label}</p>
              <h4 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                {c.prefix}{c.val.toLocaleString('pt-BR', {minimumFractionDigits: c.prefix ? 2 : 0, maximumFractionDigits: 2})}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* BI: Gráfico de Tendência para Comparação */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Tendência Mensal</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-tighter">Comparativo de performance nos últimos meses</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-blue-600"><div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div> Entregas OK</div>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-amber-500"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Voltas</div>
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOk" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="entregas" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorOk)" />
              <Area type="monotone" dataKey="voltas" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lista de Motoristas */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Gestão de Frotas Diária</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">Lançamentos de {formatMonthLabel(activeMonth)}</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Filtrar por nome..." value={driverSearch} onChange={(e) => setDriverSearch(e.target.value)} className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black outline-none w-full shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
          </div>
        </div>

        {[ 
          {title: "Motoristas da Casa", list: stats.driverList.filter((d:any) => d.tipo === 'Casa' && d.nome.toLowerCase().includes(driverSearch.toLowerCase()))}, 
          {title: "Equipe Agregada", list: stats.driverList.filter((d:any) => d.tipo === 'Agregado' && d.nome.toLowerCase().includes(driverSearch.toLowerCase()))} 
        ].map(sec => (
          sec.list.length > 0 && (
            <div key={sec.title} className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-3 border-l-4 border-blue-500 ml-1">{sec.title}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sec.list.map((d:any) => (
                  <button key={d.nome} onClick={() => setSelectedDriver(d.nome)} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-xl hover:translate-y-[-6px] transition-all text-left flex justify-between items-center group relative overflow-hidden">
                    <div className="min-w-0 pr-3 z-10">
                      <h5 className="font-black text-slate-800 uppercase text-[11px] truncate group-hover:text-blue-600 transition-colors leading-tight mb-2">{d.nome}</h5>
                      <p className="text-[9px] font-bold text-slate-400 uppercase truncate tracking-widest flex items-center gap-1"><MapPin size={10}/> {d?.ultimaRota || 'Pendente'}</p>
                    </div>
                    <div className="bg-slate-50 px-3 py-2.5 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all text-center min-w-[48px] z-10 shadow-sm">
                      <span className="text-base font-black tracking-tighter leading-none">{d.totalEntregas - d.totalOcorrencias}</span>
                      <p className="text-[7px] font-black uppercase opacity-60 mt-1 tracking-tighter">OK</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
