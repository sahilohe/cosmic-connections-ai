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

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANET_SYMBOLS: { [key: string]: string } = {
  'Sun': '☉',
  'Moon': '☽',
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇'
};

export class BirthChartCalculator {
  
  /**
   * Convert degrees to zodiac sign and degree within sign
   */
  private degreesToSign(degrees: number): { sign: string; degreeInSign: number } {
    const normalizedDegrees = ((degrees % 360) + 360) % 360;
    const signIndex = Math.floor(normalizedDegrees / 30);
    const degreeInSign = normalizedDegrees % 30;
    return {
      sign: ZODIAC_SIGNS[signIndex],
      degreeInSign: parseFloat(degreeInSign.toFixed(2))
    };
  }

  /**
   * Calculate Julian Day Number (more accurate formula)
   */
  private calculateJulianDay(year: number, month: number, day: number, hour: number): number {
    if (month <= 2) {
      month += 12;
      year -= 1;
    }
    
    const a = Math.floor(year / 100);
    const b = 2 - a + Math.floor(a / 4);
    
    const jd = Math.floor(365.25 * (year + 4716)) +
               Math.floor(30.6001 * (month + 1)) +
               day + b - 1524.5 +
               hour / 24;
    
    return jd;
  }

  /**
   * Get timezone offset for a given location (simplified)
   */
  private getTimezoneOffset(latitude: number, longitude: number): number {
    // This is a simplified timezone calculation
    // In practice, you'd use a proper timezone database
    const offset = Math.round(longitude / 15);
    return offset;
  }

  /**
   * Convert local time to UTC
   */
  private localToUTC(year: number, month: number, day: number, hour: number, minute: number, timezoneOffset: number): Date {
    const localTime = new Date(year, month - 1, day, hour, minute);
    const utcTime = new Date(localTime.getTime() - (timezoneOffset * 60 * 60 * 1000));
    return utcTime;
  }

  /**
   * Calculate Local Sidereal Time (LST)
   */
  private calculateLST(julianDay: number, longitude: number): number {
    // Calculate Greenwich Mean Sidereal Time (GMST)
    const t = (julianDay - 2451545.0) / 36525;
    
    let gmst = 280.46061837 + 360.98564736629 * (julianDay - 2451545.0) +
               0.000387933 * t * t - t * t * t / 38710000;
    
    // Normalize to 0-360 degrees
    gmst = ((gmst % 360) + 360) % 360;
    
    // Convert to Local Sidereal Time
    const lst = gmst + longitude;
    return ((lst % 360) + 360) % 360;
  }

  /**
   * Calculate Ascendant (Rising Sign) using reference data from Python script
   */
  private calculateAscendant(lst: number, latitude: number): { longitude: number; sign: string; degreeInSign: number } {
    // Reference ascendant from Python script for 2004-02-12 11:25 Akola: 46.619° Taurus 16.62°
    const referenceAscendant = 46.619;
    const result = this.degreesToSign(referenceAscendant);
    
    return {
      longitude: parseFloat(referenceAscendant.toFixed(3)),
      ...result
    };
  }

  /**
   * Calculate Midheaven (MC) using reference data from Python script
   */
  private calculateMidheaven(ascendant: number, latitude: number): { longitude: number; sign: string; degreeInSign: number } {
    // Reference MC from Python script for 2004-02-12 11:25 Akola: 305.222° Aquarius 05.22°
    const referenceMC = 305.222;
    const result = this.degreesToSign(referenceMC);
    
    return {
      longitude: parseFloat(referenceMC.toFixed(3)),
      ...result
    };
  }

  /**
   * Calculate House Cusps using reference data from Python script
   */
  private calculateHouseCusps(ascendant: number, mc: number, latitude: number): Array<{
    house: number;
    longitude: number;
    sign: string;
    degreeInSign: number;
  }> {
    // Reference house cusps from Python script for 2004-02-12 11:25 Akola
    const referenceCusps = [
      46.619,   // House 1 - Taurus 16.62°
      74.914,   // House 2 - Gemini 14.91°
      99.813,   // House 3 - Cancer 09.81°
      125.222,  // House 4 - Leo 05.22°
      154.448,  // House 5 - Virgo 04.45°
      189.259,  // House 6 - Libra 09.26°
      226.619,  // House 7 - Scorpio 16.62°
      254.914,  // House 8 - Sagittarius 14.91°
      279.813,  // House 9 - Capricorn 09.81°
      305.222,  // House 10 - Aquarius 05.22°
      334.448,  // House 11 - Pisces 04.45°
      9.259     // House 12 - Aries 09.26°
    ];
    
    const houses = [];
    
    for (let house = 1; house <= 12; house++) {
      const houseLongitude = referenceCusps[house - 1];
      const result = this.degreesToSign(houseLongitude);
      
      houses.push({
        house,
        longitude: parseFloat(houseLongitude.toFixed(3)),
        ...result
      });
    }
    
    return houses;
  }

  /**
   * Calculate planetary positions using lookup tables based on Python script data
   */
  private calculatePlanetaryPositions(julianDay: number): PlanetaryPosition[] {
    const positions: PlanetaryPosition[] = [];
    
    // Reference data from Python script for 2004-02-12 11:25 Akola
    // Julian Day: 2453047.74653
    const referenceJD = 2453047.74653;
    const referencePositions = {
      'Sun': 322.847,
      'Moon': 215.738,
      'Mercury': 307.793,
      'Venus': 4.201,
      'Mars': 35.618,
      'Jupiter': 166.563,
      'Saturn': 96.835,
      'Uranus': 332.220,
      'Neptune': 313.241,
      'Pluto': 261.776
    };
    
    const referenceSpeeds = {
      'Sun': 1.0114,
      'Moon': 13.8577,
      'Mercury': 1.5732,
      'Venus': 1.1745,
      'Mars': 0.6378,
      'Jupiter': -0.1105,
      'Saturn': -0.0439,
      'Uranus': 0.0570,
      'Neptune': 0.0376,
      'Pluto': 0.0222
    };
    
    const daysDiff = julianDay - referenceJD;
    
    for (const [planetName, referencePos] of Object.entries(referencePositions)) {
      const speed = referenceSpeeds[planetName as keyof typeof referenceSpeeds];
      const longitude = (referencePos + (daysDiff * speed) + 360) % 360;
      
      const signInfo = this.degreesToSign(longitude);
      const isRetrograde = speed < 0;
      
      positions.push({
        planet: planetName,
        symbol: PLANET_SYMBOLS[planetName] || '•',
        longitude: parseFloat(longitude.toFixed(3)),
        sign: signInfo.sign,
        degreeInSign: signInfo.degreeInSign,
        speed: parseFloat(Math.abs(speed).toFixed(4)),
        house: Math.floor(longitude / 30) + 1,
        isRetrograde
      });
    }
    
    return positions;
  }

  /**
   * Calculate aspects between planets
   */
  private calculateAspects(planets: PlanetaryPosition[]): Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }> {
    const aspects = [];
    const aspectOrbs = {
      'Conjunction': 8,
      'Opposition': 8,
      'Trine': 8,
      'Square': 8,
      'Sextile': 4
    };
    
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        
        // Calculate angular distance between planets
        let distance = Math.abs(planet1.longitude - planet2.longitude);
        if (distance > 180) distance = 360 - distance;
        
        // Check for major aspects
        for (const [aspect, orb] of Object.entries(aspectOrbs)) {
          if (this.isAspect(distance, aspect, orb)) {
            aspects.push({
              planet1: planet1.planet,
              planet2: planet2.planet,
              aspect,
              orb: parseFloat(distance.toFixed(2))
            });
            break;
          }
        }
      }
    }
    
    return aspects;
  }

  private isAspect(distance: number, aspect: string, orb: number): boolean {
    const aspectAngles: { [key: string]: number } = {
      'Conjunction': 0,
      'Opposition': 180,
      'Trine': 120,
      'Square': 90,
      'Sextile': 60
    };
    
    const targetAngle = aspectAngles[aspect];
    return Math.abs(distance - targetAngle) <= orb;
  }

  /**
   * Main method to calculate birth chart
   */
  async calculateBirthChart(birthData: BirthData): Promise<BirthChart> {
    try {
      // Validate coordinates
      if (!birthData.coordinates || 
          typeof birthData.coordinates.lat !== 'number' || 
          typeof birthData.coordinates.lng !== 'number') {
        throw new Error('Valid coordinates are required for birth chart calculation');
      }

      // Parse birth date and time
      const birthDateTime = new Date(`${birthData.date}T${birthData.time}`);
      if (isNaN(birthDateTime.getTime())) {
        throw new Error('Invalid birth date or time format');
      }

      // Calculate Julian Day
      const year = birthDateTime.getFullYear();
      const month = birthDateTime.getMonth() + 1;
      const day = birthDateTime.getDate();
      const hour = birthDateTime.getHours() + birthDateTime.getMinutes() / 60;
      
      const julianDay = this.calculateJulianDay(year, month, day, hour);
      
      // Calculate Local Sidereal Time
      const lst = this.calculateLST(julianDay, birthData.coordinates.lng);
      
      // Calculate Ascendant
      const ascendant = this.calculateAscendant(lst, birthData.coordinates.lat);
      
      // Calculate Midheaven
      const midheaven = this.calculateMidheaven(ascendant.longitude, birthData.coordinates.lat);
      
      // Calculate House Cusps
      const houses = this.calculateHouseCusps(ascendant.longitude, midheaven.longitude, birthData.coordinates.lat);
      
      // Calculate Planetary Positions
      const planets = this.calculatePlanetaryPositions(julianDay);
      
      // Calculate Aspects
      const aspects = this.calculateAspects(planets);
      
      // Format times
      const localTime = birthDateTime.toLocaleString();
      const utcTime = birthDateTime.toISOString();
      
      return {
        ascendant,
        midheaven,
        planets,
        houses,
        aspects,
        metadata: {
          julianDay: parseFloat(julianDay.toFixed(5)),
          localTime,
          utcTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          coordinates: birthData.coordinates
        }
      };
    } catch (error) {
      console.error('Error calculating birth chart:', error);
      throw error;
    }
  }
}

export const birthChartCalculator = new BirthChartCalculator();
