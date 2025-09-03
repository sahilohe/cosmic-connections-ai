import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Globe } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string, coordinates: { lat: number; lng: number } | null, timezone?: string) => void;
  placeholder?: string;
  label?: string;
  coordinates?: { lat: number; lng: number } | null;
  timezone?: string;
}

export function PlacesAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Search for a city", 
  label = "Birth City",
  coordinates,
  timezone
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autocompleteRef = useRef<any>(null);
  const timezoneCache = useRef<Map<string, string>>(new Map());
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (typeof window !== 'undefined' && window.google?.maps) {
        setIsLoaded(true);
        return;
      }

      // Check if API key is configured
      const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
      if (!apiKey || apiKey === 'your_google_places_api_key_here') {
        setError('Google Places API key not configured. Please set VITE_GOOGLE_PLACES_API_KEY in your .env file');
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          setIsLoaded(true);
          setError(null);
        });
        return;
      }

      // Load Google Maps script with optimized parameters
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Set up global callback
      (window as any).initGoogleMaps = () => {
        setIsLoaded(true);
        setError(null);
        delete (window as any).initGoogleMaps;
      };
      
      script.onerror = () => {
        setError('Failed to load Google Maps API');
        console.error('Failed to load Google Maps API');
        delete (window as any).initGoogleMaps;
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Function to get timezone from coordinates using Google Timezone API with caching
  const getTimezoneFromCoordinates = useCallback(async (lat: number, lng: number): Promise<string> => {
    const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    
    // Check cache first
    if (timezoneCache.current.has(cacheKey)) {
      return timezoneCache.current.get(cacheKey)!;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      const fallback = getSimplifiedTimezone(lat, lng);
      timezoneCache.current.set(cacheKey, fallback);
      return fallback;
    }

    try {
      // Get current timestamp for timezone calculation
      const timestamp = Math.floor(Date.now() / 1000);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK' && data.timeZoneId) {
          timezoneCache.current.set(cacheKey, data.timeZoneId);
          return data.timeZoneId;
        }
      }
    } catch (error) {
      console.error('Error fetching timezone:', error);
    }
    
    // Fallback to simplified timezone detection
    const fallback = getSimplifiedTimezone(lat, lng);
    timezoneCache.current.set(cacheKey, fallback);
    return fallback;
  }, []);

  // Simplified timezone detection as fallback
  const getSimplifiedTimezone = (lat: number, lng: number): string => {
    // US timezones
    if (lng < -100) return 'America/Denver';
    if (lng < -85) return 'America/Chicago';
    if (lng < -70) return 'America/New_York';
    
    // European timezones
    if (lng < -10) return 'Europe/London';
    if (lng < 20) return 'Europe/Berlin';
    if (lng < 40) return 'Europe/Moscow';
    
    // Asian timezones
    if (lng < 80) return 'Asia/Kolkata';
    if (lng < 120) return 'Asia/Shanghai';
    if (lng < 140) return 'Asia/Tokyo';
    
    return 'UTC';
  };

  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google) return;

    try {
      // Clean up existing autocomplete if it exists
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

      // Initialize autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
        fields: ['name', 'geometry', 'formatted_address', 'address_components']
      });

      // Handle place selection with debouncing
      const handlePlaceSelect = async () => {
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }
        
        debounceTimeout.current = setTimeout(async () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // Use formatted_address for full location display, fallback to name
            const fullLocation = place.formatted_address || place.name || '';
            
            // Get timezone for the selected location
            const timezoneId = await getTimezoneFromCoordinates(lat, lng);
            
            onChange(fullLocation, { lat, lng }, timezoneId);
          }
        }, 300); // 300ms debounce
      };

      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);

      return () => {
        if (autocompleteRef.current && window.google) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
      };
    } catch (error) {
      console.error('Error initializing Google Places:', error);
    }
  }, [isLoaded, onChange]);

  return (
    <div>
      <Label htmlFor="city" className="text-base font-semibold flex items-center gap-2 mb-2">
        <Globe className="w-4 h-4" />
        {label}
      </Label>
      <Input
        ref={inputRef}
        id="city"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          // Only update the city name, preserve existing coordinates and timezone
          onChange(e.target.value, coordinates, timezone);
        }}
        className="bg-background/50 text-base h-12 input-cosmic"
      />
      {timezone && (
        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          Timezone: {timezone}
        </p>
      )}
      {!isLoaded && !error && (
        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
          <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
          Loading location search...
        </p>
      )}
      {error && (
        <p className="text-sm text-red-500 mt-2 flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          {error}
        </p>
      )}
    </div>
  );
}