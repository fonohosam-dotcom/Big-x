import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  const [isReady, setIsReady] = useState(() => {
    const size = map.getSize();
    return size.x > 0 && size.y > 0;
  });

  useEffect(() => {
    if (isReady) return;

    const checkSize = () => {
      const size = map.getSize();
      if (size.x > 0 && size.y > 0) {
        setIsReady(true);
        map.off('resize', checkSize);
      }
    };

    map.on('resize', checkSize);
    
    // Fallback polling just in case resize event is missed
    const interval = setInterval(() => {
      map.invalidateSize();
      checkSize();
    }, 200);

    return () => {
      map.off('resize', checkSize);
      clearInterval(interval);
    };
  }, [map, isReady]);

  useEffect(() => {
    if (!isReady || !points || points.length === 0) return;

    // Remove old layers
    map.eachLayer((layer: any) => {
      if (layer._heat) {
        map.removeLayer(layer);
      }
    });

    const heatLayer = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, isReady]);

  return null;
}
