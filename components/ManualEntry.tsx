
import React, { useState } from 'react';
import { Save, Plus, Package, User, MapPin, Truck, Hash, DollarSign } from 'lucide-react';
import { DeliveryRecord } from '../types';

interface ManualEntryProps {
  onSave: (record: DeliveryRecord) => void;
}

const DRIVERS_CASA = [
  "AGILSON PINTO DA SILVA",
  "ALDO CESAR MONTEIRO DA SILVA",
  "CLAUDEMIR ELIAS DA SILVA",
  "CLEBERSON SOARES DE AQUINO",
  "JADSON RODRIGO CAVALCANTI DE LIMA",
  "JOAO MARCELO DA SILVA CARNEIRO",
  "JOSENILDO DE SOUZA PIMENTEL",
  "LUIZ ARNALDO ARAUJO DA SILVA",
  "VALDIR DE BARROS"
].sort();

const DRIVERS_AGREGADOS = [
  "AILTON VENANCIO",
  "EDGAR",
  "FABIO VITALINO",
  "FELIZBERTO HUMBERTO",
  "FRANCISCO",
  "GEAN",
  "HERMES DA FONSECA",
  "IVALDO DE FREITAS",
  "IVAN MARINHO",
  "JOÃO MARCOS",
  "JOSE CESAR",
  "JOSE IVAN",
  "JOSENILDO BARRETO",
  "JUCIELIO EDUARDO",
  "LIVIO ARCOVERDE",
  "LUCIANO FERREIRA",
  "MAJOR",
  "ROBENILSON",
  "TIAGO",
  "VICENTE"
].sort();

const ALL_DRIVERS = [...DRIVERS_CASA, ...DRIVERS_AGREGADOS];

const InputField = ({ label, name, icon: Icon, placeholder, type = "text", value, onChange, isSelect = false }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <Icon size={18} />
      </div>
      {isSelect ? (
        <select
          name={name}
          required
          value={value}
          onChange={onChange}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none font-medium text-slate-800"
        >
          <optgroup label="MOTORISTAS DA CASA">
            {DRIVERS_CASA.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </optgroup>
          <optgroup label="MOTORISTAS AGREGADOS">
            {DRIVERS_AGREGADOS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </optgroup>
        </select>
      ) : (
        <input
          name={name}
          required
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800"
        />
      )}
    </div>
  </div>
);

const ManualEntry: React.FC<ManualEntryProps> = ({ onSave }) => {
  const [formData, setFormData] = useState({
    placa: '',
    motorista: ALL_DRIVERS[0],
    ajudantes: '',
    rota: '',
    carga: '',
    entregas: '',
    valor: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const id = btoa(`${formData.motorista}-${formData.placa}-${Date.now()}`);
    
    onSave({
      ...formData,
      id,
      dataProcessamento: today,
      entregas: parseInt(formData.entregas) || 0,
      valor: parseFloat(formData.valor.replace(',', '.')) || 0,
      mes: today.substring(0, 7)
    });

    setFormData({
      placa: '',
      motorista: ALL_DRIVERS[0],
      ajudantes: '',
      rota: '',
      carga: '',
      entregas: '',
      valor: ''
    });

    alert("Carga extra lançada e acumulada com sucesso!");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <h3 className="text-2xl font-black tracking-tight">Lançar Carga Extra</h3>
          <p className="text-slate-400 text-sm mt-1 font-medium">As informações serão acumuladas no histórico do motorista.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Selecionar Motorista" 
              name="motorista" 
              icon={User} 
              isSelect 
              value={formData.motorista}
              onChange={handleChange}
            />
            <InputField 
              label="Placa" 
              name="placa" 
              icon={Hash} 
              placeholder="Ex: BRA2E19" 
              value={formData.placa}
              onChange={handleChange}
            />
            <InputField 
              label="Ajudante" 
              name="ajudantes" 
              icon={Plus} 
              placeholder="Nome do ajudante" 
              value={formData.ajudantes}
              onChange={handleChange}
            />
            <InputField 
              label="Rota" 
              name="rota" 
              icon={MapPin} 
              placeholder="Ex: Recife Sul" 
              value={formData.rota}
              onChange={handleChange}
            />
            <InputField 
              label="Tipo de Carga" 
              name="carga" 
              icon={Package} 
              placeholder="Ex: Alimentos" 
              value={formData.carga}
              onChange={handleChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField 
                label="Entregas" 
                name="entregas" 
                icon={Truck} 
                placeholder="0" 
                type="number" 
                value={formData.entregas}
                onChange={handleChange}
              />
              <InputField 
                label="Valor R$" 
                name="valor" 
                icon={DollarSign} 
                placeholder="0,00" 
                value={formData.valor}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Save size={24} />
              Lançar Carga Extra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualEntry;
