import { useState } from 'react';

import { toast } from 'sonner';
import { parseCsv, chunk } from '../lib/csv';

export default function ImportCSV() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== MUDANÇA DE ARQUIVO ===');
    const selectedFile = e.target.files?.[0];
    console.log('Arquivo selecionado:', selectedFile);
    
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV válido');
        return;
      }
      console.log('Arquivo válido, definindo estado...');
      setFile(selectedFile);
    } else {
      console.log('Nenhum arquivo selecionado');
    }
  };

  const processCSV = async (content: string) => {
    const items = parseCsv(content)
    const total = items.length
    toast.info(`Processando ${total} linhas...`)
    const batches = chunk(items, 50)
    let processed = 0
    const apiBase = import.meta.env.VITE_API_BASE_URL || window.location.origin
    for (let i = 0; i < batches.length; i++) {
      const batchData = batches[i]
      if (batchData.length === 0) continue
      try {
        const response = await fetch(`${apiBase}/api/import-batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: batchData })
        })
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Erro ao importar lote: ${response.status} ${response.statusText} ${errorText}`)
        }
        await response.json()
        processed += batchData.length
        const progressPercent = Math.round((processed / total) * 100)
        setProgress(progressPercent)
        toast.success(`Processado ${processed} de ${total} linhas`)
      } catch (error) {
        toast.error(`Erro ao processar lote: ${error}`)
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    return processed
  }

  const handleUpload = async () => {
    console.log('=== INICIANDO UPLOAD ===');
    if (!file) {
      toast.error('Por favor, selecione um arquivo CSV');
      return;
    }

    console.log('Arquivo selecionado:', file.name, 'Tamanho:', file.size, 'bytes');
    setIsUploading(true);
    setProgress(0);

    try {
      const reader = new FileReader();
      
      reader.onloadstart = () => {
        console.log('FileReader: início da leitura');
      };
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentLoaded = Math.round((event.loaded / event.total) * 100);
          console.log(`Progresso de leitura: ${percentLoaded}%`);
        }
      };
      
      reader.onload = async (e) => {
        console.log('FileReader: arquivo lido com sucesso');
        try {
          const content = e.target?.result as string;
          console.log(`Conteúdo lido: ${content.length} caracteres`);
          
          const processed = await processCSV(content);
          toast.success(`Importação concluída! ${processed} linhas processadas com sucesso.`);
          setFile(null);
        } catch (error) {
          toast.error('Erro durante a importação');
          console.error('Erro:', error);
        } finally {
          setIsUploading(false);
          setProgress(0);
        }
      };
      
      reader.onerror = () => {
        console.error('FileReader erro:', reader.error);
        toast.error('Erro ao ler arquivo: ' + reader.error);
        setIsUploading(false);
      };
      
      console.log('Iniciando leitura do arquivo...');
      reader.readAsText(file, 'UTF-8');
    } catch (error) {
      console.error('Erro ao preparar leitura do arquivo:', error);
      toast.error('Erro ao ler o arquivo');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Importar Dados CSV</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Selecione o arquivo CSV com os dados das áreas de roçagem. 
              O sistema irá processar automaticamente todas as linhas.
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
                disabled={isUploading}
              />
              
              <label
                htmlFor="csv-upload"
                className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {file ? 'Trocar arquivo' : 'Selecionar CSV'}
              </label>
              
              {file && (
                <p className="mt-2 text-sm text-gray-500">
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>
          </div>

          {isUploading && (
            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                {progress}% concluído
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isUploading}
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`px-6 py-2 rounded-md text-white font-medium ${
                !file || isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isUploading ? 'Importando...' : 'Importar Dados'}
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Formato esperado do CSV:</h3>
            <p className="text-sm text-blue-800">
              O arquivo deve conter as colunas: id,ordem,sequencia_cadastro,tipo,endereco,bairro,metragem_m2,lat,lng,lote,status,history,polygon,scheduled_date,proxima_previsao,ultima_rocagem,manual_schedule,days_to_complete,servico,registrado_por,data_registro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
