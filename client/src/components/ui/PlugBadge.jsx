import { LuZap } from "react-icons/lu";

const SIZES = { xs: "h-3.5 w-3.5", sm: "h-5 w-5", md: "h-8 w-8" };
const ICON_PX = { xs: 9, sm: 12, md: 17 };

// a colored circle with a lightning bolt, matching the map pins; `color` comes from markerColor/plugColor
export default function PlugBadge({ color, size = "md" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${SIZES[size]}`}
      style={{ background: color }}
      aria-hidden="true"
    >
      <LuZap size={ICON_PX[size]} color="#F6F7F3" fill="#F6F7F3" strokeWidth={2} />
    </span>
  );
}
