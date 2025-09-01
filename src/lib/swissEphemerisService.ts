interface BirthData {
  name: string;
  date: string;
  time: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
}

interface PlanetaryPosition {
  planet: string;
  symbol: string;
  longitude: number;
  sign: string;
  degreeInSign: number;
  speed: number;
  house: number;
  isRetrograde: boolean;
}

interface BirthChart {
  ascendant: {
    longitude: number;
    sign: string;
    degreeInSign: number;
  };
  midheaven: {
    longitude: number;
    sign: string;
    degreeInSign: number;
  };
  planets: PlanetaryPosition[];
  houses: {
    house: number;
    longitude: number;
    sign: string;
    degreeInSign: number;
  }[];
  aspects: {
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }[];
  metadata: {
    julianDay: number;
    localTime: string;
    utcTime: string;
    timezone: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

export class SwissEphemerisService {
  private baseUrl: string;

  constructor() {
    // Use environment variable or default to localhost:8000
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  }

  async calculateBirthChart(birthData: BirthData): Promise<BirthChart> {
    try {
      const response = await fetch(`${this.baseUrl}/api/birth-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(birthData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const chartData = await response.json();
      return chartData;
    } catch (error) {
      console.error('Error calling Swiss Ephemeris API:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const swissEphemerisService = new SwissEphemerisService();
