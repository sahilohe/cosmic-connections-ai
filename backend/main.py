from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import swisseph as swe
from datetime import datetime, timezone
from dateutil import tz
from dateutil import parser
import math

app = FastAPI(title="AstroSoul - Swiss Ephemeris API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Swiss Ephemeris
swe.set_ephe_path()

# Configuration
DEFAULT_HOUSE = "P"  # Placidus
DEFAULT_ZODIAC = "tropical"
SIDEREAL_AYANAMSA = swe.SIDM_FAGAN_BRADLEY

class BirthData(BaseModel):
    name: str
    date: str
    time: str
    city: str
    coordinates: Optional[dict] = None
    timezone: Optional[str] = None

class PlanetaryPosition(BaseModel):
    planet: str
    symbol: str
    longitude: float
    sign: str
    degreeInSign: float
    speed: float
    house: int
    isRetrograde: bool

class BirthChart(BaseModel):
    ascendant: dict
    midheaven: dict
    planets: List[PlanetaryPosition]
    houses: List[dict]
    aspects: List[dict]
    metadata: dict

ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

PLANET_SYMBOLS = {
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
}

def degrees_to_sign(degrees: float) -> dict:
    """Convert degrees to zodiac sign and degree within sign"""
    normalized_degrees = ((degrees % 360) + 360) % 360
    sign_index = int(normalized_degrees // 30)
    degree_in_sign = normalized_degrees % 30
    return {
        "sign": ZODIAC_SIGNS[sign_index],
        "degreeInSign": round(degree_in_sign, 2)
    }

def calculate_house_system(ascendant: float, mc: float, latitude: float, longitude: float, julian_day: float) -> List[dict]:
    """Calculate house cusps using Swiss Ephemeris Placidus system"""
    houses = []
    
    try:
        # Get actual house cusps from Swiss Ephemeris
        cusps, ascmc = swe.houses(julian_day, latitude, longitude, DEFAULT_HOUSE.encode())
        
        for house_num in range(1, 13):
            house_longitude = cusps[house_num - 1]  # Swiss Ephemeris uses 0-based indexing
            sign_info = degrees_to_sign(house_longitude)
            
            houses.append({
                "house": house_num,
                "longitude": round(house_longitude, 3),
                "sign": sign_info["sign"],
                "degreeInSign": sign_info["degreeInSign"]
            })
    except Exception as e:
        # Fallback to simplified calculation
        for house_num in range(1, 13):
            if house_num == 1:
                house_longitude = ascendant
            elif house_num == 10:
                house_longitude = mc
            else:
                angle = (house_num - 1) * 30
                house_longitude = (ascendant + angle) % 360
            
            sign_info = degrees_to_sign(house_longitude)
            houses.append({
                "house": house_num,
                "longitude": round(house_longitude, 3),
                "sign": sign_info["sign"],
                "degreeInSign": sign_info["degreeInSign"]
            })
    
    return houses

def calculate_aspects(planets: List[PlanetaryPosition]) -> List[dict]:
    """Calculate aspects between planets"""
    aspects = []
    aspect_angles = {
        "Conjunction": 0,
        "Sextile": 60,
        "Square": 90,
        "Trine": 120,
        "Opposition": 180
    }
    
    for i, planet1 in enumerate(planets):
        for j, planet2 in enumerate(planets[i+1:], i+1):
            angle_diff = abs(planet1.longitude - planet2.longitude)
            if angle_diff > 180:
                angle_diff = 360 - angle_diff
            
            for aspect_name, aspect_angle in aspect_angles.items():
                orb = abs(angle_diff - aspect_angle)
                if orb <= 8:  # 8 degree orb
                    aspects.append({
                        "planet1": planet1.planet,
                        "planet2": planet2.planet,
                        "aspect": aspect_name,
                        "orb": round(orb, 2)
                    })
    
    return aspects

def get_timezone_from_coordinates(lat: float, lng: float) -> str:
    """Get timezone from coordinates using a simplified approach"""
    # This is a simplified timezone detection
    # In a production system, you'd use a proper timezone database
    
    # US timezones
    if lng < -100:  # Mountain/Pacific
        return 'America/Denver'
    elif lng < -85:  # Central
        return 'America/Chicago'
    elif lng < -70:  # Eastern
        return 'America/New_York'
    
    # European timezones
    elif lng < -10:  # Western Europe
        return 'Europe/London'
    elif lng < 20:   # Central Europe
        return 'Europe/Berlin'
    elif lng < 40:   # Eastern Europe
        return 'Europe/Moscow'
    
    # Asian timezones
    elif lng < 80:   # India
        return 'Asia/Kolkata'
    elif lng < 120:  # China
        return 'Asia/Shanghai'
    elif lng < 140:  # Japan
        return 'Asia/Tokyo'
    
    # Default to UTC for unknown regions
    else:
        return 'UTC'

@app.post("/api/birth-chart", response_model=BirthChart)
async def calculate_birth_chart(birth_data: BirthData):
    """Calculate birth chart using Swiss Ephemeris"""
    try:
        # Parse date and time
        date_time_str = f"{birth_data.date} {birth_data.time}"
        dt = parser.parse(date_time_str)
        
        # Extract components
        year = dt.year
        month = dt.month
        day = dt.day
        hour = dt.hour + dt.minute / 60.0 + dt.second / 3600.0
        
        # Get coordinates
        if not birth_data.coordinates:
            raise HTTPException(status_code=400, detail="Coordinates are required")
        
        lat = birth_data.coordinates["lat"]
        lng = birth_data.coordinates["lng"]
        
        # Calculate Julian Day using proper timezone conversion
        try:
            # Use provided timezone or get from coordinates
            if birth_data.timezone:
                tz_name = birth_data.timezone
            else:
                tz_name = get_timezone_from_coordinates(lat, lng)
            
            local_tz = tz.gettz(tz_name)
            
            # Create local datetime with timezone
            local_dt = datetime(year, month, day, dt.hour, dt.minute, tzinfo=local_tz)
            
            # Convert to UTC
            utc_dt = local_dt.astimezone(tz.UTC)
            ut_hours = utc_dt.hour + utc_dt.minute/60 + utc_dt.second/3600
            
            # Calculate Julian Day
            julian_day = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, ut_hours)
            
        except Exception as e:
            # Fallback to treating local time as UTC
            local_dt = datetime(year, month, day, dt.hour, dt.minute)
            utc_dt = local_dt.replace(tzinfo=timezone.utc)
            ut_hours = utc_dt.hour + utc_dt.minute/60 + utc_dt.second/3600
            julian_day = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, ut_hours)
        
        # Set up Swiss Ephemeris flags like reference script
        IFLAG = swe.FLG_SWIEPH | swe.FLG_SPEED
        
        # Calculate Ascendant and MC using Swiss Ephemeris
        try:
            cusps, ascmc = swe.houses(julian_day, lat, lng, DEFAULT_HOUSE.encode())
            ascendant = ascmc[0]
            mc = ascmc[1]
        except Exception as e:
            # Fallback to basic calculation
            ascendant = 0.0
            mc = 0.0
            cusps = [0.0] * 12
        
        # Calculate planetary positions using Swiss Ephemeris
        planets = []
        bodies = [swe.SUN, swe.MOON, swe.MERCURY, swe.VENUS, swe.MARS,
                  swe.JUPITER, swe.SATURN, swe.URANUS, swe.NEPTUNE, swe.PLUTO]
        
        planet_names = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
                       'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
        
        for i, (planet_code, planet_name) in enumerate(zip(bodies, planet_names)):
            try:
                xx, _ = swe.calc_ut(julian_day, planet_code, IFLAG)
                longitude = xx[0]  # ecliptic longitude
                speed = xx[3]      # speed
                
                # Check if retrograde
                is_retrograde = speed < 0
                
                # Convert to sign
                sign_info = degrees_to_sign(longitude)
                
                # Determine house using actual house cusps
                house_num = 1
                for i, cusp in enumerate(cusps):
                    if longitude >= cusp:
                        house_num = i + 1
                    else:
                        break
                if longitude < cusps[0]:  # Before first house cusp
                    house_num = 12
                
                planets.append(PlanetaryPosition(
                    planet=planet_name,
                    symbol=PLANET_SYMBOLS[planet_name],
                    longitude=round(longitude, 3),
                    sign=sign_info["sign"],
                    degreeInSign=sign_info["degreeInSign"],
                    speed=round(speed, 3),
                    house=house_num,
                    isRetrograde=is_retrograde
                ))
            except Exception as e:
                continue
        
        # Calculate houses using Swiss Ephemeris
        houses = calculate_house_system(ascendant, mc, lat, lng, julian_day)
        
        # Calculate aspects
        aspects = calculate_aspects(planets)
        
        # Prepare metadata
        metadata = {
            "julianDay": round(julian_day, 5),
            "localTime": dt.strftime("%Y-%m-%d %H:%M:%S"),
            "utcTime": utc_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "timezone": tz_name,
            "coordinates": {
                "lat": lat,
                "lng": lng
            }
        }
        
        # Prepare ascendant and midheaven
        ascendant_info = degrees_to_sign(ascendant)
        mc_info = degrees_to_sign(mc)
        
        return BirthChart(
            ascendant={
                "longitude": round(ascendant, 3),
                "sign": ascendant_info["sign"],
                "degreeInSign": ascendant_info["degreeInSign"]
            },
            midheaven={
                "longitude": round(mc, 3),
                "sign": mc_info["sign"],
                "degreeInSign": mc_info["degreeInSign"]
            },
            planets=planets,
            houses=houses,
            aspects=aspects,
            metadata=metadata
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating birth chart: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Swiss Ephemeris API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
