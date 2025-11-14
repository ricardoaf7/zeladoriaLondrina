export type ImportedItem = {
  id: number | null
  endereco: string
  responsavel?: string
  bairro: string
  status: string
  tipo: string
  metragem_m2: number
  lat: number
  lng: number
  ordem: number
  observacao?: string
  scheduled_date?: string | null
  days_to_complete?: number | null
  ativo: boolean
  servico: string
  registrado_por?: string
  history?: string
  lote?: number | null
  sequencia_cadastro?: number | null
  polygon?: string
  proxima_previsao?: string | null
  ultima_rocagem?: string | null
  manual_schedule?: boolean
  data_registro?: string | null
}

export function mapCsvLine(cols: string[]): ImportedItem | null {
  const id = parseInt(cols[0])
  if (!id || Number.isNaN(id)) return null
  return {
    id,
    endereco: cols[4] || '',
    responsavel: '',
    bairro: cols[5] || '',
    status: cols[10] || 'Pendente',
    tipo: cols[3] || 'Roçagem',
    metragem_m2: parseFloat(cols[6]) || 0,
    lat: parseFloat(cols[7]) || 0,
    lng: parseFloat(cols[8]) || 0,
    ordem: cols[1] && cols[1].trim() !== '' ? parseInt(cols[1]) || 1 : 1,
    observacao: cols[11] || '',
    scheduled_date: cols[13] || null,
    days_to_complete: cols[17] ? parseInt(cols[17]) || null : null,
    ativo: true,
    servico: cols[18] || 'rocagem',
    registrado_por: cols[19] || '',
    history: cols[11] || '[]',
    lote: cols[9] ? parseInt(cols[9]) || null : null,
    sequencia_cadastro: cols[2] ? parseInt(cols[2]) || null : null,
    polygon: cols[12] || '',
    proxima_previsao: cols[14] || null,
    ultima_rocagem: cols[15] || null,
    manual_schedule: cols[16] === 'true',
    data_registro: cols[20] || null,
  }
}

export function parseCsv(content: string): ImportedItem[] {
  const lines = content.split('\n').filter(line => line.trim())
  const items: ImportedItem[] = []
  for (const line of lines) {
    const cols = line.split(',')
    const mapped = mapCsvLine(cols)
    if (mapped) items.push(mapped)
  }
  return items
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}
