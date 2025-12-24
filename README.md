# Shanghai Trip Photo Gallery

A mobile-first, high-performance photo gallery built to showcase 800+ memories from a family trip to Shanghai and Hangzhou.

## Features
- **Admin Dashboard**: Batch upload photos with automatic EXIF processing.
- **Image Optimization**: Automatic generation of thumbnails, medium, and full-resolution images using `sharp`.
- **GPS Integration**: Automatic reverse geocoding to suggest location names.
- **Masonry Layout**: Responsive 2-column masonry grid for mobile.
- **Lightbox**: Immersive full-screen photo viewing with navigation.
- **Tech Stack**: Next.js 14, Prisma, SQLite, Tailwind CSS, shadcn/ui.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Initialization
```bash
npx prisma migrate dev
npx prisma db seed
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## Documentation
- [User Guide](USER_GUIDE.md)
- [API Reference](API.md)
- [Build Plan](MASTER_BUILD_PLAN.md)

## Docker Support
Build the container:
```bash
docker build -t shanghai-trip .
```
Run with Docker Compose:
```bash
docker-compose up
```
