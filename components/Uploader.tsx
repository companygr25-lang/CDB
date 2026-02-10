
import React, { useState } from 'react';
import { FileText, Image as ImageIcon, AlertCircle, Loader2, FileSearch, Table } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { DeliveryRecord } from '../types';

interface UploaderProps {
  onDataImported: (records: DeliveryRecord[]) => void;
}

const Uploader: React.FC<UploaderProps> = ({ onDataImported }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const processImageFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { inlineData: { mimeType: file.type, data: base64Data } },
              { text: "Extraia desta planilha os seguintes campos: PLACA, MOTORISTA, AJUDANTE, ROTA, ENTREGAS (quantidade), CARGA (número da carga) e VALOR (financeiro). Retorne APENAS um JSON (array de objetos) com as chaves: motorista, placa, ajudantes, rota, entregas, carga, valor." }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                motorista: { type: Type.STRING },
                placa: { type: Type.STRING },
                ajudantes: { type: Type.STRING },
                rota: { type: Type.STRING },
                entregas: { type: Type.NUMBER },
                carga: { type: Type.STRING },
                valor: { type: Type.NUMBER }
              },
              required: ["motorista", "entregas", "rota"]
            }
          }
        }
      });

      const parsedData = JSON.parse(response.text || '[]');
      const today = new Date().toISOString().split('T')[0];
      
      const formattedRecords: DeliveryRecord[] = parsedData.map((item: any, i: number) => ({
        id: btoa(`img-${Date.now()}-${i}-${item.motorista}`),
        dataProcessamento: today,
        placa: (item.placa || '---').toUpperCase(),
        motorista: (item.motorista || 'DESCONHECIDO').toUpperCase().trim(),
        ajudantes: (item.ajudantes || '').toUpperCase().trim(),
        rota: (item.rota || 'GERAL').toUpperCase().trim(),
        carga: (item.carga || '---').toUpperCase(),
        entregas: item.entregas || 0,
        valor: item.valor || 0,
        mes: today.substring(0, 7)
      }));

      onDataImported(formattedRecords);
      alert(`${formattedRecords.length} registros (com rotas) extraídos e acumulados!`);
    } catch (err: any) {
      setError("Erro ao ler imagem. Verifique se as colunas MOTORISTA, ROTA e VALOR estão visíveis.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processExcelFile = (file: File) => {
    setIsProcessing(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const XLSX = (window as any).XLSX;
        const wb = XLSX.read(e.target?.result, { type: 'binary' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        
        if (data.length < 2) throw new Error("Planilha vazia.");

        const headers = data[0].map(h => String(h).toUpperCase().trim());
        const m = {
          placa: headers.findIndex(h => h === 'PLACA'),
          motorista: headers.findIndex(h => h === 'MOTORISTA'),
          ajudante: headers.findIndex(h => h === 'AJUDANTE'),
          rota: headers.findIndex(h => h === 'ROTA'),
          entregas: headers.findIndex(h => h === 'ENTREGAS'),
          carga: headers.findIndex(h => h === 'CARGA'),
          valor: headers.findIndex(h => h === 'VALOR')
        };

        if (m.motorista === -1 || m.entregas === -1) {
          throw new Error("Colunas obrigatórias não encontradas no Excel (MOTORISTA, ENTREGAS).");
        }

        const today = new Date().toISOString().split('T')[0];
        const res: DeliveryRecord[] = data.slice(1)
          .filter(row => row[m.motorista] && String(row[m.motorista]).trim() !== '')
          .map((row, i) => ({
            id: btoa(`exl-${file.name}-${i}-${row[m.motorista]}`),
            dataProcessamento: today,
            placa: String(row[m.placa] || '---').toUpperCase(),
            motorista: String(row[m.motorista]).toUpperCase().trim(),
            ajudantes: String(row[m.ajudante] || '').toUpperCase().trim(),
            rota: String(row[m.rota] || 'GERAL').toUpperCase().trim(),
            carga: String(row[m.carga] || '---').toUpperCase(),
            entregas: parseFloat(String(row[m.entregas] || '0')) || 0,
            valor: parseFloat(String(row[m.valor] || '0').replace(/[R$\s.]/g, '').replace(',', '.')) || 0,
            mes: today.substring(0, 7)
          }));

        onDataImported(res);
        alert(`${res.length} registros da planilha Excel acumulados com sucesso!`);
      } catch (err: any) {
        setError(err.message || "Erro ao processar Excel.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      processImageFile(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      processExcelFile(file);
    } else {
      setError("Formato não suportado. Use Excel ou Foto da Planilha.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden relative">
        <div className="bg-slate-900 -mx-8 -mt-8 p-8 mb-8 text-white text-center">
          <h3 className="text-2xl font-black tracking-tight uppercase">Alimentar Sistema CBD</h3>
          <p className="text-slate-400 text-sm mt-1 font-medium italic">Leitor de Fotos e Planilhas Diárias</p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
          <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Table size={14} /> Colunas Detectadas:
          </p>
          <p className="text-xs text-blue-600 font-bold">
            MOTORISTA | ROTA | PLACA | AJUDANTE | ENTREGAS | CARGA | VALOR
          </p>
        </div>

        <label className="group relative border-4 border-dashed border-slate-100 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer text-center p-12 rounded-[2rem] block">
          <div className="flex justify-center gap-4 mb-6">
            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={32} />
            </div>
            <div className="bg-amber-100 text-amber-600 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform delay-75">
              <ImageIcon size={32} />
            </div>
          </div>
          <h4 className="text-2xl font-black text-slate-800">Escolha o Arquivo</h4>
          <p className="text-slate-500 text-sm mt-3 font-medium">Selecione o Excel ou tire uma Foto da sua folha de controle.</p>
          <input type="file" className="hidden" accept=".xlsx,.xls,image/*" onChange={handleFileChange} />
        </label>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-50">
            <Loader2 className="animate-spin text-blue-600" size={56} />
            <div className="text-center">
              <p className="font-black text-slate-900 text-2xl">Lendo Dados...</p>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Extraindo Rota e Valores</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 flex items-center gap-4 font-bold animate-in zoom-in-95">
          <AlertCircle size={24} /> {error}
        </div>
      )}
    </div>
  );
};

export default Uploader;
