// SolarSystem.jsx — Interactive Solar System Visualizer
// Features: CSS-animated orbits, click-to-learn info panels,
//           size-comparison bar, real-distance-scale toggle

import { useState, useRef, useEffect } from 'react';

// ─── Planet data ────────────────────────────────────────────────────────────
// orbitRadius  : visual radius used in "orrery" (compressed) mode (px from Sun centre)
// realAU       : semi-major axis in Astronomical Units (Earth = 1)
// period       : sidereal orbital period in Earth years
// diameterKm   : mean diameter in km
// color        : [primary, highlight] CSS colour strings
const PLANETS = [
  {
    name: 'Mercury',
    orbitRadius: 100,
    realAU: 0.387,
    period: 0.241,
    diameterKm: 4879,
    color: ['#b5b5b5', '#d4d4d4'],
    description:
      'The smallest planet and closest to the Sun. Mercury has no atmosphere, making its surface temperature swing from -180 \u00b0C at night to 430 \u00b0C during the day.',
    facts: [
      'Surface temp: -180 \u00b0C to 430 \u00b0C',
      'No moons',
      'Year length: 88 Earth days',
      'Diameter: 4,879 km',
    ],
    moons: 0,
    emoji: '\u263f',
  },
  {
    name: 'Venus',
    orbitRadius: 152,
    realAU: 0.723,
    period: 0.615,
    diameterKm: 12104,
    color: ['#f5deb3', '#d4a017'],
    description:
      'The hottest planet due to a runaway greenhouse effect. Often called Earth\u2019s twin for its similar size, but its thick CO\u2082 atmosphere makes it hellish.',
    facts: [
      'Surface temp: ~465 \u00b0C (hottest planet)',
      'No moons',
      'Rotates backwards (retrograde)',
      'Diameter: 12,104 km',
    ],
    moons: 0,
    emoji: '\u2640',
  },
  {
    name: 'Earth',
    orbitRadius: 210,
    realAU: 1.0,
    period: 1.0,
    diameterKm: 12742,
    color: ['#1a6fa8', '#4fc3f7'],
    description:
      'Our home planet, the only known world with liquid water oceans and confirmed life. Earth\u2019s magnetic field shields us from harmful solar radiation.',
    facts: [
      'Surface temp: -88 \u00b0C to 58 \u00b0C',
      '1 moon (Luna)',
      'Year length: 365.25 days',
      'Diameter: 12,742 km',
    ],
    moons: 1,
    emoji: '\u2641',
  },
  {
    name: 'Mars',
    orbitRadius: 272,
    realAU: 1.524,
    period: 1.881,
    diameterKm: 6779,
    color: ['#c1440e', '#e06030'],
    description:
      'The Red Planet. Mars has the tallest volcano in the solar system (Olympus Mons) and the longest canyon (Valles Marineris). Evidence suggests it once had liquid water.',
    facts: [
      'Surface temp: -125 \u00b0C to 20 \u00b0C',
      '2 moons (Phobos & Deimos)',
      'Year length: 687 Earth days',
      'Diameter: 6,779 km',
    ],
    moons: 2,
    emoji: '\u2642',
  },
  {
    name: 'Jupiter',
    orbitRadius: 360,
    realAU: 5.203,
    period: 11.86,
    diameterKm: 139820,
    color: ['#c88b3a', '#e8c77a'],
    description:
      'The gas giant king — more than twice the mass of all other planets combined. Its Great Red Spot is a storm that has raged for at least 350 years.',
    facts: [
      'Day length: ~10 hours',
      '95 known moons',
      'Year length: ~12 Earth years',
      'Diameter: 139,820 km',
    ],
    moons: 95,
    emoji: '\u2643',
  },
  {
    name: 'Saturn',
    orbitRadius: 450,
    realAU: 9.537,
    period: 29.46,
    diameterKm: 116460,
    color: ['#e4d191', '#c8a84b'],
    description:
      'The ringed planet. Saturn\u2019s spectacular rings are made of ice and rock chunks ranging from tiny grains to boulders the size of houses.',
    facts: [
      'Ring span: ~270,000 km across',
      '146 known moons',
      'Year length: ~29 Earth years',
      'Diameter: 116,460 km',
    ],
    moons: 146,
    emoji: '\u2644',
    hasRings: true,
  },
  {
    name: 'Uranus',
    orbitRadius: 535,
    realAU: 19.19,
    period: 84.01,
    diameterKm: 50724,
    color: ['#7de8e8', '#a0f0f0'],
    description:
      'An ice giant that rotates on its side \u2014 its axial tilt is 98\u00b0. It appears blue-green because methane in its atmosphere absorbs red light.',
    facts: [
      'Axial tilt: 98\u00b0 (rolls around the Sun)',
      '28 known moons',
      'Year length: ~84 Earth years',
      'Diameter: 50,724 km',
    ],
    moons: 28,
    emoji: '\u26e2',
  },
  {
    name: 'Neptune',
    orbitRadius: 615,
    realAU: 30.07,
    period: 164.8,
    diameterKm: 49244,
    color: ['#3f54ba', '#6070e8'],
    description:
      'The windiest planet \u2014 supersonic winds up to 2,100 km/h. Neptune was the first planet predicted by mathematics before it was observed.',
    facts: [
      'Wind speed: up to 2,100 km/h',
      '16 known moons',
      'Year length: ~165 Earth years',
      'Diameter: 49,244 km',
    ],
    moons: 16,
    emoji: '\u2646',
  },
];

// Largest diameter for the comparison bar (Jupiter)
const MAX_DIAM = Math.max(...PLANETS.map((p) => p.diameterKm));

// Map AU values to compressed visual orbit radii for "real scale" mode
// We keep it within a sensible canvas — logarithmic feel via sqrt mapping
const REAL_MIN_R = 80;
const REAL_MAX_R = 700;
function realScaleRadius(au) {
  const minAU = Math.sqrt(PLANETS[0].realAU);
  const maxAU = Math.sqrt(PLANETS[PLANETS.length - 1].realAU);
  const t = (Math.sqrt(au) - minAU) / (maxAU - minAU);
  return REAL_MIN_R + t * (REAL_MAX_R - REAL_MIN_R);
}

// Derive planet dot size from diameter (log-scaled, clamped)
function planetSize(diamKm) {
  const MIN_PX = 5;
  const MAX_PX = 28;
  const t = Math.log(diamKm) / Math.log(MAX_DIAM);
  return MIN_PX + t * (MAX_PX - MIN_PX);
}

export default function SolarSystem() {
  const [selected, setSelected] = useState(null);
  const [realScale, setRealScale] = useState(false);
  const [paused, setPaused] = useState(false);
  const [tab, setTab] = useState('info'); // 'info' | 'compare'
  const orbitRef = useRef(null);

  // Close panel when clicking empty space
  function handleBgClick(e) {
    if (e.target === orbitRef.current) setSelected(null);
  }

  const planet = PLANETS.find((p) => p.name === selected) ?? null;

  return (
    <div className="flex flex-col bg-[#050914] text-slate-100 select-none overflow-hidden">
      {/* ── Header bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <span className="text-2xl">&#x1F30C;</span> Solar System Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Click any planet to learn more</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Real distance toggle */}
          <button
            onClick={() => setRealScale((v) => !v)}
            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition
              ${realScale
                ? 'border-amber-400/60 bg-amber-400/10 text-amber-300'
                : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/30'}`}
          >
            <span className={`h-2 w-2 rounded-full ${realScale ? 'bg-amber-400' : 'bg-slate-500'}`} />
            {realScale ? 'Real Distance Scale' : 'Orrery Scale'}
          </button>

          {/* Pause / resume */}
          <button
            onClick={() => setPaused((v) => !v)}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/30"
          >
            {paused ? '&#9654; Resume' : '&#9646;&#9646; Pause'}
          </button>
        </div>
      </div>

      {/* ── Main canvas ─────────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-auto">
        {/* Orrery */}
        <OrreryCanvas
          planets={PLANETS}
          realScale={realScale}
          paused={paused}
          selected={selected}
          onSelect={setSelected}
          orbitRef={orbitRef}
          onBgClick={handleBgClick}
        />

        {/* Info / comparison panel */}
        {planet && (
          <InfoPanel
            planet={planet}
            tab={tab}
            setTab={setTab}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      {/* ── Quick planet strip ───────────────────────────────────────────────── */}
      <PlanetStrip
        planets={PLANETS}
        selected={selected}
        onSelect={setSelected}
      />
    </div>
  );
}

// ─── Orrery canvas ──────────────────────────────────────────────────────────
function OrreryCanvas({ planets, realScale, paused, selected, onSelect, orbitRef, onBgClick }) {
  // Centre of SVG; orbits radiate outward
  const cx = 760;
  const cy = 460;

  return (
    <div
      ref={orbitRef}
      onClick={onBgClick}
      className="relative overflow-auto"
      style={{ minHeight: 520 }}
    >
      <svg
        viewBox="0 0 1520 920"
        style={{ width: '100%', minWidth: 640, display: 'block' }}
        className="pointer-events-none"
      >
        {/* Starfield */}
        <Starfield />

        {/* Orbit rings */}
        {planets.map((p) => {
          const r = realScale ? realScaleRadius(p.realAU) : p.orbitRadius;
          return (
            <circle
              key={p.name + '-orbit'}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
          );
        })}

        {/* Sun */}
        <SunGlow cx={cx} cy={cy} />
      </svg>

      {/* Animated planet dots (DOM, not SVG, so CSS animations work) */}
      {planets.map((p) => (
        <AnimatedPlanet
          key={p.name}
          planet={p}
          cx={cx}
          cy={cy}
          realScale={realScale}
          paused={paused}
          selected={selected === p.name}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

// ─── Starfield (SVG) ────────────────────────────────────────────────────────
function Starfield() {
  // Pre-generated deterministic star positions
  const stars = [
    [50,30],[120,80],[200,20],[340,55],[480,15],[600,70],[720,25],[850,60],[970,10],
    [1100,45],[1250,30],[1380,75],[1450,20],[80,130],[250,160],[400,110],[550,145],
    [700,120],[900,155],[1050,130],[1200,165],[1400,140],[30,240],[180,220],[320,260],
    [460,200],[620,250],[780,215],[930,260],[1080,240],[1330,270],[1470,210],
    [60,380],[210,350],[370,390],[530,360],[690,400],[840,370],[990,410],[1150,355],
    [1300,395],[1460,370],[100,500],[270,480],[430,520],[590,490],[750,530],[900,500],
    [1060,480],[1220,515],[1380,490],[40,620],[190,600],[350,640],[510,610],[670,650],
    [820,620],[980,645],[1140,600],[1290,635],[1450,610],[70,740],[230,720],[390,760],
    [560,730],[710,770],[870,740],[1020,770],[1180,730],[1340,755],[1490,720],
    [110,860],[270,840],[430,880],[590,840],[750,875],[910,840],[1070,870],[1240,845],
    [1400,875],[20,900],[160,920],[300,895],[450,915],[640,900],[800,920],[950,900],
    [1100,915],[1260,895],[1430,910],
  ];
  return (
    <g>
      {stars.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 5 === 0 ? 1.2 : 0.7}
          fill={`rgba(255,255,255,${0.3 + (i % 7) * 0.08})`}
        />
      ))}
    </g>
  );
}

// ─── Sun glow (SVG) ──────────────────────────────────────────────────────────
function SunGlow({ cx, cy }) {
  return (
    <>
      <defs>
        <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#fff7a1" />
          <stop offset="40%" stopColor="#fdd835" />
          <stop offset="75%" stopColor="#f57f17" />
          <stop offset="100%" stopColor="#f57f1700" />
        </radialGradient>
      </defs>
      {/* Outer glow */}
      <circle cx={cx} cy={cy} r={55} fill="url(#sunGrad)" opacity="0.3" />
      {/* Mid glow */}
      <circle cx={cx} cy={cy} r={38} fill="url(#sunGrad)" opacity="0.5" />
      {/* Sun body */}
      <circle cx={cx} cy={cy} r={26} fill="#fdd835" />
      <circle cx={cx} cy={cy} r={22} fill="#fff176" />
    </>
  );
}

// ─── Animated planet dot (DOM element with CSS animation) ───────────────────
function AnimatedPlanet({ planet, cx, cy, realScale, paused, selected, onSelect }) {
  const orbitR = realScale ? realScaleRadius(planet.realAU) : planet.orbitRadius;
  const size = planetSize(planet.diameterKm);
  // Speed: base duration proportional to orbital period (clamped for UX)
  const baseDuration = Math.pow(planet.period, 0.55) * 14; // seconds
  const [primary, highlight] = planet.color;

  // Offset starting angle per planet so they aren't all at 3 o'clock
  const startAngles = { Mercury: 0, Venus: 40, Earth: 95, Mars: 155,
    Jupiter: 210, Saturn: 265, Uranus: 310, Neptune: 355 };
  const startDeg = startAngles[planet.name] ?? 0;

  // The orbit arm is positioned at the Sun centre; it rotates to carry the dot around
  const orbitStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    // Use CSS custom-property trick: centre of rotation is the Sun
    transformOrigin: `${cx}px ${cy}px`,
    animation: paused
      ? 'none'
      : `spin ${baseDuration}s linear infinite`,
    animationDelay: `-${(startDeg / 360) * baseDuration}s`,
  };

  const dotStyle = {
    position: 'absolute',
    // Place the dot at (cx + orbitR, cy), then shift it by -size/2 vertically
    // The orbit arm's rotation does the rest
    left: cx + orbitR - size / 2,
    top: cy - size / 2,
    width: size,
    height: size,
    borderRadius: '50%',
    background: `radial-gradient(circle at 35% 35%, ${highlight}, ${primary})`,
    boxShadow: selected
      ? `0 0 0 3px white, 0 0 16px 4px ${highlight}`
      : `0 0 8px 2px ${primary}88`,
    cursor: 'pointer',
    pointerEvents: 'all',
    transition: 'box-shadow 0.2s',
    zIndex: selected ? 10 : 1,
  };

  // Saturn rings overlay
  const ringStyle = planet.hasRings
    ? {
        position: 'absolute',
        left: cx + orbitR - size * 1.5,
        top: cy - size * 0.25,
        width: size * 3,
        height: size * 0.6,
        borderRadius: '50%',
        border: `${Math.max(2, size * 0.12)}px solid rgba(228,209,145,0.55)`,
        pointerEvents: 'none',
        transform: 'rotateX(60deg)',
      }
    : null;

  return (
    <div style={orbitStyle}>
      <div
        style={dotStyle}
        onClick={(e) => { e.stopPropagation(); onSelect(planet.name); }}
        title={planet.name}
      />
      {planet.hasRings && <div style={ringStyle} />}
    </div>
  );
}

// ─── Info / comparison panel ─────────────────────────────────────────────────
function InfoPanel({ planet, tab, setTab, onClose }) {
  const [primary] = planet.color;

  return (
    <div
      className="absolute top-4 right-4 w-80 rounded-2xl border border-white/15 bg-slate-900/90 shadow-2xl backdrop-blur-md z-20 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Coloured top stripe */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${planet.color[0]}, ${planet.color[1]})` }}
      />

      <div className="p-5">
        {/* Planet header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              {planet.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {planet.realAU.toFixed(3)} AU from the Sun
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition text-lg leading-none mt-0.5"
            aria-label="Close"
          >
            &#x2715;
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mt-4 rounded-xl bg-white/5 p-1">
          {['info', 'compare'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition capitalize
                ${tab === t ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {t === 'info' ? 'Facts' : 'Size Compare'}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div className="mt-4 space-y-3">
            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed">{planet.description}</p>

            {/* Fact chips */}
            <ul className="space-y-1.5">
              {planet.facts.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <span
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ background: planet.color[1] }}
                  />
                  {f}
                </li>
              ))}
            </ul>

            {/* Moons */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400">Moons:</span>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold text-slate-900"
                style={{ background: planet.color[1] }}
              >
                {planet.moons}
              </span>
            </div>
          </div>
        )}

        {tab === 'compare' && (
          <div className="mt-4 space-y-2.5">
            <p className="text-xs text-slate-400 mb-3">
              Diameter relative to Jupiter (139,820 km)
            </p>
            {PLANETS.map((p) => {
              const pct = (p.diameterKm / MAX_DIAM) * 100;
              const isSelected = p.name === planet.name;
              return (
                <div key={p.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isSelected ? 'font-bold text-white' : 'text-slate-400'}>
                      {p.name}
                    </span>
                    <span className="text-slate-500">
                      {p.diameterKm.toLocaleString()} km
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/8 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: isSelected
                          ? `linear-gradient(90deg, ${p.color[0]}, ${p.color[1]})`
                          : 'rgba(255,255,255,0.18)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quick planet strip (bottom bar) ─────────────────────────────────────────
function PlanetStrip({ planets, selected, onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto border-t border-white/10 bg-black/30 px-4 py-3 backdrop-blur">
      {planets.map((p) => {
        const size = 10 + (planetSize(p.diameterKm) / 28) * 14; // 10–24 px
        const isSelected = selected === p.name;
        return (
          <button
            key={p.name}
            onClick={() => onSelect(p.name)}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition flex-shrink-0
              ${isSelected
                ? 'bg-white/15 text-white ring-1 ring-white/30'
                : 'text-slate-400 hover:bg-white/8 hover:text-white'}`}
            title={p.name}
          >
            <span
              className="rounded-full"
              style={{
                width: size,
                height: size,
                background: `radial-gradient(circle at 35% 35%, ${p.color[1]}, ${p.color[0]})`,
                display: 'block',
                boxShadow: isSelected ? `0 0 8px ${p.color[1]}` : 'none',
              }}
            />
            <span className="font-medium">{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}
