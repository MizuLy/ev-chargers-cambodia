import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import StationPanel from "./StationPanel";
import StationPopup from "./StationPopup";
import { distanceKm, markerColor } from "../utils/stations";

const REFRESH_NEARBY_KM = 0.2;
// south-west and north-east corners: Cambodia plus a margin, so the map can't be dragged off to the rest of the world
const CAMBODIA_BOUNDS = [
  [9.5, 101.8],
  [15.2, 108.3],
];
const NEARBY_COUNT = 10;

const youIcon = L.divIcon({
  className: "you-pin",
  html: '<span class="you-pulse"></span><span class="you-dot"></span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// teardrop pin with a lightning bolt, colored by plug type; icons are cached per color and size
const pinIcons = new Map();
const pinIcon = (color, big) => {
  const key = `${color}-${big}`;
  if (!pinIcons.has(key)) {
    const [w, h] = big ? [40, 50] : [32, 40];
    pinIcons.set(
      key,
      L.divIcon({
        className: "ev-pin",
        html: `<svg width="${w}" height="${h}" viewBox="0 0 32 40" aria-hidden="true">
          <path d="M16 1.5C7.8 1.5 1.5 7.9 1.5 15.8 1.5 26 16 38.5 16 38.5S30.5 26 30.5 15.8C30.5 7.9 24.2 1.5 16 1.5Z" fill="${color}" stroke="#17231F" stroke-opacity="0.35" stroke-width="1.5"/>
          <path d="M17.6 7 9.6 18.4h5.2L13.6 25.5l8.8-11.6h-5.3Z" fill="#F6F7F3"/>
        </svg>`,
        iconSize: [w, h],
        iconAnchor: [w / 2, h],
        popupAnchor: [0, -h + 6],
      }),
    );
  }
  return pinIcons.get(key);
};

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 15, { duration: 0.8 });
  }, [map, target]);
  return null;
}

// keeps the live position on screen: pans only when the marker leaves the visible map
function KeepInView({ pos }) {
  const map = useMap();
  useEffect(() => {
    if (pos && !map.getBounds().pad(-0.15).contains(pos)) map.panTo(pos);
  }, [map, pos]);
  return null;
}

// memoized so typing in the search box or moving the live dot doesn't re-render every pin
const StationMarker = memo(function StationMarker({ station: s, selected, onPick, setRef }) {
  const position = useMemo(() => [s.latitude, s.longitude], [s.latitude, s.longitude]);
  const handlers = useMemo(() => ({ click: () => onPick(s) }), [onPick, s]);
  return (
    <Marker
      ref={(el) => setRef(s.id, el)}
      position={position}
      icon={pinIcon(markerColor(s.connectors), selected)}
      zIndexOffset={selected ? 500 : 0}
      keyboard={false}
      eventHandlers={handlers}
    >
      <Popup minWidth={260} maxWidth={260}>
        <StationPopup station={s} />
      </Popup>
    </Marker>
  );
});

export default function EvMap({ stations: all, loadError }) {
  const [plug, setPlug] = useState("");
  const [only24h, setOnly24h] = useState(false);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null); // anchor used for the nearby list
  const [live, setLive] = useState(null); // latest GPS fix { pos, accuracy }
  const [locating, setLocating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [error, setError] = useState("");
  const markers = useRef({});
  const watchId = useRef(null);
  const anchor = useRef(null);

  // filtering and "closest to me" happen in the browser, so filter clicks are instant
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = all.filter(
      (s) =>
        (!plug || s.connectors.includes(plug)) &&
        (!only24h || s.open24h) &&
        (!q || s.name.toLowerCase().includes(q)),
    );
    if (!user) return list;
    return list
      .map((s) => ({ ...s, distanceKm: distanceKm(user, [s.latitude, s.longitude]) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, NEARBY_COUNT);
  }, [all, plug, only24h, query, user]);

  const setMarkerRef = useCallback((id, el) => {
    markers.current[id] = el;
  }, []);

  const stopTracking = () => {
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    anchor.current = null;
    setUser(null);
    setLive(null);
    setLocating(false);
  };

  useEffect(
    () => () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    },
    [],
  );

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("This browser can't share your location.");
      return;
    }
    if (watchId.current != null) return;
    setLocating(true);
    watchId.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const pos = [coords.latitude, coords.longitude];
        setLocating(false);
        setLive({ pos, accuracy: coords.accuracy });
        if (!anchor.current) {
          anchor.current = pos;
          setSelected(null);
          setUser(pos);
          setFlyTarget(pos);
        } else if (distanceKm(anchor.current, pos) > REFRESH_NEARBY_KM) {
          anchor.current = pos;
          setUser(pos);
        }
      },
      (err) => {
        if (err.code !== 1 && anchor.current) return; // brief signal loss: keep tracking
        stopTracking();
        setError(
          err.code === 1
            ? "Location access is blocked. Allow it in your browser's site settings, then try again."
            : "Could not get your location. Turn on GPS or Wi-Fi and try again.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  };

  const select = (s) => {
    setSelected(s);
    setFlyTarget([s.latitude, s.longitude]);
    setTimeout(() => markers.current[s.id]?.openPopup(), 850);
  };

  return (
    <div className="flex flex-col-reverse overflow-hidden rounded-2xl border border-line bg-paper font-instrumentsans shadow-sm md:h-[620px] md:flex-row">
      <StationPanel
        stations={visible}
        plug={plug}
        setPlug={setPlug}
        only24h={only24h}
        setOnly24h={setOnly24h}
        query={query}
        setQuery={setQuery}
        nearMe={!!user}
        onNearMe={startTracking}
        onClearNearMe={stopTracking}
        locating={locating}
        selectedId={selected?.id}
        onSelect={select}
        error={error || loadError}
      />

      <MapContainer
        center={[11.5564, 104.9282]}
        zoom={12}
        className="h-[360px] shrink-0 md:h-full md:flex-1"
        zoomControl={false}
        minZoom={7}
        maxBounds={CAMBODIA_BOUNDS}
        maxBoundsViscosity={1}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          keepBuffer={4}
          noWrap
          bounds={CAMBODIA_BOUNDS}
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <FlyTo target={flyTarget} />
        <KeepInView pos={live?.pos} />

        {live && (
          <>
            <Circle
              center={live.pos}
              radius={Math.min(live.accuracy, 1500)}
              pathOptions={{ color: "#2563EB", weight: 1, fillColor: "#2563EB", fillOpacity: 0.1 }}
            />
            <Marker position={live.pos} icon={youIcon} zIndexOffset={1000} keyboard={false}>
              <Popup>You are here</Popup>
            </Marker>
          </>
        )}

        {visible.map((s) => (
          <StationMarker
            key={s.id}
            station={s}
            selected={selected?.id === s.id}
            onPick={setSelected}
            setRef={setMarkerRef}
          />
        ))}
      </MapContainer>
    </div>
  );
}
