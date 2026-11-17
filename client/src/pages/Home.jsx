import { useState } from "react";
import EvMap from "../components/EvMap";
import InfoDialog from "../components/InfoDialog";
import Navbar from "../components/layout/Navbar";
import useLiveLocation from "../hooks/useLiveLocation";
import usePlaceName from "../hooks/usePlaceName";
import useStations from "../hooks/useStations";

// the whole app: a navbar and a full-screen map with its filter panel
export default function Home() {
  const { stations, error } = useStations();
  const location = useLiveLocation();
  const place = usePlaceName(location.pos);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper font-instrumentsans text-ink">
      <Navbar status={location.status} place={place} onRetry={location.retry} onInfo={() => setInfoOpen(true)} />
      <EvMap stations={stations} loadError={error} location={location} place={place} />
      <InfoDialog open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
