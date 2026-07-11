import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';
import { Link } from 'react-router';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import HeatmapLayer from '../../components/HeatmapLayer.tsx';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// A component to auto-center the map based on data
function MapCenterer({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapsSearchPortal() {
  const [municipality, setMunicipality] = useState('');
  const [viewType, setViewType] = useState<'cluster' | 'heatmap'>('heatmap');
  
  const { data: geoData, isLoading } = useQuery({
    queryKey: ['cases-heatmap'],
    queryFn: () => api.get('/geo/heatmaps')
  });

  const features = geoData?.features || [];
  const filteredFeatures = municipality 
    ? features.filter((f: any) => f.properties.status === 'approved' && f.properties.municipality === municipality) // if we had municipality in geoJSON
    : features.filter((f: any) => f.properties.status === 'approved');

  const heatPoints: [number, number, number][] = filteredFeatures.map((f: any) => [
    f.geometry.coordinates[1], // lat
    f.geometry.coordinates[0], // lng
    f.properties.intensity || 1 // intensity
  ]);

  const defaultCenter: [number, number] = [32.8872, 13.1913]; // Tripoli coords
  const mapCenter = heatPoints.length > 0 ? [heatPoints[0][0], heatPoints[0][1]] as [number, number] : defaultCenter;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden flex flex-col min-h-[80vh]">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
           البحث المكاني الذكي
         </h2>
         <Link to="/donor" className="text-sm text-emerald-600 font-bold hover:underline">العودة للبوابة</Link>
      </div>

      <div className="flex gap-2 mb-6">
        <select 
          value={municipality} 
          onChange={(e) => setMunicipality(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-bold"
        >
          <option value="">جميع البلديات (ليبيا)</option>
          <option value="طرابلس">طرابلس</option>
          <option value="بنغازي">بنغازي</option>
          <option value="مصراتة">مصراتة</option>
          <option value="سبها">سبها</option>
          <option value="الزاوية">الزاوية</option>
          <option value="درنة">درنة</option>
        </select>
        
        <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
          <button 
            onClick={() => setViewType('heatmap')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${viewType === 'heatmap' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            خريطة حرارية
          </button>
          <button 
            onClick={() => setViewType('cluster')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${viewType === 'cluster' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            خريطة نقطية
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 relative min-h-[500px]">
         {isLoading ? (
           <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
             <p className="text-slate-500 font-bold">جاري تحميل الخريطة...</p>
           </div>
         ) : (
           <MapContainer center={mapCenter} zoom={6} scrollWheelZoom={true} className="w-full h-full">
             <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
               url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
             />
             <MapCenterer center={mapCenter} />
             
             {viewType === 'heatmap' && heatPoints.length > 0 && (
               <HeatmapLayer points={heatPoints} />
             )}

             {viewType === 'cluster' && filteredFeatures.map((f: any, idx: number) => (
               <Marker 
                 key={idx} 
                 position={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}
               >
                 <Popup>
                   <div className="text-right font-sans" dir="rtl">
                     <p className="font-bold text-slate-800 mb-1">{f.properties.municipality}</p>
                     <p className="text-xs text-slate-600 line-clamp-2">{f.properties.description || 'حالة مسجلة'}</p>
                     <p className="text-xs font-bold text-amber-600 mt-1">الأولوية: {f.properties.intensity}</p>
                     <Link to={`/donor?case=${f.properties.id}`} className="inline-block px-3 py-1 bg-emerald-600 text-white rounded-md font-bold text-xs mt-2 transition-colors hover:bg-emerald-500">تبرع الآن</Link>
                   </div>
                 </Popup>
               </Marker>
             ))}
           </MapContainer>
         )}
      </div>
    </div>
  );
}
