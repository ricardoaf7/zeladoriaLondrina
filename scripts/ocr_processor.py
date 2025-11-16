#!/usr/bin/env python3
"""
OCR Processor para Áreas de Roçagem - Zeladoria Londrina
Processa imagens de planilhas e extrai dados estruturados
"""

import re
import json
import sys
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class RoçagemArea:
    """Modelo de dados para áreas de roçagem"""
    tipo_item: str
    endereco: str
    bairro: str
    metragem_m2: float
    latitude: Optional[float]
    longitude: Optional[float]
    lote: int
    observacoes: Optional[str]
    coordenadas: Optional[Dict[str, float]]  # Para formato GeoJSON
    
    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionário"""
        return {
            'tipo_item': self.tipo_item,
            'endereco': self.endereco,
            'bairro': self.bairro,
            'metragem_m2': self.metragem_m2,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'lote': self.lote,
            'observacoes': self.observacoes,
            'coordenadas': self.coordenadas
        }

class OCRDataProcessor:
    """Processa dados OCR de planilhas de roçagem"""
    
    def __init__(self):
        self.validation_errors = []
        self.processed_count = 0
        self.skipped_count = 0
        
    def process_ocr_data(self, ocr_text: str) -> List[RoçagemArea]:
        """
        Processa texto OCR e extrai dados estruturados
        
        Args:
            ocr_text: Texto bruto do OCR
            
        Returns:
            Lista de objetos RoçagemArea processados
        """
        print("🔍 Processando dados OCR...")
        
        # Limpar e normalizar texto
        cleaned_text = self._clean_ocr_text(ocr_text)
        
        # Extrair linhas de dados
        data_lines = self._extract_data_lines(cleaned_text)
        
        print(f"📄 Encontradas {len(data_lines)} linhas de dados")
        
        areas = []
        for i, line in enumerate(data_lines, 1):
            try:
                area = self._parse_line(line, i)
                if area:
                    areas.append(area)
                    self.processed_count += 1
                else:
                    self.skipped_count += 1
                    
            except Exception as e:
                print(f"⚠️  Erro ao processar linha {i}: {e}")
                self.validation_errors.append(f"Linha {i}: {str(e)}")
                self.skipped_count += 1
        
        print(f"✅ Processadas: {self.processed_count} | Puladas: {self.skipped_count}")
        
        if self.validation_errors:
            print(f"⚠️  {len(self.validation_errors)} erros de validação encontrados")
            
        return areas
    
    def _clean_ocr_text(self, text: str) -> str:
        """Limpa e normaliza texto OCR"""
        # Remover espaços extras e quebras de linha duplicadas
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        
        # Corrigir caracteres comuns de OCR
        corrections = {
            '¤': 'o',
            '®': 'o',
            '©': 'c',
            '°': 'o',
            '¬': 'l',
            '¢': 'c',
            '£': 'L',
            '§': 's',
            '†': 't',
            '‡': 't',
            '•': '-',
            '…': '...',
            '„': '"',
            '“': '"',
            '”': '"',
            '‘': "'",
            '’': "'",
        }
        
        for wrong, correct in corrections.items():
            text = text.replace(wrong, correct)
        
        return text.strip()
    
    def _extract_data_lines(self, text: str) -> List[str]:
        """Extrai linhas de dados do texto OCR"""
        lines = text.split('\n')
        data_lines = []
        
        # Pular cabeçalho (primeira linha com nomes das colunas)
        start_processing = False
        
        for line in lines:
            line = line.strip()
            
            # Detectar fim do cabeçalho e início dos dados
            if not start_processing:
                # Verificar se é linha de cabeçalho
                if any(keyword in line.lower() for keyword in [
                    'tipo_item', 'endereco', 'bairro', 'metragem', 'latitude'
                ]):
                    start_processing = True
                    continue
            
            # Processar linhas de dados
            if start_processing and line:
                # Verificar se é linha de dados válida
                if self._is_data_line(line):
                    data_lines.append(line)
        
        return data_lines
    
    def _is_data_line(self, line: str) -> bool:
        """Verifica se a linha contém dados válidos"""
        # Deve conter pelo menos tipo_item e endereco
        has_type = any(item_type in line.lower() for item_type in [
            'area publica', 'praça', 'canteiros', 'viela', 'lote público', 
            'lotes', 'fundo de vale'
        ])
        
        # Deve conter números (metragem, lote, coordenadas)
        has_numbers = bool(re.search(r'\d+', line))
        
        return has_type and has_numbers
    
    def _parse_line(self, line: str, line_number: int) -> Optional[RoçagemArea]:
        """Parse uma linha de dados"""
        
        # Tentar dividir por espaços e identificar campos
        parts = self._split_line_into_fields(line)
        
        if len(parts) < 5:  # Mínimo de campos necessários
            print(f"⚠️  Linha {line_number}: Poucos campos detectados ({len(parts)})")
            return None
        
        # Extrair campos
        tipo_item = self._extract_tipo_item(parts)
        endereco = self._extract_endereco(parts)
        bairro = self._extract_bairro(parts)
        metragem_m2 = self._extract_metragem(parts)
        latitude = self._extract_latitude(parts)
        longitude = self._extract_longitude(parts)
        lote = self._extract_lote(parts)
        observacoes = self._extract_observacoes(parts)
        
        # Validar campos obrigatórios
        if not tipo_item or not endereco:
            print(f"⚠️  Linha {line_number}: Campos obrigatórios faltando")
            return None
        
        # Criar coordenadas GeoJSON se latitude/longitude disponíveis
        coordenadas = None
        if latitude and longitude:
            coordenadas = {
                "latitude": latitude,
                "longitude": longitude
            }
        
        return RoçagemArea(
            tipo_item=tipo_item,
            endereco=endereco,
            bairro=bairro or "Não especificado",
            metragem_m2=metragem_m2 or 0.0,
            latitude=latitude,
            longitude=longitude,
            lote=lote or 1,
            observacoes=observacoes,
            coordenadas=coordenadas
        )
    
    def _split_line_into_fields(self, line: str) -> List[str]:
        """Divide linha em campos considerando o formato OCR"""
        # Tentar dividir por múltiplos espaços ou tabulações
        parts = re.split(r'\s{2,}|\t', line)
        
        # Se não conseguiu dividir bem, tentar por padrões numéricos
        if len(parts) < 5:
            # Dividir antes de números que parecem ser metragem/lote
            parts = re.split(r'(?=\d+\.?\d*,?\d*\s)', line)
            parts = [p.strip() for p in parts if p.strip()]
        
        return parts
    
    def _extract_tipo_item(self, parts: List[str]) -> str:
        """Extrai tipo_item dos primeiros campos"""
        for part in parts[:3]:  # Procurar nos 3 primeiros campos
            part_lower = part.lower()
            if any(item_type in part_lower for item_type in [
                'area publica', 'praça', 'canteiros', 'viela', 
                'lote público', 'lotes', 'fundo de vale'
            ]):
                return part.strip()
        
        # Se não encontrou, usar o primeiro campo
        return parts[0].strip() if parts else "area publica"
    
    def _extract_endereco(self, parts: List[str]) -> str:
        """Extrai endereco (geralmente após tipo_item)"""
        if len(parts) < 2:
            return ""
        
        # Procurar por campos que contenham "rua", "av", "praça", etc.
        for part in parts[1:4]:  # Procurar nos campos 2-4
            part_lower = part.lower()
            if any(street_indicator in part_lower for street_indicator in [
                'rua', 'av ', 'avenida', 'praça', 'travessa', 'alameda'
            ]):
                return part.strip()
        
        # Se não encontrou padrão, usar o segundo campo
        return parts[1].strip() if len(parts) > 1 else ""
    
    def _extract_bairro(self, parts: List[str]) -> str:
        """Extrai bairro (geralmente após endereco)"""
        # Procurar por nomes de bairros conhecidos ou campos sem padrões de rua
        bairros_conhecidos = [
            'casoni', 'paraná', 'matarazzo', 'kase', 'são caetano', 
            'portuguesa', 'recreio', 'santa monica'
        ]
        
        for part in parts[2:5]:  # Procurar nos campos 3-5
            part_lower = part.lower()
            if any(bairro in part_lower for bairro in bairros_conhecidos):
                return part.strip()
        
        # Se não encontrou padrão, tentar identificar campo que não seja número ou coordenada
        for part in parts[2:5]:
            if not re.match(r'^-?\d+\.?\d*,?\d*$', part) and len(part) > 2:
                return part.strip()
        
        return ""
    
    def _extract_metragem(self, parts: List[str]) -> Optional[float]:
        """Extrai metragem_m2 (número com formato brasileiro)"""
        for part in parts:
            # Procurar por números no formato brasileiro (ponto como milhar, vírgula como decimal)
            match = re.search(r'(\d{1,3}(?:\.\d{3})*(?:,\d+)?)', part)
            if match:
                number_str = match.group(1)
                try:
                    # Converter formato brasileiro para float
                    # Remover pontos de milhar e substituir vírgula por ponto
                    normalized = number_str.replace('.', '').replace(',', '.')
                    value = float(normalized)
                    # Validar que é um valor razoável para metragem
                    if 1 <= value <= 100000:
                        return value
                except ValueError:
                    continue
        
        return None
    
    def _extract_latitude(self, parts: List[str]) -> Optional[float]:
        """Extrai latitude (coordenada negativa para Londrina)"""
        for part in parts:
            # Procurar por coordenadas no formato -23,XXXXX
            match = re.search(r'-23[.,]\d{4,}', part)
            if match:
                try:
                    coord_str = match.group(0).replace(',', '.')
                    return float(coord_str)
                except ValueError:
                    continue
        
        return None
    
    def _extract_longitude(self, parts: List[str]) -> Optional[float]:
        """Extrai longitude (coordenada negativa para Londrina)"""
        for part in parts:
            # Procurar por coordenadas no formato -51,XXXXX
            match = re.search(r'-51[.,]\d{4,}', part)
            if match:
                try:
                    coord_str = match.group(0).replace(',', '.')
                    return float(coord_str)
                except ValueError:
                    continue
        
        return None
    
    def _extract_lote(self, parts: List[str]) -> Optional[int]:
        """Extrai número do lote"""
        for part in parts:
            # Procurar por número inteiro que possa ser lote
            match = re.search(r'\b(\d+)\b', part)
            if match:
                try:
                    value = int(match.group(1))
                    # Validar que é um número de lote razoável
                    if 1 <= value <= 999:
                        return value
                except ValueError:
                    continue
        
        return None
    
    def _extract_observacoes(self, parts: List[str]) -> Optional[str]:
        """Extrai observações (geralmente no final)"""
        # Pegar últimos campos que não sejam números ou coordenadas
        observacoes_parts = []
        
        for part in reversed(parts[-3:]):  # Olhar os últimos 3 campos
            if not re.match(r'^-?\d+\.?\d*,?\d*$', part) and len(part) > 2:
                observacoes_parts.append(part)
        
        return ' '.join(observacoes_parts) if observacoes_parts else None
    
    def get_processing_summary(self) -> Dict[str, Any]:
        """Retorna resumo do processamento"""
        return {
            'total_processado': self.processed_count,
            'total_pulado': self.skipped_count,
            'total_erros': len(self.validation_errors),
            'erros': self.validation_errors,
            'taxa_sucesso': round((self.processed_count / max(1, self.processed_count + self.skipped_count)) * 100, 2)
        }

def main():
    """Função principal para teste"""
    
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
    
    processor = OCRDataProcessor()
    areas = processor.process_ocr_data(ocr_text)
    
    print(f"\n📊 Resultados do Processamento:")
    print(f"Áreas encontradas: {len(areas)}")
    
    # Mostrar primeiras 5 áreas como exemplo
    for i, area in enumerate(areas[:5], 1):
        print(f"\n{i}. {area.tipo_item} - {area.endereco}")
        print(f"   Bairro: {area.bairro}")
        print(f"   Metragem: {area.metragem_m2:,.2f} m²")
        print(f"   Coordenadas: {area.latitude}, {area.longitude}")
        print(f"   Lote: {area.lote}")
    
    # Resumo do processamento
    summary = processor.get_processing_summary()
    print(f"\n📈 Resumo: {summary}")
    
    # Exportar para JSON
    if areas:
        areas_dict = [area.to_dict() for area in areas]
        with open('areas_rocagem_processadas.json', 'w', encoding='utf-8') as f:
            json.dump(areas_dict, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 Dados exportados para: areas_rocagem_processadas.json")

if __name__ == "__main__":
    main()