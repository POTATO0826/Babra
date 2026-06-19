/**
 * Japanese-ink topographic contour lines: concentric rings pushed around by an
 * animated turbulence filter so they ripple like water. Pure SVG/SMIL — no JS.
 */
export function ContourBackground() {
  const rings = Array.from({ length: 16 }, (_, i) => 60 + i * 52);

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1200 900"
    >
      <defs>
        <filter id="inkflow" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0016 0.0022"
            numOctaves={3}
            seed={7}
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="26s"
              values="0.0016 0.0022; 0.0022 0.0016; 0.0016 0.0022"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={120}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <radialGradient id="inkfade" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#8fa6e6" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#5566a6" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#5566a6" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g
        filter="url(#inkflow)"
        fill="none"
        stroke="url(#inkfade)"
        strokeWidth={1.1}
      >
        {rings.map((r) => (
          <circle key={r} cx={600} cy={380} r={r} />
        ))}
      </g>
    </svg>
  );
}
