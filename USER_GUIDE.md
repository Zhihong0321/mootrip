# User Guide: Shanghai Trip Photo Gallery

## Getting Started
The application is divided into two main areas: the **Public Gallery** and the **Admin Dashboard**.

## 1. Public Gallery
- **Welcome Screen**: The entry point of the site. Click "Start Exploring" to view the photos.
- **Day Navigation**: Use the tabs at the top to switch between different days of the trip.
- **Masonry Grid**: Photos are displayed in a responsive grid, grouped by the specific location where they were taken.
- **Lightbox**: Click on any photo to open it in full-screen. You can navigate through photos using the arrows (desktop) or Prev/Next buttons (mobile).

## 2. Admin Dashboard
Access the dashboard at `/admin`.

### Photo Upload
1. Navigate to "Upload Photos".
2. Select the **Target Day** and **Target Location**.
3. If the day or location doesn't exist yet, use the "New Day" or "New Loc" buttons to create them inline.
4. Drag and drop your photos into the upload zone.
5. The application will automatically:
   - Extract EXIF data (date taken, GPS).
   - Generate thumbnails and optimized versions.
   - Save the records to the database.

### Managing Days & Locations
- **Manage Days**: Add, edit, or delete days. You can set the display order to ensure they appear correctly in the navigator.
- **Manage Locations**: Manage specific spots within each day. Each location can have a Chinese name and GPS coordinates.

## 3. Technical Notes
- **Storage**: Photos are stored in the `public/uploads` directory.
- **Database**: The site uses SQLite.
- **Performance**: Images are lazy-loaded and optimized for fast viewing on mobile devices.
