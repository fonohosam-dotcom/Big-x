import { Router } from 'express';
import { db } from '../../db/index.ts';
import { cases } from '../../db/schema.ts';
import { isNotNull, and } from 'drizzle-orm';

const router = Router();

router.get('/heatmaps', async (req, res) => {
  try {
    const casesWithLocation = await db.select({
      id: cases.id,
      lat: cases.locationLat,
      lng: cases.locationLng,
      status: cases.status,
      intensity: cases.votesCount, // Optional: use votes as intensity for heatmap
      municipality: cases.municipality,
      description: cases.description
    }).from(cases)
      .where(and(isNotNull(cases.locationLat), isNotNull(cases.locationLng)));

    const geoJson = {
      type: "FeatureCollection",
      features: casesWithLocation.map(c => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [parseFloat(c.lng as string), parseFloat(c.lat as string)] // [lng, lat] for GeoJSON
        },
        properties: {
          id: c.id,
          status: c.status,
          intensity: c.intensity || 1,
          municipality: c.municipality,
          description: c.description
        }
      }))
    };

    res.json(geoJson);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
