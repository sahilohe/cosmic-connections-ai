import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string, coordinates: { lat: number; lng: number } | null) => void;
  placeholder?: string;
  label?: string;
  coordinates?: { lat: number; lng: number } | null;
}

export function PlacesAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Search for a city", 
  label = "Birth City",
  coordinates
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autocompleteRef = useRef<any>(null);

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

      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsLoaded(true);
        setError(null);
      };
      script.onerror = () => {
        setError('Failed to load Google Maps API');
        console.error('Failed to load Google Maps API');
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

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

      // Handle place selection
      const handlePlaceSelect = () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          // Use formatted_address for full location display, fallback to name
          const fullLocation = place.formatted_address || place.name || '';
          
          onChange(fullLocation, { lat, lng });
        }
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
      <Label htmlFor="city" className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        {label}
      </Label>
      <Input
        ref={inputRef}
        id="city"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          // Only update the city name, preserve existing coordinates
          // The coordinates will be updated when a place is selected from autocomplete
          onChange(e.target.value, coordinates);
        }}
        className="bg-background/50"
      />
      {!isLoaded && !error && (
        <p className="text-xs text-muted-foreground mt-1">
          Loading location search...
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}