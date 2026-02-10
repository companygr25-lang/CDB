
import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Package, User, MapPin } from 'lucide-react';
import { DeliveryRecord } from '../types';

interface DeliveryHistoryProps {
  records: DeliveryRecord[];
}

const DeliveryHistory: React.FC<DeliveryHistoryProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filtered = records.filter(r => 
    r.motorista.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.rota.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.dataProcessamento.localeCompare(a.dataProcessamento));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar por motorista, rota ou placa..." 
          className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-medium"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data/Frota</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Equipe</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rota/Carga</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Entregas</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentData.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">{r.dataProcessamento.split('-').reverse().join('/')}</span>
                      <span className="text-[10px] font-bold text-blue-600 uppercase mt-1 px-2 py-0.5 bg-blue-50 rounded-md w-fit">{r.placa}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{r.motorista}</span>
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">Ajud.: {r.ajudantes || 'Nenhum'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                        <MapPin size={12} className="text-slate-400" /> {r.rota}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mt-1">
                        <Package size={12} /> {r.carga}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{r.entregas}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-sm font-black text-emerald-600">R$ {r.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"><ChevronLeft size={18} /></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryHistory;
