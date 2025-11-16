import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Area {
  id: number;
  endereco: string;
  bairro: string;
  tipo: string;
  metragem_m2: number;
  lat: number;
  lng: number;
  status: string;
  ultima_rocagem?: string | null;
  observacoes?: string;
}

interface SimpleMapProps {
  areas: Area[];
  className?: string;
}

export const SimpleMap: React.FC<SimpleMapProps> = ({ areas, className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || areas.length === 0) return;

    // Inicializar mapa apenas uma vez
    if (!mapInstanceRef.current) {
      // Centro de Londrina
      const map = L.map(mapRef.current).setView([-23.3045, -51.1692], 13);
      
      // Adicionar camada de tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Limpar marcadores anteriores
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Adicionar novos marcadores
    areas.forEach(area => {
      if (area.lat && area.lng) {
        // Criar ícone personalizado baseado no status
        const getColor = (status: string) => {
          switch (status) {
            case 'concluido': return '#10b981'; // verde
            case 'em_andamento': return '#3b82f6'; // azul
            case 'pendente': return '#f59e0b'; // amarelo
            default: return '#6b7280'; // cinza
          }
        };

        const color = getColor(area.status);
        
        // Criar ícone customizado
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        // Criar popup
        const popupContent = `
          <div style="min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${area.endereco}</h4>
            <p style="margin: 4px 0; color: #6b7281; font-size: 14px;">${area.bairro}</p>
            <div style="margin: 8px 0;">
              <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                ${area.status === 'concluido' ? 'Concluído' : 
                  area.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'}
              </span>
            </div>
            <div style="margin: 8px 0; font-size: 13px;">
              <div style="display: flex; justify-content: space-between;">
                <span>Metragem:</span>
                <span style="font-weight: 600;">${area.metragem_m2.toLocaleString('pt-BR')} m²</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                <span>Tipo:</span>
                <span style="font-weight: 600;">${area.tipo.replace('_', ' ')}</span>
              </div>
              ${area.ultima_rocagem ? `
              <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                <span>Última roçagem:</span>
                <span style="font-weight: 600;">${new Date(area.ultima_rocagem).toLocaleDateString('pt-BR')}</span>
              </div>
              ` : ''}
            </div>
            ${area.observacoes ? `<p style="margin: 8px 0 0 0; color: #6b7281; font-size: 12px; font-style: italic;">${area.observacoes}</p>` : ''}
          </div>
        `;

        // Adicionar marcador ao mapa
        const marker = L.marker([area.lat, area.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);
      }
    });

    // Ajustar zoom para mostrar todos os pontos
    if (areas.length > 0) {
      const bounds = L.latLngBounds(areas.map(area => [area.lat, area.lng]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    return () => {
      // Limpeza ao desmontar
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [areas]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-96 md:h-[500px] rounded-lg shadow-lg border ${className}`}
      style={{ zIndex: 1 }}
    />
  );
};

export default SimpleMap;