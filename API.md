# API Documentation

## Days
- `GET /api/days`: Returns all days with their associated locations.
- `POST /api/days`: Create a new day.
  - Body: `{ title: string, date: string, order: number }`
- `PATCH /api/days/[id]`: Update a day.
- `DELETE /api/days/[id]`: Delete a day (cascade deletes locations and photos).

## Locations
- `GET /api/locations`: Returns all locations.
- `POST /api/locations`: Create a new location.
  - Body: `{ name_en: string, name_cn?: string, dayId: string, order: number, latitude?: number, longitude?: number }`
- `PATCH /api/locations/[id]`: Update a location.
- `DELETE /api/locations/[id]`: Delete a location.

## Photos
- `GET /api/photos`: Get photos.
  - Query Param: `dayId` (optional) - filter photos by day.
- `POST /api/upload`: Upload and process a photo.
  - Body: `FormData` with `file`, `dayId`, `locationId`.
  - Response: Created photo object with paths to thumbnail, medium, and full versions.
