import { useState } from "react";

function PenaltyGame({ onResult }) {
  const [shoot, setShoot] = useState(false);
  const [goalkeeperPosition, setGoalKeeperPosition] = useState();
  const [playerShoot, setPlayerShoot] = useState();
  const [hoveredZone, setHoveredZone] = useState(null);

  const handlePenaltyShoot = (zone) => {
    const zones = [
      "left square",
      "center",
      "right square",
      "left down",
      "right down",
    ];
    // eslint-disable-next-line react-hooks/purity
    const keeperZone = zones[Math.floor(Math.random() * zones.length)];
    setShoot(true);
    setGoalKeeperPosition(keeperZone);
    setPlayerShoot(zone);
  };

  const zoneNames = {
    "left square": "Escuadra izquierda",
    center: "Centrado",
    "right square": "Escuadra derecha",
    "left down": "Rasa izquierda",
    "right down": "Rasa derecha",
  };

  const shootZones = [
    { zone: "left square", label: "Escuadra izq.", cx: 170, cy: 110 },
    { zone: "right square", label: "Escuadra der.", cx: 530, cy: 110 },
    { zone: "center", label: "Centro", cx: 350, cy: 200 },
    { zone: "left down", label: "Rasa izq.", cx: 170, cy: 290 },
    { zone: "right down", label: "Rasa der.", cx: 530, cy: 290 },
  ];

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      {shoot ? (
        <div style={{ textAlign: "center", color: "white" }}>
          <p>Tu disparo: {zoneNames[playerShoot]}</p>
          <p>El portero se lanzó a: {zoneNames[goalkeeperPosition]}</p>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {playerShoot === goalkeeperPosition ? "¡PARADO!" : "⚽ ¡GOOOL!"}
          </p>
          <button
            onClick={() =>
              onResult(playerShoot === goalkeeperPosition ? "parado" : "gol")
            }
          >
            Continuar
          </button>
        </div>
      ) : (
        <svg
          viewBox="0 0 700 420"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="net"
              width="15"
              height="15"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="15"
                y2="15"
                stroke="rgba(255,255,255,0.13)"
                strokeWidth="1"
              />
              <line
                x1="15"
                y1="0"
                x2="0"
                y2="15"
                stroke="rgba(255,255,255,0.13)"
                strokeWidth="1"
              />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width="700" height="420" fill="#1a472a" rx="8" />
          <rect x="100" y="50" width="500" height="300" fill="#0a0f14" />
          <rect x="100" y="50" width="500" height="300" fill="url(#net)" />

          <line
            x1="100"
            y1="48"
            x2="100"
            y2="350"
            stroke="#e0e0e0"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <line
            x1="600"
            y1="48"
            x2="600"
            y2="350"
            stroke="#e0e0e0"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <line
            x1="96"
            y1="50"
            x2="604"
            y2="50"
            stroke="#e0e0e0"
            strokeWidth="7"
            strokeLinecap="round"
          />

          <line
            x1="60"
            y1="350"
            x2="640"
            y2="350"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />

          <circle cx="350" cy="390" r="4" fill="white" />

          {shootZones.map(({ zone, label, cx, cy }) => (
            <g
              key={zone}
              onClick={() => handlePenaltyShoot(zone)}
              onMouseEnter={() => setHoveredZone(zone)}
              onMouseLeave={() => setHoveredZone(null)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={cx}
                cy={cy}
                r={hoveredZone === zone ? 32 : 28}
                fill="#00e676"
                opacity={hoveredZone === zone ? 1 : 0.65}
                filter={hoveredZone === zone ? "url(#glow)" : "none"}
                style={{ transition: "all 0.2s ease" }}
              />
              <text
                x={cx}
                y={cy + 6}
                textAnchor="middle"
                fontSize="18"
                pointerEvents="none"
              >
                ⚽
              </text>
              <text
                x={cx}
                y={cy + 48}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontFamily="sans-serif"
                opacity="0.85"
                pointerEvents="none"
              >
                {label}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}

export default PenaltyGame;
