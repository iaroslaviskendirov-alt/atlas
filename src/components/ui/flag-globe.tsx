"use client";

import * as React from "react";
import createGlobe from "cobe";

// Глобус с флагами на cobe. Доработки к исходному компоненту:
// - флаги на видимой стороне — кнопки: onFlagClick(code);
// - focusCode + focusKey плавно доворачивают глобус к стране (поиск);
// - activeCode подсвечивает выбранный флаг;
// - компоненты флагов передаются пропсом `flags` (только нужные страны), а не весь набор из 250 —
//   так сайт весит намного меньше.

type RGB = [number, number, number];
export type FlagSvg = React.ComponentType<{ className?: string; width?: string | number; height?: string | number; title?: string }>;

export interface FlagGlobeMarker {
  /** ISO 3166-1 alpha-2 country code, e.g. "KR". */
  code: string;
  /** Override the built-in coordinates as [latitude, longitude]. */
  location?: [number, number];
  /** Accessible name. Defaults to the English country name. */
  label?: string;
}

export interface FlagGlobeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  markers: FlagGlobeMarker[];
  /** Flag components by ISO code. Codes without a component show the code as text. */
  flags?: Record<string, FlagSvg | undefined>;
  size?: number;
  flagSize?: number;
  autoRotate?: boolean;
  rotationSpeed?: number;
  phi?: number;
  altitude?: number;
  theta?: number;
  markerDots?: boolean;
  stars?: boolean;
  baseColor?: string;
  glowColor?: string;
  dark?: boolean;
  /** Click on a visible flag. */
  onFlagClick?: (code: string) => void;
  /** Highlighted flag. */
  activeCode?: string | null;
  /** Country to turn toward; change focusKey to repeat the turn for the same code. */
  focusCode?: string | null;
  focusKey?: number;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * [latitude, longitude] for every ISO 3166-1 country or territory (plus XK)
 * that has a flag in `country-flag-icons`. Capital cities where the pin reads
 * better than the geographic center, otherwise Google's public country
 * centroids (https://developers.google.com/public-data/docs/canonical/countries_csv),
 * and Wikidata (CC0) for codes missing there.
 */
export const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  AD: [42.5063, 1.5218], AE: [24.4539, 54.3773], AF: [33.9391, 67.71], AG: [17.1274, -61.8468], AI: [18.2206, -63.0686],
  AL: [41.3275, 19.8187], AM: [40.1792, 44.4991], AO: [-8.839, 13.2894], AQ: [-75.251, -0.0714], AR: [-34.6037, -58.3816],
  AS: [-14.271, -170.1322], AT: [48.2082, 16.3738], AU: [-35.2809, 149.13], AW: [12.5211, -69.9683], AX: [60.0986, 19.9444],
  AZ: [40.4093, 49.8671], BA: [43.8563, 18.4131], BB: [13.1132, -59.5988], BD: [23.8103, 90.4125], BE: [50.8503, 4.3517],
  BF: [12.3714, -1.5197], BG: [42.6977, 23.3219], BH: [26.2285, 50.586], BI: [-3.3761, 29.3599], BJ: [6.4969, 2.6283],
  BL: [17.8986, -62.8492], BM: [32.3214, -64.7574], BN: [4.9031, 114.9398], BO: [-16.4897, -68.1193], BQ: [12.1833, -68.2333],
  BR: [-15.7975, -47.8919], BS: [25.048, -77.3554], BT: [27.4728, 89.639], BV: [-54.4232, 3.4132], BW: [-24.6282, 25.9231],
  BY: [53.7098, 27.9534], BZ: [17.251, -88.759], CA: [45.4215, -75.6972], CC: [-12.1642, 96.871], CD: [-4.0383, 21.7587],
  CF: [6.6111, 20.9394], CG: [-4.2634, 15.2429], CH: [46.948, 7.4474], CI: [6.8276, -5.2893], CK: [-21.2367, -159.7777],
  CL: [-33.4489, -70.6693], CM: [3.848, 11.5021], CN: [35.8617, 104.1954], CO: [4.711, -74.0721], CR: [9.9281, -84.0907],
  CU: [21.5218, -77.7812], CV: [14.9315, -23.5087], CW: [12.108, -68.935], CX: [-10.4475, 105.6904], CY: [35.1856, 33.3823],
  CZ: [50.0755, 14.4378], DE: [52.52, 13.405], DJ: [11.5721, 43.1456], DK: [55.6761, 12.5683], DM: [15.3017, -61.3881],
  DO: [18.4861, -69.9312], DZ: [36.7538, 3.0588], EC: [-0.1807, -78.4678], EE: [59.437, 24.7536], EG: [30.0444, 31.2357],
  EH: [24.2155, -12.8858], ER: [15.1794, 39.7823], ES: [40.4168, -3.7038], ET: [9.145, 40.4897], FI: [60.1699, 24.9384],
  FJ: [-18.1416, 178.4419], FK: [-51.7963, -59.5236], FM: [6.9248, 158.161], FO: [61.8926, -6.9118], FR: [48.8566, 2.3522],
  GA: [0.4162, 9.4673], GB: [51.5074, -0.1278], GD: [12.0561, -61.7486], GE: [41.7151, 44.8271], GF: [3.9339, -53.1258],
  GG: [49.4657, -2.5853], GH: [5.6037, -0.187], GI: [36.1377, -5.3454], GL: [71.7069, -42.6043], GM: [13.4549, -16.579],
  GN: [9.6412, -13.5784], GP: [16.996, -62.0676], GQ: [3.7523, 8.7742], GR: [37.9838, 23.7275], GS: [-54.4296, -36.5879],
  GT: [14.6349, -90.5069], GU: [13.4443, 144.7937], GW: [11.8637, -15.598], GY: [6.8013, -58.1551], HK: [22.3193, 114.1694],
  HM: [-53.0818, 73.5042], HN: [14.065, -87.1715], HR: [45.815, 15.9819], HT: [18.5944, -72.3074], HU: [47.4979, 19.0402],
  ID: [-6.2088, 106.8456], IE: [53.3498, -6.2603], IL: [31.7683, 35.2137], IM: [54.2361, -4.5481], IN: [28.6139, 77.209],
  IO: [-6.3432, 71.8765], IQ: [33.3152, 44.3661], IR: [32.4279, 53.688], IS: [64.1466, -21.9426], IT: [41.9028, 12.4964],
  JE: [49.2144, -2.1313], JM: [18.0179, -76.8099], JO: [31.9454, 35.9284], JP: [35.6762, 139.6503], KE: [-1.2921, 36.8219],
  KG: [42.8746, 74.5698], KH: [11.5564, 104.9282], KI: [1.3382, 172.9784], KM: [-11.7172, 43.2473], KN: [17.3026, -62.7177],
  KP: [40.3399, 127.5101], KR: [37.5665, 126.978], KW: [29.3759, 47.9774], KY: [19.5135, -80.567], KZ: [51.1694, 71.4491],
  LA: [17.9757, 102.6331], LB: [33.8938, 35.5018], LC: [14.0101, -60.987], LI: [47.141, 9.5209], LK: [6.9271, 79.8612],
  LR: [6.2907, -10.7605], LS: [-29.3142, 27.4833], LT: [54.6872, 25.2797], LU: [49.6116, 6.1319], LV: [56.9496, 24.1052],
  LY: [26.3351, 17.2283], MA: [33.9716, -6.8498], MC: [43.7384, 7.4246], MD: [47.0105, 28.8638], ME: [42.4304, 19.2594],
  MF: [18.0667, -63.0847], MG: [-18.8792, 47.5079], MH: [7.1164, 171.1858], MK: [41.9973, 21.428], ML: [17.5707, -3.9962],
  MM: [21.914, 95.9562], MN: [47.8864, 106.9057], MO: [22.1987, 113.5439], MP: [17.3308, 145.3847], MQ: [14.6415, -61.0242],
  MR: [18.0735, -15.9582], MS: [16.7425, -62.1874], MT: [35.8989, 14.5146], MU: [-20.1609, 57.5012], MV: [4.1755, 73.5093],
  MW: [-13.9626, 33.7741], MX: [19.4326, -99.1332], MY: [3.139, 101.6869], MZ: [-25.9692, 32.5732], NA: [-22.5609, 17.0658],
  NC: [-20.9043, 165.618], NE: [13.5116, 2.1254], NF: [-29.0408, 167.9547], NG: [9.0765, 7.3986], NI: [12.8654, -85.2072],
  NL: [52.3676, 4.9041], NO: [59.9139, 10.7522], NP: [27.7172, 85.324], NR: [-0.5228, 166.9315], NU: [-19.0544, -169.8672],
  NZ: [-41.2866, 174.7756], OM: [23.588, 58.3829], PA: [8.9824, -79.5199], PE: [-12.0464, -77.0428], PF: [-17.6797, -149.4068],
  PG: [-9.4438, 147.1803], PH: [14.5995, 120.9842], PK: [33.6844, 73.0479], PL: [52.2297, 21.0122], PM: [46.9419, -56.2711],
  PN: [-24.7036, -127.4393], PR: [18.2208, -66.5901], PS: [31.9038, 35.2034], PT: [38.7223, -9.1393], PW: [7.515, 134.5825],
  PY: [-25.2637, -57.5759], QA: [25.2854, 51.531], RE: [-21.1151, 55.5364], RO: [44.4268, 26.1025], RS: [44.7866, 20.4489],
  RU: [61.524, 105.3188], RW: [-1.9403, 29.8739], SA: [24.7136, 46.6753], SB: [-9.4295, 160.0388], SC: [-4.6191, 55.4513],
  SD: [12.8628, 30.2176], SE: [59.3293, 18.0686], SG: [1.3521, 103.8198], SH: [-24.1435, -10.0307], SI: [46.0569, 14.5058],
  SJ: [77.5536, 23.6703], SK: [48.1486, 17.1077], SL: [8.4657, -13.2317], SM: [43.9424, 12.4578], SN: [14.7167, -17.4677],
  SO: [5.1521, 46.1996], SR: [5.852, -55.2038], SS: [4.8539, 31.5825], ST: [0.3365, 6.7273], SV: [13.6929, -89.2182],
  SX: [18.0242, -63.0433], SY: [34.8021, 38.9968], SZ: [-26.3054, 31.1367], TC: [21.694, -71.7979], TD: [12.1348, 15.0557],
  TF: [-49.2804, 69.3486], TG: [6.1256, 1.2254], TH: [13.7563, 100.5018], TJ: [38.5598, 68.774], TK: [-8.9674, -171.8559],
  TL: [-8.5569, 125.5603], TM: [37.9601, 58.3261], TN: [36.8065, 10.1815], TO: [-21.2148, -175.1982], TR: [39.9334, 32.8597],
  TT: [10.6549, -61.5019], TV: [-8.5199, 179.1979], TW: [25.033, 121.5654], TZ: [-6.163, 35.7516], UA: [50.4501, 30.5234],
  UG: [0.3476, 32.5825], UM: [19.3, 166.6333], US: [37.0902, -95.7129], UY: [-34.9011, -56.1645], UZ: [41.2995, 69.2401],
  VA: [41.9029, 12.4534], VC: [13.1587, -61.2248], VE: [6.4238, -66.5897], VG: [18.4207, -64.64], VI: [18.3358, -64.8963],
  VN: [21.0285, 105.8542], VU: [-17.7333, 168.3273], WF: [-13.7688, -177.1561], WS: [-13.8506, -171.7514], XK: [42.6026, 20.903],
  YE: [15.5527, 48.5164], YT: [-12.8275, 45.1662], ZA: [-25.7479, 28.2293], ZM: [-15.3875, 28.3228], ZW: [-17.8292, 31.0522],
};

const GLOBE_RADIUS = 0.8; // cobe draws the sphere at 0.8 of the half-canvas
const DRAG_FRICTION = 0.92; // per 60 Hz frame
const KEY_STEP = 0.025; // ≈18° per press once momentum settles
const RELEASE_GRACE_MS = 80;
const TEXTURE_RETRY_MS = [150, 600, 1500];
const FOCUS_RATE = 4.5; // скорость доворота к стране

const WIDTH_CLASS = /(?:^|\s)(?:[\w-]+:)*!?(?:w|size)-/;
const HEIGHT_CLASS = /(?:^|\s)(?:[\w-]+:)*!?(?:h|size|aspect)-/;
const MAX_WIDTH_CLASS = /(?:^|\s)(?:[\w-]+:)*!?max-w-/;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toCartesian([lat, lng]: [number, number]): RGB {
  const la = (lat * Math.PI) / 180;
  const lo = (lng * Math.PI) / 180 - Math.PI;
  const c = Math.cos(la);
  return [-c * Math.cos(lo), Math.sin(la), c * Math.sin(lo)];
}

/** Углы, при которых точка [lat, lng] оказывается в центре глобуса (в той же системе, что и project). */
export function anglesFor([lat, lng]: [number, number]) {
  return { phi: (3 * Math.PI) / 2 - (lng * Math.PI) / 180, theta: (lat * Math.PI) / 180 };
}

function project([x, y, z]: RGB, phi: number, theta: number, altitude: number) {
  const cp = Math.cos(phi);
  const sp = Math.sin(phi);
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const radius = GLOBE_RADIUS * (1 + altitude);
  const sx = (cp * x + sp * z) * radius;
  const sy = (sp * st * x + ct * y - cp * st * z) * radius;
  const depth = -sp * ct * x + st * y + cp * ct * z;
  return { x: (sx + 1) / 2, y: (1 - sy) / 2, depth, rim: Math.hypot(sx, sy) - GLOBE_RADIUS };
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function flagOpacity(depth: number, rim: number) {
  if (depth >= 0) {
    const t = clamp01(depth / 0.35);
    return 0.35 + 0.65 * t * t * (3 - 2 * t);
  }
  const exposed = Math.max(clamp01(rim / 0.03), clamp01(1 + depth * 6));
  return 0.35 * exposed * clamp01(1 + depth * 2.5);
}

let colorCanvas: HTMLCanvasElement | null = null;
const UNRESOLVED = "rgb(1, 2, 3)";

function resolveColor(scope: HTMLElement, candidates: string[]): RGB | null {
  const holder = document.createElement("span");
  holder.style.cssText = `display:none;color:${UNRESOLVED}`;
  const probe = document.createElement("span");
  holder.appendChild(probe);
  scope.appendChild(holder);
  let computed: string | null = null;
  for (const candidate of candidates) {
    if (candidate.trim().toLowerCase() === "currentcolor") {
      computed = getComputedStyle(scope).color;
      break;
    }
    probe.style.color = "";
    probe.style.color = candidate;
    const value = probe.style.color ? getComputedStyle(probe).color : UNRESOLVED;
    if (value !== UNRESOLVED) {
      computed = value;
      break;
    }
  }
  holder.remove();
  if (!computed) return null;
  colorCanvas ??= document.createElement("canvas");
  colorCanvas.width = colorCanvas.height = 1;
  const ctx = colorCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = computed;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return a === 0 ? null : [r / 255, g / 255, b / 255];
}

function themeToken(name: string) {
  return [`var(--${name})`, `hsl(var(--${name}))`, `var(--color-${name})`];
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function luminance([r, g, b]: RGB) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function useThemeTick() {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const observer = new MutationObserver(bump);
    for (const el of [document.documentElement, document.body]) {
      observer.observe(el, { attributes: true, attributeFilter: ["class", "style", "data-theme", "data-mode"] });
    }
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", bump);
    return () => {
      observer.disconnect();
      scheme.removeEventListener("change", bump);
    };
  }, []);
  return tick;
}

function useDevicePixelRatio() {
  const [dpr, setDpr] = React.useState(() =>
    typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2),
  );
  React.useEffect(() => {
    let query: MediaQueryList | null = null;
    const watch = () => {
      query?.removeEventListener("change", watch);
      setDpr(Math.min(window.devicePixelRatio || 1, 2));
      query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      query.addEventListener("change", watch);
    };
    watch();
    return () => query?.removeEventListener("change", watch);
  }, []);
  return dpr;
}

let regionNames: Intl.DisplayNames | null = null;
function countryName(code: string) {
  try {
    regionNames ??= new Intl.DisplayNames(["ru"], { type: "region" });
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

interface PlacedFlag {
  code: string;
  label: string;
  vector: RGB;
  location: [number, number];
}

type MarkerTuple = [string, [number, number] | null, string | null];

function placeMarkers(markers: MarkerTuple[]): PlacedFlag[] {
  const placed = new Map<string, PlacedFlag>();
  for (const [rawCode, custom, label] of markers) {
    const code = rawCode.toUpperCase();
    const location = custom ?? COUNTRY_COORDINATES[code];
    if (!location || placed.has(code)) continue;
    placed.set(code, { code, label: label ?? countryName(code), vector: toCartesian(location), location });
  }
  return [...placed.values()];
}

function seededStars(count: number) {
  let seed = 42;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const stars = [];
  while (stars.length < count) {
    const x = 0.03 + rand() * 0.94;
    const y = 0.03 + rand() * 0.94;
    if (Math.hypot(x - 0.5, y - 0.5) < 0.43) continue;
    stars.push({
      id: stars.length,
      left: x * 100,
      top: y * 100,
      size: rand() < 0.75 ? 1 : 2,
      accent: rand() < 0.3,
      delay: rand() * 4,
      duration: 2.5 + rand() * 3,
    });
  }
  return stars;
}

const STARS = seededStars(56);

type GlState = "pending" | "ready" | "unavailable";

export function FlagGlobe({
  markers,
  flags: flagComponents = {},
  size,
  flagSize,
  autoRotate = true,
  rotationSpeed = 0.12,
  phi = 0,
  theta = 0.3,
  altitude = 0.125,
  markerDots = false,
  stars = true,
  baseColor,
  glowColor,
  dark,
  onFlagClick,
  activeCode = null,
  focusCode = null,
  focusKey = 0,
  ref,
  className,
  style,
  onKeyDown,
  ...rest
}: FlagGlobeProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const canvasHostRef = React.useRef<HTMLDivElement>(null);
  const flagRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const globeRef = React.useRef<ReturnType<typeof createGlobe> | null>(null);
  const kickRef = React.useRef<() => void>(() => {});
  const [measured, setMeasured] = React.useState(size ?? 0);
  const [glState, setGlState] = React.useState<GlState>("pending");
  const [glVersion, setGlVersion] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);
  const [autoDark, setAutoDark] = React.useState(true);
  const themeTick = useThemeTick();
  const dpr = useDevicePixelRatio();
  const isDark = dark ?? autoDark;
  const markerKey = JSON.stringify(
    markers.map((m): MarkerTuple => [m.code, m.location ?? null, m.label ?? null]),
  );
  const flags = React.useMemo(() => placeMarkers(JSON.parse(markerKey) as MarkerTuple[]), [markerKey]);
  const px = measured;
  const flagWidth = flagSize ?? Math.max(16, Math.round(px * 0.05));
  const ready = glState !== "pending";

  const setRootRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      rootRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = el;
    },
    [ref],
  );

  const live = React.useRef({
    phi,
    theta,
    altitude,
    dark: isDark,
    speed: rotationSpeed,
    auto: autoRotate,
    reducedMotion: false,
    onScreen: true,
    dragging: false,
    pointerId: -1,
    lastX: 0,
    lastMoveAt: 0,
    velocity: 0,
    size: px,
    flags,
    targetPhi: null as number | null,
    targetTheta: null as number | null,
  });

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const s = live.current;
    s.altitude = altitude;
    s.dark = isDark;
    s.speed = rotationSpeed;
    s.auto = autoRotate;
    s.size = px;
    s.flags = flags;
    kickRef.current();
  }, [altitude, isDark, rotationSpeed, autoRotate, px, flags]);

  React.useEffect(() => {
    live.current.theta = theta;
    kickRef.current();
  }, [theta]);

  React.useEffect(() => {
    live.current.phi = phi;
    kickRef.current();
  }, [phi]);

  // Доворот к стране: ближайший путь по долготе, наклон по широте (с ограничением, чтобы
  // полюса не «заваливали» глобус).
  React.useEffect(() => {
    if (!focusCode) return;
    const location = COUNTRY_COORDINATES[focusCode.toUpperCase()];
    if (!location) return;
    const s = live.current;
    const target = anglesFor(location);
    const twoPi = Math.PI * 2;
    const delta = ((((target.phi - s.phi) % twoPi) + twoPi * 1.5) % twoPi) - Math.PI;
    s.targetPhi = s.phi + delta;
    s.targetTheta = Math.max(-0.75, Math.min(0.85, target.theta));
    s.velocity = 0;
    kickRef.current();
  }, [focusCode, focusKey]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => setMeasured(Math.floor(Math.min(root.clientWidth, root.clientHeight)));
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    measure();
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const s = live.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      s.reducedMotion = motion.matches;
      kickRef.current();
    };
    const onVisibility = () => kickRef.current();
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      s.onScreen = entry?.isIntersecting ?? true;
      kickRef.current();
    });
    onMotion();
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    observer.observe(root);
    return () => {
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
    };
  }, []);

  const hasSize = px > 0;

  React.useEffect(() => {
    const host = canvasHostRef.current;
    if (!host || !hasSize) return;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "width:100%;height:100%;display:block";
    host.appendChild(canvas);

    const s = live.current;
    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: s.size,
      height: s.size,
      phi: s.phi,
      theta: s.theta,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [1, 1, 1],
      glowColor: [0.5, 0.5, 0.5],
      markers: [],
      markerElevation: 0,
    });
    const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
    globeRef.current = globe;

    let raf = 0;
    let last = 0;
    let renderedSize = s.size;
    const written = new WeakMap<HTMLElement, { opacity: number; zIndex: string; filter: string; clickable: boolean }>();

    const positionFlags = () => {
      const { flags: placed, size: diameter, phi: p, theta: t, dark: onDark } = s;
      for (let i = 0; i < placed.length; i++) {
        const el = flagRefs.current[i];
        const flag = placed[i];
        if (!el || !flag) continue;
        const point = project(flag.vector, p, t, s.altitude);
        const opacity = Math.round(flagOpacity(point.depth, point.rim) * 100) / 100;
        const behind = point.depth < 0;
        const zIndex = behind ? "1" : "2";
        const filter = behind && !onDark ? "brightness(0.82) saturate(0.6)" : "";
        // Нажимать можно только флаги, хорошо видные на лицевой стороне
        const clickable = point.depth > 0.12 && opacity > 0.6;
        const prev = written.get(el) ?? { opacity: -1, zIndex: "", filter: "none", clickable: !clickable };
        if (opacity !== prev.opacity) el.style.opacity = String(opacity);
        if (zIndex !== prev.zIndex) el.style.zIndex = zIndex;
        if (filter !== prev.filter) el.style.filter = filter;
        if (clickable !== prev.clickable) el.style.pointerEvents = clickable ? "auto" : "none";
        written.set(el, { opacity, zIndex, filter, clickable });
        if (opacity === 0) continue;
        el.style.transform = `translate3d(${point.x * diameter}px, ${point.y * diameter}px, 0) translate(-50%, -50%)`;
      }
    };

    const focusing = () => s.targetPhi !== null || s.targetTheta !== null;
    const isMoving = () =>
      s.dragging || focusing() || Math.abs(s.velocity) > 1e-4 || (s.auto && s.speed !== 0 && !s.reducedMotion);

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      if (!s.dragging) {
        if (focusing()) {
          // при «уменьшении движения» — сразу на место, без анимации
          const k = s.reducedMotion ? 1 : 1 - Math.exp(-dt * FOCUS_RATE);
          if (s.targetPhi !== null) {
            s.phi += (s.targetPhi - s.phi) * k;
            if (Math.abs(s.targetPhi - s.phi) < 0.002) { s.phi = s.targetPhi; s.targetPhi = null; }
          }
          if (s.targetTheta !== null) {
            s.theta += (s.targetTheta - s.theta) * k;
            if (Math.abs(s.targetTheta - s.theta) < 0.002) { s.theta = s.targetTheta; s.targetTheta = null; }
          }
        } else if (Math.abs(s.velocity) > 1e-4) {
          const steps = dt * 60;
          s.phi += s.velocity * steps;
          s.velocity *= Math.pow(DRAG_FRICTION, steps);
        } else if (s.auto && !s.reducedMotion) {
          s.phi += s.speed * dt;
        }
      }
      if (s.size !== renderedSize) {
        renderedSize = s.size;
        globe.update({ phi: s.phi, theta: s.theta, width: s.size, height: s.size });
      } else {
        globe.update({ phi: s.phi, theta: s.theta });
      }
      positionFlags();
      if (isMoving() && s.onScreen && !document.hidden) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    kickRef.current = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    kickRef.current();

    const retries = TEXTURE_RETRY_MS.map((ms) => window.setTimeout(() => kickRef.current(), ms));

    const onLost = (event: Event) => {
      event.preventDefault();
      setGlState("unavailable");
    };
    const onRestored = () => setGlVersion((v) => v + 1);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    setGlState(gl ? "ready" : "unavailable");

    return () => {
      cancelAnimationFrame(raf);
      retries.forEach((id) => window.clearTimeout(id));
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      kickRef.current = () => {};
      globe.destroy();
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      globeRef.current = null;
      host.replaceChildren();
      setGlState("pending");
    };
  }, [hasSize, dpr, glVersion]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const resolvedBackground = resolveColor(root, themeToken("background"));
    const detectedDark = resolvedBackground
      ? luminance(resolvedBackground) < 0.5
      : document.documentElement.classList.contains("dark");
    setAutoDark(detectedDark);
    const globe = globeRef.current;
    if (!globe) return;
    const onDark = dark ?? detectedDark;
    const background = resolvedBackground ?? (onDark ? [0.04, 0.04, 0.04] : [1, 1, 1]);
    const foreground =
      resolveColor(root, themeToken("foreground")) ?? (onDark ? [0.98, 0.98, 0.98] : [0.04, 0.04, 0.04]);
    const primary = resolveColor(root, themeToken("primary")) ?? foreground;
    const base =
      (baseColor && resolveColor(root, [baseColor])) || mix(background, foreground, onDark ? 0.3 : 0.05);
    const glow =
      (glowColor && resolveColor(root, [glowColor])) || mix(background, foreground, onDark ? 0.45 : 0.14);
    globe.update({
      dark: onDark ? 1 : 0,
      diffuse: onDark ? 1.2 : 0.4,
      mapBrightness: onDark ? 6 : 1.2,
      baseColor: base,
      glowColor: glow,
      markerColor: primary,
      markers: markerDots ? flags.map((f) => ({ location: f.location, size: 0.025 })) : [],
    });
    kickRef.current();
  }, [ready, glVersion, themeTick, dark, baseColor, glowColor, markerDots, flags]);

  const rotateBy = (delta: number) => {
    const s = live.current;
    s.targetPhi = s.targetTheta = null;
    if (s.reducedMotion) s.phi += delta / (1 - DRAG_FRICTION);
    else s.velocity = delta;
    kickRef.current();
  };

  const endDrag = () => {
    const s = live.current;
    s.dragging = false;
    s.pointerId = -1;
    kickRef.current();
  };

  const count = flags.length;
  const description = `Глобус с флагами: ${count} стран. Перетащите или используйте стрелки, чтобы вращать.`;
  const consumerClasses = className ?? "";

  return (
    <div
      ref={setRootRef}
      role="region"
      aria-roledescription="глобус"
      aria-label={description}
      tabIndex={0}
      className={cx(
        "relative isolate select-none rounded-full",
        "focus-visible:[outline:2px_solid_transparent] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        size === undefined && !WIDTH_CLASS.test(consumerClasses) && "w-full",
        size === undefined && !HEIGHT_CLASS.test(consumerClasses) && "aspect-square",
        !MAX_WIDTH_CLASS.test(consumerClasses) && "max-w-full",
        className,
      )}
      style={{ width: size, height: size, touchAction: "pan-y pinch-zoom", ...style }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.key === "ArrowLeft") rotateBy(-KEY_STEP);
        else if (e.key === "ArrowRight") rotateBy(KEY_STEP);
        else return;
        e.preventDefault();
      }}
      {...rest}
    >
      <div
        className="absolute"
        style={{ left: "50%", top: "50%", width: px, height: px, transform: "translate(-50%, -50%)" }}
      >
        {stars && (
          <div aria-hidden className={cx("pointer-events-none absolute inset-0", !isDark && "opacity-40")}>
            {STARS.map((star) => (
              <span
                key={star.id}
                className={cx(
                  "absolute rounded-full animate-pulse motion-reduce:animate-none",
                  star.accent ? "bg-primary" : "bg-foreground/50",
                )}
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  width: star.size,
                  height: star.size,
                  animationDelay: `${star.delay}s`,
                  animationDuration: `${star.duration}s`,
                }}
              />
            ))}
          </div>
        )}

        {glState === "unavailable" && (
          <div aria-hidden className="pointer-events-none absolute inset-[10%] rounded-full border border-border bg-muted/40" />
        )}

        <div
          ref={canvasHostRef}
          aria-hidden
          className={cx(
            "absolute inset-0 cursor-grab transition-opacity duration-700 active:cursor-grabbing",
            ready ? "opacity-100" : "opacity-0",
          )}
          onPointerDown={(e) => {
            if (!e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
            const s = live.current;
            s.dragging = true;
            s.targetPhi = s.targetTheta = null;
            s.pointerId = e.pointerId;
            s.lastX = e.clientX;
            s.lastMoveAt = performance.now();
            s.velocity = 0;
            e.currentTarget.setPointerCapture(e.pointerId);
            kickRef.current();
          }}
          onPointerMove={(e) => {
            const s = live.current;
            if (!s.dragging || e.pointerId !== s.pointerId) return;
            const now = performance.now();
            const delta = ((e.clientX - s.lastX) / Math.max(s.size, 1)) * Math.PI;
            const elapsed = Math.max(now - s.lastMoveAt, 1);
            s.lastX = e.clientX;
            s.lastMoveAt = now;
            s.phi += delta;
            s.velocity = (delta / elapsed) * (1000 / 60);
          }}
          onPointerUp={(e) => {
            const s = live.current;
            if (e.pointerId !== s.pointerId) return;
            if (s.reducedMotion || performance.now() - s.lastMoveAt > RELEASE_GRACE_MS) s.velocity = 0;
            if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
            endDrag();
          }}
          onPointerCancel={() => {
            live.current.velocity = 0;
            endDrag();
          }}
          onLostPointerCapture={(e) => {
            if (e.pointerId === live.current.pointerId) endDrag();
          }}
        />

        <div
          className={cx(
            "pointer-events-none absolute inset-0 transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          {flags.map((flag, i) => {
            const Flag = flagComponents[flag.code];
            const active = flag.code === activeCode;
            return (
              <button
                type="button"
                key={flag.code}
                ref={(el) => {
                  flagRefs.current[i] = el;
                }}
                tabIndex={-1}
                aria-hidden
                title={flag.label}
                onClick={() => onFlagClick?.(flag.code)}
                className="group absolute cursor-pointer p-1.5 opacity-0 will-change-transform"
                style={{ left: 0, top: 0, pointerEvents: "none" }}
              >
                <div
                  className={cx(
                    "overflow-hidden rounded-[3px] bg-muted leading-none shadow-sm transition-transform duration-300 group-hover:scale-125",
                    active && "scale-150 ring-2 ring-primary ring-offset-2 ring-offset-background group-hover:scale-150",
                  )}
                  style={{ width: flagWidth, height: Math.round((flagWidth * 2) / 3) }}
                >
                  {Flag ? (
                    <Flag width="100%" height="100%" className="block" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[8px] font-medium text-muted-foreground">
                      {flag.code}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {mounted && (
        <ol className="sr-only">
          {flags.map((flag) => (
            <li key={flag.code}>{flag.label}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default FlagGlobe;
