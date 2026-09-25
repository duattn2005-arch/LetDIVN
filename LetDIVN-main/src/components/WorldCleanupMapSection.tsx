import React, { useEffect, useRef, useState } from 'react';
import { Users } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { dbService } from '../services/dbService';
import { CleanupEvent } from '../types';

const YEARS = [2024, 2025, 2026];
const VIETNAM_CENTER: [number, number] = [16.05, 108.0];

// Same pin graphic worldcleanupday.org uses on its own map widget
// (downloaded from their CDN and self-hosted for reliability).
const pinIcon = L.icon({
  iconUrl: '/images/map-pin.png',
  iconSize: [24, 42],
  iconAnchor: [12, 42],
  popupAnchor: [0, -38],
});

/**
 * Year-filterable map of World Cleanup Day locations, mirroring the map
 * widget on worldcleanupday.org's homepage — shown under the World Cleanup
 * Day project story (ProjectDetailPage), not the standalone /map/ page.
 * Same OpenStreetMap tiles, default Leaflet zoom control, and pin graphic
 * as the reference so it matches exactly.
 */
export const WorldCleanupMapSection: React.FC = () => {
  const [year, setYear] = useState(2026);
  const [events, setEvents] = useState<CleanupEvent[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const refresh = () => { dbService.getEvents().then(setEvents); };
    refresh();
    const unsub = dbService.subscribe(refresh);
    return unsub;
  }, []);

  const yearEvents = events.filter((e) => new Date(e.date).getFullYear() === year);
  const totalVolunteers = yearEvents.reduce((sum, e) => sum + (e.registeredCount || 0), 0);

  // Init map once.
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: VIETNAM_CENTER,
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
    });
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 20,
    }).addTo(map);
    L.control.attribution({ position: 'bottomright', prefix: 'Leaflet' })
      .addTo(map)
      .addAttribution("&copy; Google Maps &copy; Let's do it! Vietnam Map Data");
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Redraw pins whenever the filtered event list changes, then fit the map
  // to whatever pins exist that year — same behavior as the reference site's
  // `map.fitBounds(allCoordinates)`, falling back to the default Vietnam
  // view when a year has no located events yet.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const coords: [number, number][] = [];
    yearEvents.forEach((evt) => {
      if (!evt.coordinates) return;
      const pos: [number, number] = [evt.coordinates.lat, evt.coordinates.lng];
      coords.push(pos);
      const marker = L.marker(pos, { icon: pinIcon });
      marker.bindPopup(
        `<div class="font-sans text-sm"><strong>${evt.title}</strong><br/>${evt.city}, ${evt.date}</div>`
      );
      marker.addTo(layer);
    });

    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 12 });
    } else {
      map.setView(VIETNAM_CENTER, 5);
    }
  }, [yearEvents]);

  return (
    <div className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="ref-heading text-2xl sm:text-3xl text-center mb-2" style={{ color: '#F1138D' }}>
          World Cleanup Day in Vietnam
        </h3>
        <div className="flex items-center justify-center gap-2 text-slate-600 text-sm mb-6">
          <Users className="w-4 h-4" style={{ color: '#F1138D' }} />
          <span>
            <strong className="text-slate-900">{totalVolunteers.toLocaleString()}</strong> volunteers registered
            across <strong className="text-slate-900">{yearEvents.length}</strong> location{yearEvents.length === 1 ? '' : 's'} in {year}
          </span>
        </div>

        {/* Year tabs */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {YEARS.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={`px-6 py-2 rounded-lg border-2 font-black text-sm transition-colors cursor-pointer ${
                y === year
                  ? 'text-white border-transparent'
                  : 'bg-white border-[#F1138D] text-[#F1138D] hover:bg-pink-50'
              }`}
              style={y === year ? { backgroundColor: '#F1138D' } : undefined}
            >
              {y}
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="relative isolate rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <div ref={mapContainerRef} className="w-full h-[380px] sm:h-[460px] bg-slate-100" />
        </div>

        {/* Matches the reference: no separate list, just the map — an empty
            state line only appears when the selected year has no located events. */}
        {yearEvents.length === 0 && (
          <div className="mt-6 text-center py-6 bg-slate-50 rounded-xl text-slate-500 text-sm font-semibold">
            No items found.
          </div>
        )}
      </div>
    </div>
  );
};
