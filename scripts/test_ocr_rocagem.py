#!/usr/bin/env python3
"""
Teste de Processamento OCR - Áreas de Roçagem Londrina
Script para testar o processamento dos dados OCR fornecidos
"""

import sys
import os
import json
from datetime import datetime

# Adicionar o diretório scripts ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ocr_processor import OCRDataProcessor, RoçagemArea

def test_ocr_processing():
    """Testa o processamento dos dados OCR fornecidos"""
    
    print("🧪 Iniciando teste de processamento OCR...")
    print("=" * 60)
    
    # Dados OCR extraídos da imagem fornecida
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
    
    # Criar processor
    processor = OCRDataProcessor()
    
    # Processar dados OCR
    print("📊 Processando dados OCR...")
    areas = processor.process_ocr_data(ocr_text)
    
    print(f"\n✅ Processamento concluído!")
    print(f"📈 Total de áreas processadas: {len(areas)}")
    
    # Mostrar resumo
    summary = processor.get_processing_summary()
    print(f"\n📋 Resumo do processamento:")
    print(f"   • Processadas: {summary['total_processado']}")
    print(f"   • Puladas: {summary['total_pulado']}")
    print(f"   • Erros: {summary['total_erros']}")
    print(f"   • Taxa de sucesso: {summary['taxa_sucesso']}%")
    
    if summary['erros']:
        print(f"\n⚠️  Erros encontrados:")
        for error in summary['erros'][:5]:  # Mostrar primeiros 5 erros
            print(f"   - {error}")
        if len(summary['erros']) > 5:
            print(f"   ... e mais {len(summary['erros']) - 5} erros")
    
    # Mostrar detalhes das áreas
    print(f"\n🗺️  Detalhes das áreas encontradas:")
    print("-" * 80)
    
    for i, area in enumerate(areas, 1):
        print(f"\n{i:2d}. {area.tipo_item.upper()} - {area.endereco}")
        print(f"    📍 Bairro: {area.bairro}")
        print(f"    📏 Metragem: {area.metragem_m2:,.2f} m²")
        
        if area.latitude and area.longitude:
            print(f"    🌍 Coordenadas: {area.latitude:.6f}, {area.longitude:.6f}")
        else:
            print(f"    ⚠️  Coordenadas: Não disponíveis")
            
        print(f"    📋 Lote: {area.lote}")
        
        if area.observacoes:
            print(f"    📝 Observações: {area.observacoes}")
            
        if area.coordenadas:
            print(f"    📍 GeoJSON: Disponível")
    
    # Estatísticas por tipo
    print(f"\n📊 Estatísticas por tipo de item:")
    print("-" * 40)
    
    tipo_stats = {}
    for area in areas:
        tipo = area.tipo_item
        if tipo not in tipo_stats:
            tipo_stats[tipo] = {
                'count': 0,
                'total_metragem': 0,
                'coordenadas_disponiveis': 0
            }
        
        tipo_stats[tipo]['count'] += 1
        tipo_stats[tipo]['total_metragem'] += area.metragem_m2
        if area.latitude and area.longitude:
            tipo_stats[tipo]['coordenadas_disponiveis'] += 1
    
    for tipo, stats in tipo_stats.items():
        print(f"\n{tipo.title()}:")
        print(f"   • Quantidade: {stats['count']}")
        print(f"   • Metragem total: {stats['total_metragem']:,.2f} m²")
        print(f"   • Média por área: {stats['total_metragem']/stats['count']:,.2f} m²")
        print(f"   • Com coordenadas: {stats['coordenadas_disponiveis']}/{stats['count']} ({(stats['coordenadas_disponiveis']/stats['count']*100):.1f}%)")
    
    # Preparar dados para exportação
    print(f"\n💾 Preparando exportação de dados...")
    
    # Converter para dicionários
    areas_dict = [area.to_dict() for area in areas]
    
    # Exportar JSON
    json_filename = f"areas_rocagem_processadas_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(areas_dict, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Dados exportados para: {json_filename}")
    
    # Criar CSV para visualização
    csv_filename = f"areas_rocagem_processadas_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    with open(csv_filename, 'w', encoding='utf-8') as f:
        # Cabeçalho
        f.write("tipo_item;endereco;bairro;metragem_m2;latitude;longitude;lote;observacoes\n")
        
        # Dados
        for area in areas:
            f.write(f"{area.tipo_item};{area.endereco};{area.bairro};{area.metragem_m2};"
                   f"{area.latitude or ''};{area.longitude or ''};{area.lote or ''};"
                   f"{area.observacoes or ''}\n")
    
    print(f"✅ CSV exportado para: {csv_filename}")
    
    # Criar SQL para importação direta (exemplo)
    sql_filename = f"areas_rocagem_sql_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
    with open(sql_filename, 'w', encoding='utf-8') as f:
        f.write("-- SQL para importação de áreas de roçagem\n")
        f.write("-- Execute no Supabase para importar os dados\n\n")
        
        for area in areas:
            # Converter coordenadas para formato aceito pelo Supabase (GeoJSON)
            coordinates = "NULL"
            if area.latitude and area.longitude:
                delta = 0.0001  # ~10 metros
                coordinates = f"'{json.dumps({
                    'type': 'Polygon',
                    'coordinates': [[
                        [area.longitude - delta, area.latitude - delta],
                        [area.longitude + delta, area.latitude - delta],
                        [area.longitude + delta, area.latitude + delta],
                        [area.longitude - delta, area.latitude + delta],
                        [area.longitude - delta, area.latitude - delta]
                    ]]
                })}'"
            
            # Mapear tipo para service_type
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
            
            # Estimar duração e custo
            estimated_duration = 60 + (area.metragem_m2 / 1000) * 30  # 1h base + 30min por 1000m²
            cost_estimate = area.metragem_m2 * 0.5  # R$ 0,50 por m²
            
            f.write(f"INSERT INTO service_areas (name, description, coordinates, service_type, priority, status, estimated_duration, cost_estimate, notes, bairro, created_at, updated_at) VALUES\n")
            f.write(f"('{area.tipo_item.title()} - {area.endereco[:50]}', "
                   f"'Área de roçagem: {area.endereco}', "
                   f"{coordinates}, "
                   f"'{service_type}', "
                   f"'MEDIA', 'PENDENTE', "
                   f"{int(estimated_duration)}, {cost_estimate:.2f}, "
                   f"'Metragem: {area.metragem_m2:,.2f} m², Lote: {area.lote or 1}', "
                   f"'{area.bairro}', NOW(), NOW());\n\n")
    
    print(f"✅ SQL exportado para: {sql_filename}")
    
    print(f"\n🎉 Processamento concluído com sucesso!")
    print(f"📊 Arquivos gerados:")
    print(f"   • {json_filename} - Dados completos em JSON")
    print(f"   • {csv_filename} - Dados para visualização em Excel")
    print(f"   • {sql_filename} - Script SQL para importação no Supabase")
    
    return areas

def test_import_simulation():
    """Simula importação para o Supabase (sem conexão real)"""
    
    print("\n🧪 Simulação de importação para Supabase...")
    print("=" * 60)
    
    # Processar dados primeiro
    areas = test_ocr_processing()
    
    if not areas:
        print("❌ Nenhuma área para importar")
        return
    
    print(f"\n📊 Simulando importação de {len(areas)} áreas...")
    
    # Simular resultados de importação
    importados = 0
    pulados = 0
    erros = 0
    
    for i, area in enumerate(areas, 1):
        # Simular lógica de importação
        if area.latitude and area.longitude:  # Só importar se tiver coordenadas
            importados += 1
            print(f"✅ Área {i}: Importada com sucesso")
        elif area.metragem_m2 > 1000:  # Importar áreas grandes mesmo sem coordenadas
            importados += 1
            print(f"⚠️  Área {i}: Importada sem coordenadas (área grande)")
        else:
            pulados += 1
            print(f"❌ Área {i}: Pulada - sem coordenadas e área pequena")
    
    print(f"\n📈 Resultado da simulação:")
    print(f"   • Importadas: {importados}")
    print(f"   • Puladas: {pulados}")
    print(f"   • Taxa de importação: {(importados/len(areas)*100):.1f}%")
    
    print(f"\n💡 Recomendações:")
    print(f"   • Verifique as coordenadas das áreas que foram puladas")
    print(f"   • Considere importar todas as áreas e adicionar coordenadas posteriormente")
    print(f"   • Use o script SQL gerado para importação no Supabase")

if __name__ == "__main__":
    # Executar teste completo
    test_ocr_processing()
    
    # Executar simulação de importação
    test_import_simulation()
    
    print(f"\n✨ Teste concluído! Verifique os arquivos gerados.")