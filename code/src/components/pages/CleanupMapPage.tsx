import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../../services/dbService';
import { CleanupEvent } from '../../types';
import { 
  MapPin, 
  Layers, 
  Search, 
  Calendar, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Filter, 
  Compass, 
  ZoomIn, 
  ZoomOut,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Navigation,
  Loader2,
  Building,
  School,
  Landmark
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EventEditorModal } from '../EventEditorModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { EditableText } from '../EditableText';
import { VIETNAM_PROVINCES_DATA } from '../../data/vietnamAdministrativeData';

interface CleanupMapPageProps {
  onSelectProject: (id: string) => void;
  onRegisterVolunteer: (eventId?: string) => void;
}

type MapLayer = 'streets' | 'satellite' | 'carto';

interface PinnedNewLocation {
  lat: number;
  lng: number;
  placeName: string;
  address: string;
  city: string;
}

interface SearchSuggestion {
  placeId: string;
  name: string;
  subAddress: string;
  lat: number;
  lng: number;
  geojson?: any;
  type?: string;
}

export const CleanupMapPage: React.FC<CleanupMapPageProps> = ({
  onSelectProject,
  onRegisterVolunteer
}) => {
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<CleanupEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<CleanupEvent | null>(null);
  const [currentLayer, setCurrentLayer] = useState<MapLayer>('streets');

  // Search and suggestions state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchedPlaceName, setSearchedPlaceName] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  // Pinned location by user click
  const [pinnedLocation, setPinnedLocation] = useState<PinnedNewLocation | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Modal create/edit state
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const newPinMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const boundaryLayerRef = useRef<L.Layer | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Expose global modal triggers for Leaflet popups
  useEffect(() => {
    (window as any).__openCreateSpotModal = () => {
      setIsEditorOpen(true);
    };
    (window as any).__selectProject = (id: string) => {
      onSelectProject(id);
    };
    (window as any).__registerVolunteer = (id: string) => {
      onRegisterVolunteer(id);
    };
    (window as any).__approveEvent = async (id: string) => {
      await dbService.approveEvent(id);
      alert('Đã phê duyệt điểm dọn rác thành công!');
      dbService.getEvents().then(setEvents);
    };

    return () => {
      delete (window as any).__openCreateSpotModal;
      delete (window as any).__selectProject;
      delete (window as any).__registerVolunteer;
      delete (window as any).__approveEvent;
    };
  }, [onSelectProject, onRegisterVolunteer]);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const refreshEvents = () => {
    dbService.getEvents().then(setEvents);
  };

  useEffect(() => {
    refreshEvents();
    const unsubscribe = dbService.subscribe(refreshEvents);
    return () => unsubscribe();
  }, []);

  // Multi-engine POI & Address Real-time Search (Nominatim + Photon fallback + Acronym Normalization)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      const results: SearchSuggestion[] = [];

      // Expand common Vietnamese abbreviations
      const normalizedQuery = searchQuery
        .replace(/\bthpt\b/gi, 'Trường THPT')
        .replace(/\bthcs\b/gi, 'Trường THCS')
        .replace(/\btiểu học\b/gi, 'Trường Tiểu học')
        .replace(/\bđh\b/gi, 'Đại học')
        .replace(/\bbv\b/gi, 'Bệnh viện')
        .replace(/\bubnd\b/gi, 'Ủy ban nhân dân')
        .replace(/\bkđt\b/gi, 'Khu đô thị')
        .replace(/\btp\b/gi, 'Thành phố')
        .trim();

      const queriesToTry = Array.from(new Set([searchQuery.trim(), normalizedQuery]));

      for (const q of queriesToTry) {
        try {
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=vn&format=json&addressdetails=1&limit=8&polygon_geojson=1`,
            { headers: { 'Accept-Language': 'vi,en' } }
          );
          if (nomRes.ok) {
            const data = await nomRes.json();
            data.forEach((item: any) => {
              const addr = item.address || {};
              const mainName = item.name || 
                addr.school || 
                addr.hospital || 
                addr.building || 
                addr.amenity || 
                addr.tourism || 
                addr.road || 
                addr.suburb || 
                addr.quarter || 
                addr.town || 
                addr.city || 
                item.display_name.split(',')[0];

              const subAddress = item.display_name.replace(mainName + ', ', '').replace(mainName, '');
              const lat = parseFloat(item.lat);
              const lon = parseFloat(item.lon);

              const exists = results.some(r => Math.abs(r.lat - lat) < 0.0005 && Math.abs(r.lng - lon) < 0.0005);
              if (!exists) {
                results.push({
                  placeId: String(item.place_id),
                  name: mainName,
                  subAddress: subAddress || item.display_name,
                  lat,
                  lng: lon,
                  geojson: item.geojson,
                  type: item.type || item.class
                });
              }
            });
          }
        } catch (e) {
          console.warn('Nominatim suggestion error:', e);
        }

        if (results.length >= 6) break;
      }

      // Secondary Photon Komoot Geocoder for fast small village/hamlet/street search
      if (results.length < 5) {
        try {
          const photonRes = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(normalizedQuery)}&limit=6&bbox=102.0,8.0,110.0,24.0`
          );
          if (photonRes.ok) {
            const data = await photonRes.json();
            if (data.features) {
              data.features.forEach((feat: any) => {
                const props = feat.properties || {};
                const name = props.name || props.street || props.city || 'Địa điểm';
                const sub = [props.street, props.district, props.city, props.country].filter(Boolean).join(', ');
                const [lon, lat] = feat.geometry.coordinates;

                const alreadyExists = results.some(r => Math.abs(r.lat - lat) < 0.001 && Math.abs(r.lng - lon) < 0.001);
                if (!alreadyExists) {
                  results.push({
                    placeId: `photon-${props.osm_id || Math.random()}`,
                    name,
                    subAddress: sub || 'Việt Nam',
                    lat,
                    lng: lon,
                    type: props.osm_value
                  });
                }
              });
            }
          }
        } catch (e) {
          console.warn('Photon suggestion error:', e);
        }
      }

      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setIsSearchingSuggestions(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Distinct map tile layers
  const getTileUrl = (layer: MapLayer) => {
    switch (layer) {
      case 'satellite':
        return 'https://mt1.google.com/vt/lyrs=y&hl=vi&x={x}&y={y}&z={z}';
      case 'carto':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      case 'streets':
      default:
        return 'https://mt1.google.com/vt/lyrs=m&hl=vi&x={x}&y={y}&z={z}';
    }
  };

  const getTileOptions = (layer: MapLayer): L.TileLayerOptions => {
    if (layer === 'carto') {
      return {
        attribution: '&copy; Esri &copy; OpenStreetMap contributors &copy; Let\'s do it! Vietnam',
        maxZoom: 19
      };
    }
    return {
      attribution: '&copy; Google Maps &copy; Let\'s do it! Vietnam Map Data',
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    };
  };

  // Ultra-reliable Reverse Geocoding with BigDataCloud & Nominatim
  const fetchAddressFromCoords = async (lat: number, lng: number): Promise<{ placeName: string; address: string; city: string }> => {
    try {
      const bdcRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=vi`
      );
      if (bdcRes.ok) {
        const bdc = await bdcRes.json();
        const locality = bdc.locality || bdc.city || bdc.principalSubdivision || '';
        const province = (bdc.principalSubdivision || 'Việt Nam').replace(/Thành phố |Tỉnh |Quận /g, '');
        const specificName = bdc.locality || bdc.lookupSource || '';

        try {
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'vi' } }
          );
          if (nomRes.ok) {
            const nom = await nomRes.json();
            const addr = nom.address || {};
            const poi = nom.name ||
              addr.amenity ||
              addr.building ||
              addr.hospital ||
              addr.social_facility ||
              addr.healthcare ||
              addr.tourism ||
              addr.leisure ||
              addr.emergency ||
              addr.school ||
              addr.university ||
              addr.shop ||
              addr.office ||
              addr.place ||
              addr.road;

            const placeNameResult = poi || specificName || (locality ? `Khu vực ${locality}` : 'Điểm dọn rác đã chọn');
            const cleanAddress = nom.display_name || `${specificName ? specificName + ', ' : ''}${locality ? locality + ', ' : ''}${province}`;
            return {
              placeName: placeNameResult,
              address: cleanAddress,
              city: province || 'Việt Nam'
            };
          }
        } catch {}

        return {
          placeName: specificName || (locality ? `Khu vực ${locality}` : 'Điểm dọn rác mới'),
          address: `${locality ? locality + ', ' : ''}${province}`,
          city: province || 'Việt Nam'
        };
      }
    } catch {}

    return {
      placeName: `Điểm dọn (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      address: `Tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      city: 'Việt Nam'
    };
  };

  // Fly to exact location & draw red dashed boundary matching screenshot 2
  const applyLocationSearchAndBoundary = async (query: string, customLat?: number, customLng?: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
      boundaryLayerRef.current = null;
    }

    if (!query.trim()) return;

    setSearchedPlaceName(query);

    try {
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Vietnam')}&countrycodes=vn&format=json&polygon_geojson=1&limit=1`,
        { headers: { 'Accept-Language': 'vi' } }
      );

      if (nomRes.ok) {
        const data = await nomRes.json();
        if (data && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const displayName = item.display_name.split(',')[0];

          map.flyTo([lat, lng], 16, { duration: 1.2 });

          // Render boundary if polygon exists
          if (item.geojson && (item.geojson.type === 'Polygon' || item.geojson.type === 'MultiPolygon')) {
            const geoLayer = L.geoJSON(item.geojson, {
              style: {
                color: '#EF4444',
                weight: 3.5,
                dashArray: '8, 8', // Red dashed boundary matching Screenshot 2
                fillColor: '#EF4444',
                fillOpacity: 0.08
              }
            }).addTo(map);

            boundaryLayerRef.current = geoLayer;
            map.fitBounds(geoLayer.getBounds(), { padding: [40, 40], maxZoom: 16 });
          } else {
            // Draw smooth fallback boundary polygon for the POI/location
            const d = 0.015; // Closer box for specific school/building
            const polygonPoints: [number, number][] = [
              [lat + d, lng - d * 1.1],
              [lat + d * 0.9, lng + d * 0.8],
              [lat - d * 0.4, lng + d * 1.2],
              [lat - d * 0.9, lng + d * 0.3],
              [lat - d * 0.7, lng - d * 1.0]
            ];
            const fallbackPoly = L.polygon(polygonPoints, {
              color: '#EF4444',
              weight: 3.5,
              dashArray: '8, 8',
              fillColor: '#EF4444',
              fillOpacity: 0.08
            }).addTo(map);
            boundaryLayerRef.current = fallbackPoly;
          }

          // Render a red search pin
          if (newPinMarkerRef.current) {
            map.removeLayer(newPinMarkerRef.current);
          }

          const pinIcon = L.divIcon({
            className: 'custom-search-pin',
            html: `
              <div class="relative flex items-center justify-center cursor-pointer animate-bounce">
                <div class="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-2xl border-2 border-white ring-4 ring-red-400/40">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
              </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 24],
            popupAnchor: [0, -24]
          });

          const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
          newPinMarkerRef.current = marker;

          marker.bindPopup(`
            <div class="p-2.5 font-sans max-w-xs text-slate-900">
              <div class="flex items-center gap-1.5 text-red-600 font-extrabold text-xs mb-1">
                <span>📍</span> <span>VỊ TRÍ ĐÃ TÌM THẤY</span>
              </div>
              <div class="font-extrabold text-sm text-slate-900 mb-1 leading-snug">
                ${displayName}
              </div>
              <div class="text-xs text-slate-600 mb-2 leading-relaxed">
                ${item.display_name}
              </div>
              <div class="text-[10px] text-slate-500 mb-3">
                Tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}
              </div>
              <button onclick="window.__openCreateSpotModal()" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer text-center">
                Đăng Bài & Điểm Rác Tại Vị Trí Này
              </button>
            </div>
          `).openPopup();

          setPinnedLocation({
            lat,
            lng,
            placeName: displayName,
            address: item.display_name,
            city: 'Việt Nam'
          });

          return;
        }
      }
    } catch (err) {
      console.warn('Geocoding error:', err);
    }

    if (customLat && customLng) {
      map.flyTo([customLat, customLng], 15, { duration: 1.2 });
    }
  };

  const handleSelectSuggestion = (sug: SearchSuggestion) => {
    setSearchQuery(sug.name);
    setSearchedPlaceName(sug.name);
    setShowSuggestions(false);
    
    const map = mapInstanceRef.current;
    if (!map) return;

    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
      boundaryLayerRef.current = null;
    }

    map.flyTo([sug.lat, sug.lng], 16, { duration: 1.2 });

    if (sug.geojson && (sug.geojson.type === 'Polygon' || sug.geojson.type === 'MultiPolygon')) {
      const geoLayer = L.geoJSON(sug.geojson, {
        style: {
          color: '#EF4444',
          weight: 3.5,
          dashArray: '8, 8', // Red dashed line matching Screenshot 2
          fillColor: '#EF4444',
          fillOpacity: 0.08
        }
      }).addTo(map);

      boundaryLayerRef.current = geoLayer;
      map.fitBounds(geoLayer.getBounds(), { padding: [40, 40], maxZoom: 16 });
    } else {
      const d = 0.015;
      const polygonPoints: [number, number][] = [
        [sug.lat + d, sug.lng - d * 1.1],
        [sug.lat + d * 0.9, sug.lng + d * 0.8],
        [sug.lat - d * 0.4, sug.lng + d * 1.2],
        [sug.lat - d * 0.9, sug.lng + d * 0.3],
        [sug.lat - d * 0.7, sug.lng - d * 1.0]
      ];
      const fallbackPoly = L.polygon(polygonPoints, {
        color: '#EF4444',
        weight: 3.5,
        dashArray: '8, 8',
        fillColor: '#EF4444',
        fillOpacity: 0.08
      }).addTo(map);
      boundaryLayerRef.current = fallbackPoly;
    }

    if (newPinMarkerRef.current) {
      map.removeLayer(newPinMarkerRef.current);
    }

    const pinIcon = L.divIcon({
      className: 'custom-search-pin',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer animate-bounce">
          <div class="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-2xl border-2 border-white ring-4 ring-red-400/40">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24]
    });

    const marker = L.marker([sug.lat, sug.lng], { icon: pinIcon }).addTo(map);
    newPinMarkerRef.current = marker;

    marker.bindPopup(`
      <div class="p-2.5 font-sans max-w-xs text-slate-900">
        <div class="flex items-center gap-1.5 text-red-600 font-extrabold text-xs mb-1">
          <span>📍</span> <span>VỊ TRÍ ĐÃ TÌM THẤY</span>
        </div>
        <div class="font-extrabold text-sm text-slate-900 mb-1 leading-snug">
          ${sug.name}
        </div>
        <div class="text-xs text-slate-600 mb-2 leading-relaxed">
          ${sug.subAddress}
        </div>
        <div class="text-[10px] text-slate-500 mb-3">
          Tọa độ: ${sug.lat.toFixed(5)}, ${sug.lng.toFixed(5)}
        </div>
        <button onclick="window.__openCreateSpotModal()" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer text-center">
          Đăng Bài & Điểm Rác Tại Vị Trí Này
        </button>
      </div>
    `).openPopup();

    setPinnedLocation({
      lat: sug.lat,
      lng: sug.lng,
      placeName: sug.name,
      address: sug.subAddress,
      city: 'Việt Nam'
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [16.0544, 108.0],
        zoom: 6,
        zoomControl: false,
        attributionControl: false
      });

      const tileLayer = L.tileLayer(getTileUrl('streets'), getTileOptions('streets')).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;

      // Handle map click to pin new location
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setIsLoadingAddress(true);

        const geo = await fetchAddressFromCoords(lat, lng);
        setIsLoadingAddress(false);

        const pinData: PinnedNewLocation = {
          lat,
          lng,
          placeName: geo.placeName,
          address: geo.address,
          city: geo.city
        };
        setPinnedLocation(pinData);

        if (newPinMarkerRef.current) {
          map.removeLayer(newPinMarkerRef.current);
        }

        const newPinIcon = L.divIcon({
          className: 'custom-new-pin',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer animate-bounce">
              <div class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-2xl border-2 border-white ring-4 ring-emerald-300/50">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <div class="absolute -bottom-2 bg-emerald-950 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full shadow border border-emerald-500 whitespace-nowrap">
                Ghim Mới
              </div>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
          popupAnchor: [0, -24]
        });

        const newMarker = L.marker([lat, lng], { icon: newPinIcon }).addTo(map);
        newPinMarkerRef.current = newMarker;

        const popupContent = `
          <div class="p-2 font-sans max-w-xs text-slate-900">
            <div class="flex items-center gap-1.5 text-emerald-600 font-extrabold text-xs mb-1">
              <span>📍</span> <span>ĐÃ GHIM ĐỊA ĐIỂM MỚI</span>
            </div>
            <div class="font-extrabold text-sm text-slate-900 mb-1 leading-snug">
              ${geo.placeName}
            </div>
            <div class="text-xs text-slate-600 mb-1 leading-relaxed">
              ${geo.address}
            </div>
            <div class="text-[10px] text-slate-500 mb-3">
              Tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}
            </div>
            <button onclick="window.__openCreateSpotModal()" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer text-center flex items-center justify-center gap-1">
              <span>Đăng Bài & Ảnh Điểm Rác Tại Đây</span>
            </button>
          </div>
        `;

        newMarker.bindPopup(popupContent, { maxWidth: 320 }).openPopup();
      });

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    const handleResize = () => {
      mapInstanceRef.current?.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update Tile Layer when layer switch changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const newTile = L.tileLayer(getTileUrl(currentLayer), getTileOptions(currentLayer)).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTile;
    mapInstanceRef.current.invalidateSize();
  }, [currentLayer]);

  // Update Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach(marker => map.removeLayer(marker));
    markersRef.current = {};

    events.forEach(evt => {
      let coords = evt.coordinates || { lat: 21.0285, lng: 105.8542 };
      if (evt.id === 'evt-green-ocean-danang') {
        coords = { lat: 16.1083, lng: 108.2778 }; // Bán đảo Sơn Trà Đà Nẵng
      } else if (evt.id === 'evt-env-day-hcm') {
        coords = { lat: 10.7769, lng: 106.6924 };
      } else if (evt.id === 'evt-wildlife-catba') {
        coords = { lat: 20.8000, lng: 106.9961 };
      } else if (evt.id === 'evt-wcd-2026') {
        coords = { lat: 21.0245, lng: 105.8576 };
      }

      const isSelected = activeEvent?.id === evt.id;
      const isPending = evt.status === 'Pending';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform ${isSelected ? 'scale-125 z-50' : ''}">
            <div class="absolute -inset-2 ${isPending ? 'bg-amber-500/40' : 'bg-pink-500/30'} rounded-full animate-ping"></div>
            <div class="w-10 h-10 rounded-full ${isPending ? 'bg-amber-500 ring-2 ring-amber-300' : 'bg-gradient-to-tr from-[#E81A7F] to-[#FF4D9E]'} flex items-center justify-center text-white shadow-xl border-2 border-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            ${isPending ? `
              <div class="absolute -top-2 -right-2 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full border border-white shadow">
                Chờ duyệt
              </div>
            ` : ''}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);
      markersRef.current[evt.id] = marker;

      const popupContent = `
        <div class="p-2 font-sans max-w-xs text-slate-900">
          <div class="relative aspect-16/9 rounded-xl overflow-hidden mb-2 bg-slate-100">
            <img src="${evt.image}" alt="${evt.title}" class="w-full h-full object-cover" />
            <div class="absolute top-2 left-2 bg-[#E81A7F] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
              ${evt.category}
            </div>
            ${isPending ? `
              <div class="absolute top-2 right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                Chờ duyệt
              </div>
            ` : ''}
          </div>

          <h4 class="font-extrabold text-sm text-slate-900 line-clamp-1 mb-1">
            ${evt.title}
          </h4>

          <div class="space-y-1 text-xs text-slate-600 mb-3">
            <div class="flex items-center gap-1.5">
              <span>📍</span> <span class="truncate">${evt.location} (${evt.city})</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span>📅</span> <span>${evt.date} • ${evt.time}</span>
            </div>
            <div class="flex items-center gap-1.5 text-emerald-600 font-bold">
              <span>👥</span> <span>Đã có ${evt.registeredCount || 0} người đăng ký tham gia</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="window.__selectProject('${evt.id}')" class="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer text-center">
              Chi Tiết
            </button>
            <button onclick="window.__registerVolunteer('${evt.id}')" class="flex-1 py-2 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer text-center">
              Đăng Ký
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });

      marker.on('click', () => {
        setActiveEvent(evt);
      });
    });
  }, [events, activeEvent, isAdmin]);

  const handleFlyToEvent = (evt: CleanupEvent) => {
    setActiveEvent(evt);
    let coords = evt.coordinates || { lat: 21.0285, lng: 105.8542 };
    if (evt.id === 'evt-green-ocean-danang') {
      coords = { lat: 16.1083, lng: 108.2778 }; // Bán đảo Sơn Trà Đà Nẵng
    } else if (evt.id === 'evt-env-day-hcm') {
      coords = { lat: 10.7769, lng: 106.6924 };
    } else if (evt.id === 'evt-wildlife-catba') {
      coords = { lat: 20.8000, lng: 106.9961 };
    }

    mapInstanceRef.current?.flyTo([coords.lat, coords.lng], 15, { duration: 1.2 });
    setMobileTab('map');
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
    
    // Draw boundary around the area
    if (boundaryLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(boundaryLayerRef.current);
      boundaryLayerRef.current = null;
    }

    const d = 0.03;
    const polygonPoints: [number, number][] = [
      [coords.lat + d, coords.lng - d * 1.1],
      [coords.lat + d * 0.9, coords.lng + d * 0.8],
      [coords.lat - d * 0.4, coords.lng + d * 1.2],
      [coords.lat - d * 0.9, coords.lng + d * 0.3],
      [coords.lat - d * 0.7, coords.lng - d * 1.0]
    ];
    const poly = L.polygon(polygonPoints, {
      color: '#EF4444',
      weight: 3.5,
      dashArray: '8, 8', // Red dashed line matching Screenshot 2
      fillColor: '#EF4444',
      fillOpacity: 0.08
    }).addTo(mapInstanceRef.current!);
    boundaryLayerRef.current = poly;

    setTimeout(() => {
      markersRef.current[evt.id]?.openPopup();
    }, 1300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      applyLocationSearchAndBoundary(searchQuery);
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetView = () => {
    mapInstanceRef.current?.flyTo([16.0544, 108.0], 6, { duration: 1.2 });
    setActiveEvent(null);
    setSearchedPlaceName(null);
    if (boundaryLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(boundaryLayerRef.current);
      boundaryLayerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-950 select-none overflow-hidden">
      
      {/* Top Map Header & Controls Bar */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 md:px-8 py-2.5 backdrop-blur-md sticky top-0 z-30 shadow-lg w-full">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-pink-500/20 text-[#E81A7F]">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <EditableText contentKey="cleanupMap.title" defaultValue={t.mapTitle || (language === 'vi' ? "Bản Đồ Địa Lý Toàn Quốc" : "Nationwide Cleanup Spot Map")} as="h1" className="text-base sm:text-lg font-black text-white leading-tight" />
              <EditableText contentKey="cleanupMap.subtitle" defaultValue={t.mapSubtitle || (language === 'vi' ? "Tìm kiếm bất kỳ địa điểm, trường học, bệnh viện hay địa danh nào để định vị trực tiếp trên bản đồ." : "Search any place, school, hospital or landmark to locate directly on the map.")} as="p" multiline className="text-[11px] text-slate-400" />
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setPinnedLocation(null);
                setIsEditorOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdmin ? (language === 'vi' ? 'Thêm Điểm Mới (Admin)' : 'Add New Spot (Admin)') : <EditableText contentKey="cleanupMap.addSpotBtn" defaultValue={language === 'vi' ? "Đăng Điểm Dọn Rác Mới" : "Report Cleanup Spot"} as="span" />}</span>
            </button>
          </div>

          {/* Mobile Tab Switcher (Visible only on mobile/tablet screens < lg) */}
          <div className="flex lg:hidden items-center bg-slate-800/90 p-1 rounded-xl w-full border border-slate-700/80">
            <button
              onClick={() => {
                setMobileTab('map');
                setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                mobileTab === 'map' ? 'bg-[#E81A7F] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🗺️ <EditableText contentKey="cleanupMap.mobileTabMap" defaultValue="Bản Đồ" as="span" />
            </button>
            <button
              onClick={() => setMobileTab('list')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                mobileTab === 'list' ? 'bg-[#E81A7F] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 <EditableText contentKey="cleanupMap.mobileTabList" defaultValue="Danh Sách Điểm" as="span" /> ({events.length})
            </button>
          </div>

        </div>
      </div>

      {/* Main Map Body: 2 Columns (Sidebar + Real Map) */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* Left Interactive Sidebar */}
        <div className={`w-full lg:w-96 bg-slate-900 border-r border-slate-800 flex-col z-20 shadow-2xl ${
          mobileTab === 'map' ? 'hidden lg:flex' : 'flex flex-1 max-h-full lg:max-h-[calc(100vh-140px)]'
        }`}>
          
          {/* Quick Info & Selected Boundary Status */}
          <div className="p-4 border-b border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                <EditableText contentKey="cleanupMap.locationLabel" defaultValue="Vị Trí Bản Đồ" as="span" />
              </span>
              {searchedPlaceName && (
                <button
                  onClick={handleResetView}
                  className="text-[11px] font-bold text-pink-400 hover:text-pink-300 cursor-pointer"
                >
                  <EditableText contentKey="cleanupMap.clearBoundaryBtn" defaultValue="Xóa khoanh vùng" as="span" />
                </button>
              )}
            </div>

            {searchedPlaceName ? (
              <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/50 text-white space-y-1">
                <div className="flex items-center gap-1.5 text-red-400 font-extrabold text-xs">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <EditableText contentKey="cleanupMap.locatingLabel" defaultValue="ĐANG ĐỊNH VỊ & KHOANH VÙNG:" as="span" />
                </div>
                <div className="font-extrabold text-sm text-white">
                  📍 {searchedPlaceName}
                </div>
                <EditableText contentKey="cleanupMap.boundaryDrawnHint" defaultValue="Đã khoanh vùng ranh giới nét đứt màu đỏ trên bản đồ." as="div" multiline className="text-[10px] text-slate-400" />
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs">
                💡 <EditableText contentKey="cleanupMap.searchHint" defaultValue="Sử dụng thanh tìm kiếm phía trên bản đồ để tìm bất kỳ trường học, bệnh viện, tỉnh thành hoặc địa danh nào." as="span" multiline />
              </div>
            )}
          </div>

          {/* Cleanup Campaign Spots List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span><EditableText contentKey="cleanupMap.featuredSpotsLabel" defaultValue="Các Điểm Dọn Rác Nổi Bật" as="span" /> ({events.length})</span>
              <EditableText contentKey="cleanupMap.tapToZoomHint" defaultValue="Bấm để zoom tới" as="span" className="text-[10px] text-[#E81A7F] font-semibold" />
            </div>

            {events.map(evt => {
              const isSelected = activeEvent?.id === evt.id;
              const isPending = evt.status === 'Pending';

              return (
                <div
                  key={evt.id}
                  onClick={() => handleFlyToEvent(evt)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isPending
                      ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500'
                      : isSelected 
                        ? 'bg-pink-950/40 border-[#E81A7F] shadow-lg ring-1 ring-[#E81A7F]' 
                        : 'bg-slate-800/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-black uppercase bg-pink-500/20 text-[#FF4D9E] px-2 py-0.5 rounded-full">
                          {evt.category}
                        </span>
                        {isPending && (
                          <EditableText contentKey="cleanupMap.pendingBadge" defaultValue="Chờ duyệt" as="span" className="text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md" />
                        )}
                        <span className="text-[10px] text-slate-400 font-bold ml-auto">
                          📍 {evt.city}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-xs text-white truncate">
                        {evt.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {evt.location}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">📅 {evt.date}</span>
                        <span className="text-emerald-400 font-bold">👥 {evt.registeredCount || 0} ĐK</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Interactive Leaflet Map Area */}
        <div className={`flex-1 relative w-full h-full min-h-[420px] ${mobileTab === 'list' ? 'hidden lg:block' : 'block'}`}>
          
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating Google Maps-Style Search Card On Top Left (Exact Match to Screenshot 2) */}
          <div 
            ref={searchContainerRef}
            className="absolute top-4 left-4 z-30 w-full max-w-sm sm:max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 flex items-center gap-2">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 pl-2">
                <Search className="w-5 h-5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm vị trí (vd: THPT Giao Thủy, Bán đảo Sơn Trà...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  className="w-full text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden py-1.5"
                />
              </form>

              {isSearchingSuggestions && (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin mr-1" />
              )}

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => applyLocationSearchAndBoundary(searchQuery)}
                className="p-2 bg-[#E81A7F] hover:bg-[#D01370] text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                title="Tìm kiếm vị trí"
              >
                <Navigation className="w-4 h-4" />
              </button>
            </div>

            {/* Autocomplete Dropdown List (Exact match to Screenshot 2) */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="mt-1.5 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150 max-h-80 overflow-y-auto">
                <EditableText contentKey="cleanupMap.suggestionsHeader" defaultValue="Gợi ý địa điểm & cơ sở" as="div" className="px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100" />
                {suggestions.map((sug) => (
                  <div
                    key={sug.placeId}
                    onClick={() => handleSelectSuggestion(sug)}
                    className="px-3.5 py-2.5 hover:bg-slate-100 cursor-pointer flex items-start gap-3 border-b border-slate-100 last:border-0 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                      {sug.type === 'school' || sug.name.toLowerCase().includes('thpt') || sug.name.toLowerCase().includes('trường') ? (
                        <School className="w-4 h-4 text-emerald-600" />
                      ) : sug.type === 'hospital' || sug.name.toLowerCase().includes('bệnh viện') ? (
                        <Building className="w-4 h-4 text-red-600" />
                      ) : (
                        <MapPin className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {sug.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {sug.subAddress}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Floating Map Controls Top-Right */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            
            {/* Map Layer Switcher */}
            <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-1">
              <button
                onClick={() => setCurrentLayer('streets')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentLayer === 'streets'
                    ? 'bg-[#E81A7F] text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Bản đồ đường phố Google Maps"
              >
                <EditableText contentKey="cleanupMap.layerStreets" defaultValue="Đường phố" as="span" />
              </button>
              <button
                onClick={() => setCurrentLayer('satellite')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentLayer === 'satellite'
                    ? 'bg-[#E81A7F] text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Bản đồ vệ tinh lai có tên đường"
              >
                <EditableText contentKey="cleanupMap.layerSatellite" defaultValue="Vệ tinh" as="span" />
              </button>
              <button
                onClick={() => setCurrentLayer('carto')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentLayer === 'carto'
                    ? 'bg-[#E81A7F] text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Bản đồ địa hình chuyên sâu (Topographic Terrain)"
              >
                <EditableText contentKey="cleanupMap.layerTerrain" defaultValue="Địa hình" as="span" />
              </button>
            </div>

            {/* Navigation & Zoom controls */}
            <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700 shadow-xl flex flex-col gap-1 items-center self-end">
              <button
                onClick={handleZoomIn}
                className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Phóng to (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Thu nhỏ (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="w-full border-t border-slate-700 my-0.5"></div>
              <button
                onClick={handleResetView}
                className="p-2.5 text-slate-300 hover:text-[#E81A7F] hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Toàn cảnh Việt Nam"
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Floating Pinned Location Action Card */}
          {pinnedLocation && (
            <div className="absolute top-20 left-4 right-4 sm:left-4 sm:right-auto sm:max-w-sm z-20 bg-slate-900/95 backdrop-blur-md p-4 rounded-3xl border border-emerald-500 shadow-2xl animate-in slide-in-from-top-3 duration-200">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-xs">
                  <span className="p-1 rounded-lg bg-emerald-500/20">📍</span>
                  <EditableText contentKey="cleanupMap.pinnedLabel" defaultValue="ĐÃ CHỌN VỊ TRÍ GHIM" as="span" />
                </div>
                <button
                  onClick={() => setPinnedLocation(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm font-extrabold text-white mb-1 leading-snug">
                {pinnedLocation.placeName}
              </div>
              <div className="text-xs text-slate-300 mb-1 leading-relaxed">
                {pinnedLocation.address}
              </div>
              <div className="text-[10px] text-slate-400 mb-3">
                Tọa độ: ${pinnedLocation.lat.toFixed(5)}, ${pinnedLocation.lng.toFixed(5)} • ${pinnedLocation.city}
              </div>

              <button
                onClick={() => setIsEditorOpen(true)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <EditableText contentKey="cleanupMap.pinnedSubmitBtn" defaultValue="Đăng Điểm Rác & Hình Ảnh Lên Vị Trí Này" as="span" />
              </button>
            </div>
          )}

          {/* Active Event Card at Bottom Overlay */}
          {activeEvent && (
            <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-20 bg-slate-900/95 backdrop-blur-md p-4 rounded-3xl border border-slate-700 shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-start gap-3.5">
                <img
                  src={activeEvent.image}
                  alt={activeEvent.title}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-extrabold uppercase bg-pink-500/20 text-[#FF4D9E] px-2 py-0.5 rounded-full">
                      {activeEvent.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold ml-auto">
                      📍 {activeEvent.city}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-white truncate">
                    {activeEvent.title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {activeEvent.location}
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    <a
                      href={`#project-${activeEvent.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectProject(activeEvent.id);
                      }}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer text-center inline-block"
                    >
                      <EditableText contentKey="cleanupMap.viewProjectBtn" defaultValue="Xem Dự Án" as="span" />
                    </a>
                    <a
                      href={`#register-${activeEvent.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onRegisterVolunteer(activeEvent.id);
                      }}
                      className="flex-1 py-2 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer text-center inline-block"
                    >
                      <EditableText contentKey="cleanupMap.registerBtn" defaultValue="Đăng Ký Tham Gia" as="span" />
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => setActiveEvent(null)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Create/Edit Spot Modal */}
      <EventEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaved={refreshEvents}
        initialCoordinates={pinnedLocation ? { lat: pinnedLocation.lat, lng: pinnedLocation.lng } : undefined}
        initialTitle={pinnedLocation ? `Điểm Dọn Rác: ${pinnedLocation.placeName}` : ''}
        initialLocation={pinnedLocation ? pinnedLocation.address : ''}
        initialCity={pinnedLocation ? pinnedLocation.city : ''}
      />

    </div>
  );
};


