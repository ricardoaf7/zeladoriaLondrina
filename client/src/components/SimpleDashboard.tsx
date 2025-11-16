import React from 'react';

interface SimpleDashboardProps {
  areas: any[];
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ areas }) => {
  const totalAreas = areas.length;
  const areasConcluidas = areas.filter(a => a.status === 'concluido').length;
  const areasPendentes = areas.filter(a => a.status === 'pendente').length;
  const areasEmAndamento = areas.filter(a => a.status === 'em_andamento').length;
  
  const metragemTotal = areas.reduce((sum, area) => sum + (area.metragem_m2 || 0), 0);
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard de Roçagem</h2>
      
      {/* Cards de KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg text-center">
          <h3 className="text-sm font-semibold text-blue-800">Total de Áreas</h3>
          <p className="text-3xl font-bold text-blue-600">{totalAreas}</p>
        </div>
        
        <div className="bg-green-100 p-4 rounded-lg text-center">
          <h3 className="text-sm font-semibold text-green-800">Concluídas</h3>
          <p className="text-3xl font-bold text-green-600">{areasConcluidas}</p>
        </div>
        
        <div className="bg-yellow-100 p-4 rounded-lg text-center">
          <h3 className="text-sm font-semibold text-yellow-800">Pendentes</h3>
          <p className="text-3xl font-bold text-yellow-600">{areasPendentes}</p>
        </div>
        
        <div className="bg-purple-100 p-4 rounded-lg text-center">
          <h3 className="text-sm font-semibold text-purple-800">Em Andamento</h3>
          <p className="text-3xl font-bold text-purple-600">{areasEmAndamento}</p>
        </div>
      </div>
      
      {/* Métricas de metragem */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Métricas Totais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Metragem Total:</span>
            <span className="text-xl font-bold text-gray-800 ml-2">
              {metragemTotal.toLocaleString('pt-BR')} m²
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Média por Área:</span>
            <span className="text-xl font-bold text-gray-800 ml-2">
              {totalAreas > 0 ? Math.round(metragemTotal / totalAreas).toLocaleString('pt-BR') : 0} m²
            </span>
          </div>
        </div>
      </div>
      
      {/* Lista de áreas recentes */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Áreas Recentes</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {areas.slice(0, 10).map(area => (
            <div key={area.id} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-gray-800">{area.endereco}</div>
                <div className="text-sm text-gray-600">{area.bairro}</div>
                <div className="text-xs text-gray-500">{area.metragem_m2}m²</div>
              </div>
              <div className="ml-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  area.status === 'concluido' ? 'bg-green-100 text-green-800' :
                  area.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {area.status === 'concluido' ? 'Concluído' :
                   area.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {areas.length > 10 && (
          <div className="text-center mt-4">
            <span className="text-sm text-gray-500">
              ... e mais {areas.length - 10} áreas
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleDashboard;