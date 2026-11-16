import { useEffect, useState } from "react";

// Reverse geocoding with OpenStreetMap's free Nominatim service.
// Only coordinates rounded to 0.01 degrees (about 1 km) are sent, not the exact position. The
// name only changes when you move that far, and results are cached, so requests stay far below
// Nominatim's limit of 1 per second.
const cache = new Map();

const parse = (data) => {
  const a = data?.address;
  if (!a) return null;
  // the province (Phnom Penh counts as one) is what people know; districts are skipped because the
  // rounded lookup position can land in the neighboring district
  const area = a.state || a.city || a.town || a.county || a.village || "";
  const country = a.country || "";
  return {
    label: [area, country].filter(Boolean).join(", "), // "Phnom Penh, Cambodia"
    inCambodia: a.country_code === "kh",
  };
};

const lookup = (lat, lng) => {
  const key = `${lat},${lng}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=12&addressdetails=1&accept-language=en&lat=${lat}&lon=${lng}`,
      )
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("lookup failed"))))
        .then(parse)
        .catch(() => {
          cache.delete(key); // let a later position try again
          return null;
        }),
    );
  }
  return cache.get(key);
};

// returns { label: "Phnom Penh, Cambodia", inCambodia } or null
export default function usePlaceName(pos) {
  const [place, setPlace] = useState(null);
  const lat = pos ? Math.round(pos[0] * 100) / 100 : null;
  const lng = pos ? Math.round(pos[1] * 100) / 100 : null;

  useEffect(() => {
    if (lat == null) return;
    let active = true;
    lookup(lat, lng).then((p) => {
      if (active && p) setPlace(p);
    });
    return () => {
      active = false;
    };
  }, [lat, lng]);

  return place;
}
