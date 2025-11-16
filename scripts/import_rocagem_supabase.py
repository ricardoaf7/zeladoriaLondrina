#!/usr/bin/env python3
"""
Importador de Áreas de Roçagem para Supabase
Importa dados processados do OCR para o banco de dados
"""

import os
import sys
import json
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass
from supabase import create_client, Client

# Adicionar o diretório scripts ao path para importar o processor
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from ocr_processor import OCRDataProcessor, RoçagemArea

@dataclass
class ImportResult:
    """Resultado da importação"""
    success: int
    errors: int
    skipped: int
    total: int
    error_details: List[str]
    imported_ids: List[str]

class SupabaseImporter:
    """Importa dados de roçagem para o Supabase"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        """
        Inicializa o importador
        
        Args:
            supabase_url: URL do projeto Supabase
            supabase_key: Chave anon ou service role do Supabase
        """
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.import_log = []
        
    async def import_rocagem_areas(self, areas: List[RoçagemArea], 
                                 batch_size: int = 50) -> ImportResult:
        """
        Importa lista de áreas de roçagem para o Supabase
        
        Args:
            areas: Lista de áreas a importar
            batch_size: Tamanho do lote para importação em batch
            
        Returns:
            Resultado da importação
        """
        print(f"🚀 Iniciando importação de {len(areas)} áreas de roçagem...")
        
        result = ImportResult(
            success=0,
            errors=0,
            skipped=0,
            total=len(areas),
            error_details=[],
            imported_ids=[]
        )
        
        # Processar em lotes
        for i in range(0, len(areas), batch_size):
            batch = areas[i:i + batch_size]
            batch_number = (i // batch_size) + 1
            total_batches = (len(areas) + batch_size - 1) // batch_size
            
            print(f"📦 Processando lote {batch_number}/{total_batches} ({len(batch)} áreas)")
            
            batch_result = await self._import_batch(batch, batch_number)
            
            # Acumular resultados
            result.success += batch_result.success
            result.errors += batch_result.errors
            result.skipped += batch_result.skipped
            result.error_details.extend(batch_result.error_details)
            result.imported_ids.extend(batch_result.imported_ids)
            
            # Pequena pausa entre lotes para não sobrecarregar o Supabase
            if batch_number < total_batches:
                await asyncio.sleep(0.5)
        
        print(f"\n✅ Importação concluída!")
        print(f"   📊 Total: {result.total}")
        print(f"   ✅ Sucesso: {result.success}")
        print(f"   ❌ Erros: {result.errors}")
        print(f"   ⚠️  Puladas: {result.skipped}")
        
        if result.error_details:
            print(f"\n📋 Detalhes dos erros:")
            for error in result.error_details[:5]:  # Mostrar primeiros 5 erros
                print(f"   - {error}")
            if len(result.error_details) > 5:
                print(f"   ... e mais {len(result.error_details) - 5} erros")
        
        return result
    
    async def _import_batch(self, areas: List[RoçagemArea], batch_number: int) -> ImportResult:
        """Importa um lote de áreas"""
        result = ImportResult(0, 0, 0, len(areas), [], [])
        
        for area in areas:
            try:
                # Converter para formato do Supabase
                supabase_data = self._convert_to_supabase_format(area)
                
                # Verificar se já existe (evitar duplicatas)
                if await self._check_duplicate(supabase_data):
                    result.skipped += 1
                    continue
                
                # Inserir no Supabase
                response = await self._insert_area(supabase_data)
                
                if response and 'id' in response:
                    result.success += 1
                    result.imported_ids.append(response['id'])
                    self._log_import(area, response['id'], 'success')
                else:
                    result.errors += 1
                    error_msg = f"Resposta inválida do Supabase"
                    result.error_details.append(error_msg)
                    self._log_import(area, None, 'error', error_msg)
                    
            except Exception as e:
                result.errors += 1
                error_msg = f"Erro ao importar: {str(e)}"
                result.error_details.append(error_msg)
                self._log_import(area, None, 'error', error_msg)
                print(f"❌ Erro ao importar área: {e}")
        
        return result
    
    def _convert_to_supabase_format(self, area: RoçagemArea) -> Dict[str, Any]:
        """Converte área de roçagem para formato do Supabase"""
        # Mapear tipo_item para service_type
        service_type_map = {
            'area publica': 'ROCAGEM',
            'praça': 'MANUTENCAO_PRAÇA',
            'canteiros': 'ROCAGEM_CANTEIROS',
            'viela': 'ROCAGEM_VIELA',
            'lote público': 'ROCAGEM_LOTE',
            'lotes': 'ROCAGEM_LOTES',
            'fundo de vale': 'ROCAGEM_FUNDO_VALE'
        }
        
        service_type = service_type_map.get(area.tipo_item.lower(), 'ROCAGEM')
        
        # Criar coordenadas GeoJSON se disponíveis
        coordinates = None
        if area.latitude and area.longitude:
            # Criar um pequeno polígono ao redor do ponto (10m de raio)
            lat = area.latitude
            lng = area.longitude
            
            # Aproximadamente 0.0001 graus = ~10 metros
            delta = 0.0001
            
            coordinates = {
                "type": "Polygon",
                "coordinates": [[
                    [lng - delta, lat - delta],
                    [lng + delta, lat - delta],
                    [lng + delta, lat + delta],
                    [lng - delta, lat + delta],
                    [lng - delta, lat - delta]
                ]]
            }
        
        return {
            'name': f"{area.tipo_item.title()} - {area.endereco[:50]}",
            'description': f"Área de roçagem: {area.endereco}",
            'coordinates': coordinates,
            'service_type': service_type,
            'priority': 'MEDIA',  # Padrão para roçagem
            'status': 'PENDENTE',
            'estimated_duration': self._estimate_duration(area.metragem_m2),
            'scheduled_date': None,  # Será agendado posteriormente
            'assigned_team': None,
            'cost_estimate': self._estimate_cost(area.metragem_m2),
            'notes': area.observacoes or f"Metragem: {area.metragem_m2:,.2f} m², Lote: {area.lote}",
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'metadata': {
                'tipo_item_original': area.tipo_item,
                'metragem_m2': area.metragem_m2,
                'lote': area.lote,
                'latitude_original': area.latitude,
                'longitude_original': area.longitude,
                'fonte': 'OCR_IMAGENS_PLANILHA',
                'data_importacao': datetime.now().isoformat()
            }
        }
    
    def _estimate_duration(self, metragem_m2: float) -> int:
        """Estima duração em minutos baseado na metragem"""
        # Estimativa: 30 minutos por 1000 m² + tempo base
        tempo_base = 60  # 1 hora base
        tempo_por_metragem = (metragem_m2 / 1000) * 30
        return int(tempo_base + tempo_por_metragem)
    
    def _estimate_cost(self, metragem_m2: float) -> float:
        """Estima custo baseado na metragem"""
        # Estimativa: R$ 0,50 por m² para roçagem
        return round(metragem_m2 * 0.5, 2)
    
    async def _check_duplicate(self, data: Dict[str, Any]) -> bool:
        """Verifica se área já existe (evita duplicatas)"""
        try:
            # Verificar por combinação de endereço e coordenadas
            response = self.supabase.table('service_areas')\
                .select('id')\
                .eq('name', data['name'])\
                .limit(1)\
                .execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            print(f"⚠️  Erro ao verificar duplicata: {e}")
            return False  # Prosseguir mesmo se houver erro na verificação
    
    async def _insert_area(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Insere área no Supabase"""
        try:
            response = self.supabase.table('service_areas')\
                .insert(data)\
                .execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            else:
                return None
                
        except Exception as e:
            print(f"❌ Erro ao inserir no Supabase: {e}")
            raise e
    
    def _log_import(self, area: RoçagemArea, supabase_id: Optional[str], status: str, error: Optional[str] = None):
        """Registra log da importação"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'area_endereco': area.endereco,
            'area_bairro': area.bairro,
            'area_tipo': area.tipo_item,
            'area_metragem': area.metragem_m2,
            'supabase_id': supabase_id,
            'status': status,
            'error': error
        }
        
        self.import_log.append(log_entry)
    
    def export_import_log(self, filename: str = 'import_log.json'):
        """Exporta log de importação"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.import_log, f, ensure_ascii=False, indent=2)
        
        print(f"📋 Log de importação exportado para: {filename}")

async def process_ocr_and_import(ocr_text: str, supabase_url: str, supabase_key: str) -> ImportResult:
    """
    Processa OCR completo e importa para Supabase
    
    Args:
        ocr_text: Texto bruto do OCR
        supabase_url: URL do Supabase
        supabase_key: Chave do Supabase
        
    Returns:
        Resultado da importação
    """
    print("🔍 Processando dados OCR...")
    
    # Processar OCR
    processor = OCRDataProcessor()
    areas = processor.process_ocr_data(ocr_text)
    
    print(f"📊 {len(areas)} áreas processadas do OCR")
    
    if not areas:
        print("⚠️  Nenhuma área encontrada no OCR")
        return ImportResult(0, 0, 0, 0, [], [])
    
    # Importar para Supabase
    importer = SupabaseImporter(supabase_url, supabase_key)
    result = await importer.import_rocagem_areas(areas)
    
    # Exportar log
    importer.export_import_log()
    
    return result

def main():
    """Função principal para teste"""
    
    # Verificar variáveis de ambiente
    supabase_url = os.getenv('VITE_SUPABASE_URL')
    supabase_key = os.getenv('VITE_SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Configure as variáveis de ambiente:")
        print("   VITE_SUPABASE_URL")
        print("   VITE_SUPABASE_ANON_KEY")
        return
    
    # Dados OCR de exemplo (baseados na imagem que você enviou)
    ocr_text = """
    tipo_item endereco bairro metrogem_m2 latitude longitude lote observações
    area publica av. jorge casoni - terminal rodoviario casoni 29.184,98 -23,3044206 -51,1531729 1
    praça rua carijós c arruana paraná 2.332,83 -23,3043262 -51,1080607 1
    praça jorge casoni c/ guaicurus matarazzo 244,25 -23,304 -51,108 1
    area publica caetes c/ tembes (praça/ laterais ao lado praça) matarazzo 680,00 -23,305 -51,109 1
    canteiros av jorge casoni (alça lateral esquina rua guaranis ) casoni 452,16 -23,3028976 -51,1494082 1
    area publica rua tupiniquins (lados praça) casoni 150 -23,295 -51,154 1
    area publica rua tapuias c/ oswaldo cruz casoni 500,00 -23,2959873 -51,1545458 1
    area publica jorge casoni c/ camocan e alexandre albertini (2 areas) kase 722,44 -23,2949574 -51,1471296 1
    viela jorge casoni (da casoni até saturnino de brito e rua sampaio vidal) casoni 908,80 -23,303 -51,149 1
    praça vital brasil c oswaldo cruz kase 2.434,69 -23,296 -51,155 1
    lote público icós são caetano 438,56 -23,297 -51,155 1
    lote público tembés portuguesa 348 -23,3023949 -51,154633 1
    praça tietê c john kennedy recreio 1.915,41 -23,2953414 -51,1589755 1
    praça tietê c duque de caxias 2 praças recreio 2.457,00 -23,296 -51,159 1
    area publica av. duque de caxias c/ r. caetano munhoz da rocha recreio 411,75 -23,3154575 -51,1551798 1
    lotes irma bona dose c angelo vicentini santa monica 3.870,42 -23,2868047 -51,158213 1
    fundo de vale r. angelo vicentini (da maria i. v. teodoro até av. lucia h.g. viana) santa monica 7.195,78 -23,2866857 -51,1586495 1
    """
    
    # Executar importação
    async def run():
        result = await process_ocr_and_import(ocr_text, supabase_url, supabase_key)
        
        print(f"\n🎉 Importação concluída!")
        print(f"📊 Total: {result.total}")
        print(f"✅ Sucesso: {result.success}")
        print(f"❌ Erros: {result.errors}")
        print(f"⚠️  Puladas: {result.skipped}")
    
    # Rodar async
    asyncio.run(run())

if __name__ == "__main__":
    main()