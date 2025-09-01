import { Stars } from "lucide-react";

interface ChartWheelProps {
  data?: any;
  size?: number;
  className?: string;
}

export function ChartWheel({ data, size = 300, className = "" }: ChartWheelProps) {
  // Use provided data or fallback to sample data
  const planets = data?.planets || [
    { name: "Sun", symbol: "☉", longitude: 120, color: "text-accent" },
    { name: "Moon", symbol: "☽", longitude: 45, color: "text-primary" },
    { name: "Mercury", symbol: "☿", longitude: 135, color: "text-muted-foreground" },
    { name: "Venus", symbol: "♀", longitude: 90, color: "text-accent" },
    { name: "Mars", symbol: "♂", longitude: 200, color: "text-destructive" },
    { name: "Jupiter", symbol: "♃", longitude: 300, color: "text-primary" },
    { name: "Saturn", symbol: "♄", longitude: 15, color: "text-muted-foreground" },
  ];

  const houses = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    degrees: i * 30,
  }));

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Outer Circle */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 10}
          fill="url(#cosmic-gradient)"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          opacity="0.1"
        />
        
        {/* House Divisions */}
        {houses.map((house) => {
          const angle = (house.degrees * Math.PI) / 180;
          const innerRadius = size / 2 - 60;
          const outerRadius = size / 2 - 10;
          const x1 = size / 2 + Math.cos(angle) * innerRadius;
          const y1 = size / 2 + Math.sin(angle) * innerRadius;
          const x2 = size / 2 + Math.cos(angle) * outerRadius;
          const y2 = size / 2 + Math.sin(angle) * outerRadius;
          
          return (
            <g key={house.number}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                opacity="0.5"
              />
              <text
                x={size / 2 + Math.cos(angle) * (outerRadius - 25)}
                y={size / 2 + Math.sin(angle) * (outerRadius - 25)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-muted-foreground"
              >
                {house.number}
              </text>
            </g>
          );
        })}

        {/* Zodiac Signs (simplified) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 35}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Planets */}
        {planets.map((planet) => {
          const angle = (planet.longitude * Math.PI) / 180;
          const radius = size / 2 - 45;
          const x = size / 2 + Math.cos(angle) * radius;
          const y = size / 2 + Math.sin(angle) * radius;
          
          return (
            <g key={planet.name}>
              <circle
                cx={x}
                cy={y}
                r="8"
                className="fill-card stroke-accent"
                strokeWidth="1"
              />
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-accent font-bold"
              >
                {planet.symbol}
              </text>
            </g>
          );
        })}

        {/* Center */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="15"
          fill="hsl(var(--accent))"
          opacity="0.2"
        />

        {/* Gradient Definition */}
        <defs>
          <radialGradient id="cosmic-gradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.05" />
          </radialGradient>
        </defs>
      </svg>

      {/* Center Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Stars className="w-6 h-6 text-accent animate-twinkle" />
      </div>
    </div>
  );
}