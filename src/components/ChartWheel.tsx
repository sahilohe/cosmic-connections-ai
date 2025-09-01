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

  // Zodiac signs with their symbols and colors
  const zodiacSigns = [
    { name: "Aries", symbol: "♈", startDegree: 0, color: "text-red-500" },
    { name: "Taurus", symbol: "♉", startDegree: 30, color: "text-green-500" },
    { name: "Gemini", symbol: "♊", startDegree: 60, color: "text-yellow-500" },
    { name: "Cancer", symbol: "♋", startDegree: 90, color: "text-blue-500" },
    { name: "Leo", symbol: "♌", startDegree: 120, color: "text-orange-500" },
    { name: "Virgo", symbol: "♍", startDegree: 150, color: "text-purple-500" },
    { name: "Libra", symbol: "♎", startDegree: 180, color: "text-pink-500" },
    { name: "Scorpio", symbol: "♏", startDegree: 210, color: "text-red-600" },
    { name: "Sagittarius", symbol: "♐", startDegree: 240, color: "text-blue-600" },
    { name: "Capricorn", symbol: "♑", startDegree: 270, color: "text-gray-500" },
    { name: "Aquarius", symbol: "♒", startDegree: 300, color: "text-cyan-500" },
    { name: "Pisces", symbol: "♓", startDegree: 330, color: "text-indigo-500" },
  ];

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Outer Circle */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Outer glow ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 5}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="3"
          opacity="0.3"
          className="animate-pulse"
        />

        {/* Background gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 15}
          fill="url(#cosmic-gradient)"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          opacity="0.15"
        />

        {/* Zodiac signs outer ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 25}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="1"
          opacity="0.4"
        />

        {/* Zodiac sign symbols */}
        {zodiacSigns.map((sign) => {
          const angle = (sign.startDegree * Math.PI) / 180;
          const radius = size / 2 - 35;
          const x = size / 2 + Math.cos(angle) * radius;
          const y = size / 2 + Math.sin(angle) * radius;
          
          return (
            <g key={sign.name}>
              <text
                x={x}
                y={y + 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-sm fill-current ${sign.color} font-bold`}
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {/* House Divisions */}
        {houses.map((house) => {
          const angle = (house.degrees * Math.PI) / 180;
          const innerRadius = size / 2 - 60;
          const outerRadius = size / 2 - 15;
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
                strokeWidth="1.5"
                opacity="0.6"
              />
              <text
                x={size / 2 + Math.cos(angle) * (outerRadius - 20)}
                y={size / 2 + Math.sin(angle) * (outerRadius - 20)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-muted-foreground font-semibold"
              >
                {house.number}
              </text>
            </g>
          );
        })}

        {/* Inner zodiac ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 70}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Planets with enhanced styling */}
        {planets.map((planet) => {
          const angle = (planet.longitude * Math.PI) / 180;
          const radius = size / 2 - 50;
          const x = size / 2 + Math.cos(angle) * radius;
          const y = size / 2 + Math.sin(angle) * radius;
          
          return (
            <g key={planet.name}>
              {/* Planet glow */}
              <circle
                cx={x}
                cy={y}
                r="12"
                fill="hsl(var(--accent))"
                opacity="0.2"
                className="animate-pulse"
              />
              {/* Planet background */}
              <circle
                cx={x}
                cy={y}
                r="10"
                className="fill-card stroke-accent"
                strokeWidth="2"
              />
              {/* Planet symbol */}
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm fill-accent font-bold"
              >
                {planet.symbol}
              </text>
              {/* Retrograde indicator */}
              {planet.isRetrograde && (
                <text
                  x={x + 8}
                  y={y - 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-red-500 font-bold"
                >
                  ℞
                </text>
              )}
            </g>
          );
        })}

        {/* Center cosmic design */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="20"
          fill="url(#center-gradient)"
          opacity="0.8"
        />
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r="15"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          opacity="0.6"
        />

        {/* Center star pattern */}
        <g>
          {[0, 72, 144, 216, 288].map((angle, index) => {
            const rad = (angle * Math.PI) / 180;
            const x = size / 2 + Math.cos(rad) * 8;
            const y = size / 2 + Math.sin(rad) * 8;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1"
                fill="hsl(var(--accent))"
                opacity="0.8"
                className="animate-pulse"
              />
            );
          })}
        </g>

        {/* Gradient Definitions */}
        <defs>
          <radialGradient id="cosmic-gradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.05" />
            <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.1" />
          </radialGradient>
          
          <radialGradient id="center-gradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </radialGradient>
        </defs>
      </svg>

      {/* Center Icon with enhanced styling */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <Stars className="w-8 h-8 text-accent animate-twinkle" />
          <div className="absolute inset-0 w-8 h-8 bg-accent/20 rounded-full blur-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}