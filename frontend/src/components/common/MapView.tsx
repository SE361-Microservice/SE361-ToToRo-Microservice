import { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import type { ViewStateChangeEvent, MapRef } from 'react-map-gl/mapbox';
import { useNavigate } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTheme } from '../../providers/ThemeProvider';
import clsx from 'clsx';

interface MapViewProps {
  listings: any[]; // Accepts both ListingSummaryResponse and legacy Listing
  focusedListingId?: number | string | null;
  onMarkerClick?: (id: number | string) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const DEFAULT_CENTER = { lat: 10.762622, lng: 106.660172 };

export default function MapView({ 
  listings, 
  focusedListingId, 
  onMarkerClick,
  center = DEFAULT_CENTER,
  zoom = 13
}: MapViewProps) {
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [viewState, setViewState] = useState({
    longitude: center.lng,
    latitude: center.lat,
    zoom: zoom
  });

  // Local hover state for markers hovered directly on the map
  const [hoveredMarkerId, setHoveredMarkerId] = useState<number | string | null>(null);
  // Selected state for Modal
  const [selectedListingId, setSelectedListingId] = useState<number | string | null>(null);

  // Determine which listing should show its hover tooltip
  const activeListingId = focusedListingId || hoveredMarkerId;
  const selectedListing = listings.find(l => String(l.id) === String(selectedListingId));

  // Smooth fly-to when a listing is focused from the list sidebar
  useEffect(() => {
    if (focusedListingId && mapRef.current) {
      const target = listings.find(l => String(l.id) === String(focusedListingId));
      if (target) {
        mapRef.current.flyTo({
          center: [target.longitude, target.latitude],
          duration: 800,   // 800ms smooth animation
          essential: true,
        });
      }
    }
  }, [focusedListingId, listings]);

  const handleMarkerEnter = useCallback((id: number | string) => setHoveredMarkerId(id), []);
  const handleMarkerLeave = useCallback(() => setHoveredMarkerId(null), []);

  const handleMarkerClick = (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedListingId(id);
    onMarkerClick?.(id);
    
    // Pan to center the selected marker slightly lower so the modal fits
    const target = listings.find(l => String(l.id) === String(id));
    if (target && mapRef.current) {
      mapRef.current.flyTo({
        center: [target.longitude, target.latitude - 0.005], // Offset down slightly
        duration: 500,
      });
    }
  };

  // Use ResizeObserver on the parent container so that the map auto-resizes
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!mapboxToken) {
    return (
      <div className="w-full h-full bg-surface-variant flex flex-col items-center justify-center text-outline p-8 text-center rounded-2xl">
        <span className="material-symbols-outlined text-5xl mb-4">map</span>
        <h3 className="font-headline font-bold text-lg mb-2">Bản đồ chưa được cấu hình</h3>
        <p className="text-sm">Vui lòng cung cấp <code>VITE_MAPBOX_ACCESS_TOKEN</code> trong tệp <code>.env</code>.</p>
        <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noreferrer" className="mt-4 text-primary font-bold hover:underline">
          Lấy Access Token miễn phí tại đây (Không cần tạo thẻ)
        </a>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative z-0" ref={containerRef}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapStyle={theme === 'dark' ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11"}
        mapboxAccessToken={mapboxToken}
        style={{width: '100%', height: '100%'}}
      >
        <NavigationControl position="bottom-right" />
        
        {listings.map(listing => {
          const isActive = String(activeListingId) === String(listing.id);
          const isSelected = String(selectedListingId) === String(listing.id);
          const priceLabel = listing.priceRent >= 1000000 
            ? `${(listing.priceRent / 1000000).toFixed(1).replace('.0', '')}Tr`
            : `${(listing.priceRent / 1000).toFixed(0)}K`;
          // Use coverImageUrl from SummaryResponse, fallback to old way just in case
          const coverImage = listing.coverImageUrl || listing.images?.find((img: any) => img.isCover)?.url || listing.images?.[0]?.url;

          return (
            <Marker 
              key={listing.id}
              longitude={listing.longitude}
              latitude={listing.latitude}
              anchor="bottom"
              onClick={e => handleMarkerClick(listing.id, e.originalEvent as unknown as React.MouseEvent)}
              style={{ zIndex: isActive || isSelected ? 100 : 1 }}
            >
              <div 
                className={clsx(
                  "relative cursor-pointer group flex flex-col items-center origin-bottom transition-transform duration-300",
                  (isActive || isSelected) ? "scale-110" : "hover:scale-110"
                )}
                onMouseEnter={() => handleMarkerEnter(listing.id)}
                onMouseLeave={handleMarkerLeave}
              >
                {/* Hover Preview Tooltip — shows only on hover when NOT selected */}
                {isActive && !isSelected && (
                  <div className="absolute bottom-full mb-2 w-48 bg-surface-container-lowest rounded-lg overflow-hidden shadow-xl z-50 pointer-events-none transition-opacity duration-200">
                    {coverImage && (
                      <img src={coverImage} alt={listing.title} className="w-full h-24 object-cover" />
                    )}
                    <div className="p-2">
                      <p className="font-bold text-xs truncate">{listing.title}</p>
                      <p className="text-primary font-extrabold text-sm">{priceLabel}/tháng</p>
                    </div>
                  </div>
                )}
                
                {/* Price Tag */}
                <div className={clsx(
                  "px-3 py-1 rounded-full font-bold text-sm shadow-md transition-colors duration-200 border border-outline-variant/20",
                  (isActive || isSelected)
                    ? "bg-primary text-on-primary border-primary" 
                    : "bg-surface-container-lowest text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary"
                )}>
                  {priceLabel}
                </div>
                {/* Triangle Pointer */}
                <div className={clsx(
                  "w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]",
                  (isActive || isSelected) ? "border-t-primary" : "border-t-surface-container-lowest group-hover:border-t-primary"
                )}></div>
              </div>
            </Marker>
          );
        })}
      </Map>

      {/* Screen-centered Modal Overlay instead of Mapbox Popup */}
      {selectedListing && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-surface/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setSelectedListingId(null)}
          ></div>
          <div className="relative bg-surface-container-lowest w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col transform animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedListingId(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-surface/50 hover:bg-surface text-on-surface backdrop-blur-md rounded-full shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Image Header */}
            <div className="relative h-56 sm:h-64 w-full bg-surface-container shrink-0">
              {(selectedListing.coverImageUrl || selectedListing.images?.[0]?.url) ? (
                <img 
                  src={selectedListing.coverImageUrl || selectedListing.images?.[0]?.url} 
                  alt={selectedListing.title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-outline-variant">home</span>
                </div>
              )}
              <div className="absolute bottom-3 left-4 bg-surface/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold shadow-md text-on-surface">
                {selectedListing.roomType}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 flex flex-col gap-3">
              <h3 className="font-bold text-lg leading-tight line-clamp-2 text-on-surface" title={selectedListing.title}>
                {selectedListing.title}
              </h3>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-primary font-black text-2xl">
                  {selectedListing.priceRent >= 1000000 
                    ? `${(selectedListing.priceRent / 1000000).toFixed(1).replace('.0', '')} Triệu`
                    : `${(selectedListing.priceRent / 1000).toFixed(0)}K`}
                  <span className="text-sm font-bold text-on-surface-variant ml-1 font-body">/tháng</span>
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-on-surface-variant font-bold mt-2">
                <span className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[18px] text-primary">straighten</span>
                  {selectedListing.areaM2} m²
                </span>
                <span className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
                  {selectedListing.city || 'TP. HCM'}
                </span>
              </div>

              {/* Call to Action */}
              <button
                onClick={() => navigate(`/listings/${selectedListing.id}`)}
                className="mt-4 w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold text-base shadow-md hover:bg-primary/90 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Xem chi tiết phòng
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
