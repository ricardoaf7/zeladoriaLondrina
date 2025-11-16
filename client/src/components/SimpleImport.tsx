import React, { useState, useRef } from 'react';

interface SimpleImportProps {
  onImport: (data: any[]) => void;
  className?: string;
}

export const SimpleImport: React.FC<SimpleImportProps> = ({ onImport, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportStatus('error');
      setMessage('Por favor, selecione um arquivo CSV');
      return;
    }

    setImportStatus('processing');
    setMessage('Processando arquivo...');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        
        // Pular cabeçalho se existir
        const startIndex = lines[0]?.toLowerCase().includes('endereco') ? 1 : 0;
        const areas = [];
        
        for (let i = startIndex; i < lines.length && i < 50; i++) { // Limitar a 50 linhas
          const line = lines[i].trim();
          if (!line) continue;
          
          // Parse simples CSV
          const parts = line.split(',').map(part => part.trim().replace(/"/g, ''));
          
          if (parts.length >= 4) {
            const area = {
              id: Date.now() + i,
              endereco: parts[0] || 'Endereço não informado',
              bairro: parts[1] || 'Bairro não informado',
              tipo: parts[2] || 'area_publica',
              metragem_m2: parseFloat(parts[3]) || 0,
              lat: parseFloat(parts[4]) || -23.3045 + (Math.random() - 0.5) * 0.02,
              lng: parseFloat(parts[5]) || -51.1692 + (Math.random() - 0.5) * 0.02,
              status: parts[6] || 'pendente',
              observacoes: parts[7] || 'Importado via CSV'
            };
            
            areas.push(area);
          }
        }
        
        if (areas.length > 0) {
          onImport(areas);
          setImportStatus('success');
          setMessage(`✅ ${areas.length} áreas importadas com sucesso!`);
        } else {
          setImportStatus('error');
          setMessage('❌ Nenhuma área válida encontrada no arquivo');
        }
        
      } catch (error) {
        setImportStatus('error');
        setMessage('❌ Erro ao processar arquivo: ' + (error as Error).message);
      }
    };
    
    reader.onerror = () => {
      setImportStatus('error');
      setMessage('❌ Erro ao ler arquivo');
    };
    
    reader.readAsText(file);
  };

  const handleOCRText = (text: string) => {
    if (!text.trim()) return;
    
    setImportStatus('processing');
    setMessage('Processando texto OCR...');
    
    try {
      const lines = text.split('\n').filter(line => line.trim());
      const areas = [];
      
      for (let i = 0; i < lines.length && i < 50; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse simples - tentar extrair informações básicas
        const area = {
          id: Date.now() + i,
          endereco: line.substring(0, 50) || 'Endereço extraído',
          bairro: 'Centro',
          tipo: 'area_publica',
          metragem_m2: Math.floor(Math.random() * 1000) + 100,
          lat: -23.3045 + (Math.random() - 0.5) * 0.02,
          lng: -51.1692 + (Math.random() - 0.5) * 0.02,
          status: 'pendente',
          observacoes: 'Importado via OCR'
        };
        
        areas.push(area);
      }
      
      if (areas.length > 0) {
        onImport(areas);
        setImportStatus('success');
        setMessage(`✅ ${areas.length} áreas processadas do OCR!`);
      } else {
        setImportStatus('error');
        setMessage('❌ Nenhuma área válida encontrada no texto');
      }
      
    } catch (error) {
      setImportStatus('error');
      setMessage('❌ Erro ao processar texto: ' + (error as Error).message);
    }
  };

  const resetStatus = () => {
    setImportStatus('idle');
    setMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`p-6 bg-white rounded-lg shadow-lg ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Importar Dados</h2>
      
      {/* Upload de CSV */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Upload de CSV</h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          <p className="text-gray-600 mb-2">Arraste e solte o arquivo CSV aqui</p>
          <p className="text-sm text-gray-500 mb-4">ou</p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={importStatus === 'processing'}
          >
            Escolher Arquivo
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
      
      {/* Importação via OCR */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Texto OCR</h3>
        
        <textarea
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Cole aqui o texto extraído do OCR..."
          onBlur={(e) => {
            if (e.target.value.trim()) {
              handleOCRText(e.target.value);
            }
          }}
        />
        
        <p className="text-sm text-gray-500 mt-2">
          Cole o texto e clique fora da caixa para processar
        </p>
      </div>
      
      {/* Status da importação */}
      {importStatus !== 'idle' && (
        <div className={`p-4 rounded-lg mb-4 ${
          importStatus === 'success' ? 'bg-green-50 border border-green-200' :
          importStatus === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${
              importStatus === 'success' ? 'text-green-800' :
              importStatus === 'error' ? 'text-red-800' :
              'text-blue-800'
            }`}>
              {message}
            </p>
            
            {importStatus !== 'processing' && (
              <button
                onClick={resetStatus}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {importStatus === 'processing' && (
            <div className="mt-2">
              <div className="animate-pulse bg-blue-200 h-2 rounded"></div>
            </div>
          )}
        </div>
      )}
      
      {/* Formato esperado */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">Formato esperado do CSV:</h4>
        <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
          endereco, bairro, tipo, metragem_m2, latitude, longitude, status
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Exemplo: "Rua Paraná, 123", "Centro", "area_publica", "500", "-23.3045", "-51.1692", "pendente"
        </p>
      </div>
    </div>
  );
};

export default SimpleImport;