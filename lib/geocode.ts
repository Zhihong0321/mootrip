export async function reverseGeocode(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "ShanghaiTripGallery/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();
    
    // Extract a readable name
    const address = data.address;
    const name = address.attraction || address.landmark || address.road || address.suburb || address.city || "Unknown Location";
    
    return {
      name_en: name,
      display_name: data.display_name,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
