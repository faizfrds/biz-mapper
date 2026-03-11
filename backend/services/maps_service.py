import os
import googlemaps
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

if API_KEY and API_KEY != "your-google-maps-api-key":
    gmaps = googlemaps.Client(key=API_KEY)
else:
    gmaps = None
    print("Warning: GOOGLE_MAPS_API_KEY is not set. Maps API requests will fail.")

def geocode_to_bounding_box(place_name: str) -> dict:
    """
    Converts a neighborhood or place name into bounding box coordinates 
    (south, west, north, east) and its centroid (lat, lng).
    
    Args:
        place_name: Natural language description of a place (e.g., "Capitol Hill, Seattle").
        
    Returns:
        dict: Geographic data containing bounds and location, or an error dictionary.
    """
    if not gmaps:
        return {"error": "Google Maps API client is not initialized."}
        
    try:
        geocode_result = gmaps.geocode(place_name)
        if not geocode_result:
            return {"error": f"Could not find coordinates for '{place_name}'"}
            
        best_match = geocode_result[0]
        geometry = best_match.get("geometry", {})
        
        # Get the centroid
        location = geometry.get("location", {})
        
        # Get the bounds (viewport is always present, bounds may not be for smaller places)
        bounds = geometry.get("bounds") or geometry.get("viewport")
        
        if not bounds:
             return {
                 "location": location,
                 "address": best_match.get("formatted_address"),
                 "bounds": None
             }
             
        # Extract SW and NE corners
        south = bounds["southwest"]["lat"]
        west = bounds["southwest"]["lng"]
        north = bounds["northeast"]["lat"]
        east = bounds["northeast"]["lng"]
        
        return {
            "location": location,
            "address": best_match.get("formatted_address"),
            "bounds": {
                "south": south,
                "west": west,
                "north": north,
                "east": east
            }
        }
    except Exception as e:
        return {"error": f"Geocoding failed: {str(e)}"}
