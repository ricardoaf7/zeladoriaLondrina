/**
 * OCR Import Page - Interface para upload e processamento de imagens
 * Importação de áreas de roçagem via OCR de imagens/planilhas
 */

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  Eye, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Image,
  Settings,
  History
} from "lucide-react";
import { toast } from "sonner";

interface OCRArea {
  tipo_item: string;
  endereco: string;
  bairro: string;
  metragem_m2: number;
  latitude?: number;
  longitude?: number;
  lote?: number;
  observacoes?: string;
}

interface ImportResult {
  total: number;
  processed: number;
  imported: number;
  errors: number;
  skipped: number;
  areas: OCRArea[];
  errors_detail: string[];
}

export default function OCRImport() {
  const [ocrText, setOcrText] = useState('');
  const [processedAreas, setProcessedAreas] = useState<OCRArea[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuração do dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => 
      file.type === 'image/jpeg' || 
      file.type === 'image/png' || 
      file.type === 'image/jpg' ||
      file.type === 'application/pdf'
    );

    if (validFiles.length !== acceptedFiles.length) {
      toast.error("Arquivos inválidos. Apenas imagens (JPG, PNG) e PDFs são aceitos");
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    // Processar arquivos imediatamente
    if (validFiles.length > 0) {
      processUploadedFiles(validFiles);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 10,
    disabled: isProcessing
  });

  // Processar arquivos enviados
  const processUploadedFiles = async (files: File[]) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Simular processamento OCR (em produção, usar biblioteca real)
      const mockOCRResult = generateMockOCRFromFiles(files);
      
      // Simular progresso
      for (let i = 0; i <= 100; i += 10) {
        setProcessingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setOcrText(mockOCRResult);
      
      // Processar texto OCR automaticamente
      await processOCRText(mockOCRResult);

      toast.success(`${files.length} arquivo(s) processado(s) com sucesso`);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao processar arquivos");
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  // Gerar mock OCR (em produção, usar biblioteca real como Tesseract)
  const generateMockOCRFromFiles = (files: File[]): string => {
    // Simular resultado OCR baseado nos dados que você forneceu
    return `tipo_item endereco bairro metragem_m2 latitude longitude lote observações
area publica av. jorge casoni - terminal rodoviario casoni 29.184,98 -23,3044206 -51,1531729 1
praça rua carijós c arruana paraná 2.332,83 -23,3043262 -51,1080607 1
area publica rua tapuias c/ oswaldo cruz casoni 500,00 -23,2959873 -51,1545458 1
canteiros av jorge casoni (alça lateral esquina rua guaranis ) casoni 452,16 -23,3028976 -51,1494082 1
viela jorge casoni (da casoni até saturnino de brito e rua sampaio vidal) casoni 908,80 -23,303 -51,149 1
praça vital brasil c oswaldo cruz kase 2.434,69 -23,296 -51,155 1
lote público icós são caetano 438,56 -23,297 -51,155 1
praça tietê c john kennedy recreio 1.915,41 -23,2953414 -51,1589755 1
area publica av. duque de caxias c/ r. caetano munhoz da rocha recreio 411,75 -23,3154575 -51,1551798 1
fundo de vale r. angelo vicentini (da maria i. v. teodoro até av. lucia h.g. viana) santa monica 7.195,78 -23,2866857 -51,1586495 1`;
  };

  // Processar texto OCR
  const processOCRText = async (text: string) => {
    if (!text.trim()) {
      toast({
        title: "Texto vazio",
        description: "Por favor, insira ou carregue um texto OCR",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/ocr/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ocrText: text,
          validateOnly: true
        }),
      });

      const result = await response.json();

      if (result.success) {
        setProcessedAreas(result.data.areas || []);
        setValidationErrors([]);
        
        toast({
          title: "Validação concluída",
          description: `${result.data.areas?.length || 0} áreas encontradas`
        });
      } else {
        setValidationErrors([result.message]);
        toast({
          title: "Erro na validação",
          description: result.message,
          variant: "destructive"
        });
      }

    } catch (error) {
      toast.error("Não foi possível conectar ao servidor");
    } finally {
      setIsProcessing(false);
    }
  };

  // Importar áreas para o Supabase
  const importAreas = async () => {
    if (processedAreas.length === 0) {
      toast({
        title: "Nenhuma área para importar",
        description: "Processe os dados OCR primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch('/api/ocr/areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          areas: processedAreas
        }),
      });

      const result = await response.json();

      if (result.success) {
        setImportResult(result.data);
        
        toast.success(`${result.data.imported} áreas importadas com sucesso`);
      } else {
        toast.error(result.message);
      }

    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Limpar todos os dados
  const clearAll = () => {
    setOcrText('');
    setProcessedAreas([]);
    setUploadedFiles([]);
    setImportResult(null);
    setValidationErrors([]);
    setProcessingProgress(0);
  };

  // Exportar dados processados
  const exportProcessedData = () => {
    const dataStr = JSON.stringify(processedAreas, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'areas_rocagem_processadas.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📸 Importação de Áreas por OCR
          </h1>
          <p className="text-gray-600 text-lg">
            Converta imagens de planilhas em dados estruturados para importação
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Texto Manual
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload de Imagens</CardTitle>
                <CardDescription>
                  Envie imagens de planilhas (JPG, PNG) ou PDFs com dados de roçagem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-4">
                    <Image className="w-12 h-12 text-gray-400" />
                    {isDragActive ? (
                      <p className="text-blue-600 font-medium">Solte os arquivos aqui...</p>
                    ) : (
                      <div>
                        <p className="text-gray-600 mb-2">
                          Arraste e solte imagens aqui, ou clique para selecionar
                        </p>
                        <p className="text-sm text-gray-500">
                          Formatos aceitos: JPG, PNG, PDF (máx. 10 arquivos)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Arquivos enviados:</h3>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="text-sm">{file.name}</span>
                          <Badge variant="outline">{Math.round(file.size / 1024)}KB</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600">Processando OCR...</span>
                    </div>
                    <Progress value={processingProgress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Texto OCR Manual</CardTitle>
                <CardDescription>
                  Cole o texto extraído do OCR aqui para processamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Cole aqui o texto OCR da planilha...\n\nExemplo:\ntipo_item endereco bairro metragem_m2 latitude longitude lote\narea publica av. jorge casoni casoni 29.184,98 -23,3044206 -51,1531729 1"
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  disabled={isProcessing}
                />
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => processOCRText(ocrText)}
                    disabled={!ocrText.trim() || isProcessing}
                    className="flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
                    ) : (
                      <><Eye className="w-4 h-4" /> Processar Texto</>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setOcrText('')}
                    disabled={isProcessing}
                  >
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Preview dos Dados</CardTitle>
                <CardDescription>
                  Visualize e valide os dados antes de importar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {processedAreas.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum dado processado ainda</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Faça upload de imagens ou cole texto OCR para visualizar aqui
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium">{processedAreas.length} áreas encontradas</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={exportProcessedData}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Exportar
                        </Button>
                        
                        <Button 
                          onClick={importAreas}
                          disabled={isImporting || processedAreas.length === 0}
                          className="flex items-center gap-2"
                        >
                          {isImporting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</>
                          ) : (
                            <><Upload className="w-4 h-4" /> Importar para Supabase</>
                          )}
                        </Button>
                      </div>
                    </div>

                    {validationErrors.length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          {validationErrors.map((error, index) => (
                            <div key={index}>{error}</div>
                          ))}
                        </AlertDescription>
                      </Alert>
                    )}

                    {importResult && (
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                              <div className="text-sm text-green-700">Importadas</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-blue-600">{importResult.processed}</div>
                              <div className="text-sm text-blue-700">Processadas</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-yellow-600">{importResult.skipped}</div>
                              <div className="text-sm text-yellow-700">Puladas</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-red-600">{importResult.errors}</div>
                              <div className="text-sm text-red-700">Erros</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                      <div className="divide-y">
                        {processedAreas.map((area, index) => (
                          <div key={index} className="p-3 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary">{area.tipo_item}</Badge>
                                  <span className="font-medium">{area.endereco}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Bairro: {area.bairro} • Metragem: {area.metragem_m2.toLocaleString('pt-BR')} m²
                                </div>
                                {area.latitude && area.longitude && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Coordenadas: {area.latitude}, {area.longitude}
                                  </div>
                                )}
                                {area.observacoes && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Observações: {area.observacoes}
                                  </div>
                                )}
                              </div>
                              <Badge variant="outline">Lote {area.lote || 1}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Configurações e Histórico */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações de Importação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Mapeamento de Campos</label>
                  <div className="text-sm text-gray-600 mt-1">
                    • tipo_item → service_type<br/>
                    • endereco → name/description<br/>
                    • bairro → bairro<br/>
                    • metragem_m2 → estimated_duration/cost<br/>
                    • latitude/longitude → coordinates
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tipos de Serviço</label>
                  <div className="text-sm text-gray-600 mt-1">
                    • area publica → ROCAGEM<br/>
                    • praça → MANUTENCAO_PRAÇA<br/>
                    • canteiros → ROCAGEM_CANTEIROS<br/>
                    • viela → ROCAGEM_VIELA<br/>
                    • lote público → ROCAGEM_LOTE
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Últimas Importações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Histórico de importações aparecerá aqui</p>
                <p className="text-sm mt-2">Após importar, você verá o log das operações</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}