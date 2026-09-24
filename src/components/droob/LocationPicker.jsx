import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Locate, MapPin, Loader2 } from "lucide-react";

const DEFAULT_CENTER = [30.0444, 31.2357]; // القاهرة

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const [locating, setLocating] = useState(false);
  const position = value?.lat != null && value?.lng != null ? [value.lat, value.lng] : null;

  const pick = (latlng) => {
    onChange({ ...value, lat: latlng.lat, lng: latlng.lng });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ ...value, lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <Labelless>موقعك على الخريطة</Labelless>
        <button
          type="button"
          onClick={useMyLocation}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition"
        >
          {locating ? <Loader2 size={14} className="animate-spin" /> : <Locate size={14} />}
          موقعي الحالي
        </button>
      </div>

      <div
        className="rounded-xl overflow-hidden border border-border h-56 bg-secondary"
        style={{ direction: "ltr" }}
      >
        <MapContainer
          center={position || DEFAULT_CENTER}
          zoom={11}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <ClickHandler onPick={pick} />
          {position && (
            <CircleMarker
              center={position}
              radius={11}
              pathOptions={{ color: "#0d9488", fillColor: "#0d9488", fillOpacity: 0.8 }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                موقعك
              </Tooltip>
            </CircleMarker>
          )}
        </MapContainer>
      </div>

      <div className="relative">
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <input
          type="text"
          value={value?.address || ""}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder="المنطقة / العنوان (مثال: مدينة نصر، القاهرة)"
          className="w-full pr-10 px-4 py-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary/50"
        />
      </div>
    </div>
  );
}

function Labelless({ children }) {
  return <span className="text-sm font-medium text-foreground">{children}</span>;
}