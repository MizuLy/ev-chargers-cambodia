import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE;

// One shared request for the whole app (also survives React StrictMode's double mount in dev).
let request = null;
const load = () => {
  request ??= fetch(`${API}/api/ev-stations`)
    .then((r) => {
      if (!r.ok) throw new Error(`Could not load stations (${r.status})`);
      return r.json();
    })
    .catch((e) => {
      request = null;
      throw e;
    });
  return request;
};

export default function useStations() {
  const [state, setState] = useState({ stations: [], error: "" });

  useEffect(() => {
    let active = true;
    load()
      .then((stations) => active && setState({ stations, error: "" }))
      .catch((e) => active && setState({ stations: [], error: e.message }));
    return () => {
      active = false;
    };
  }, []);

  return state;
}
