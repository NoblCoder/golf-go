<!-- @format -->

# 🏌️ Golf Go - GPS Golf Companion

A full-stack GPS golf app with Play Mode (scoring + rangefinder), Practice Mode (club distance tracking), and intelligent shot tracking.

## 🏗️ Architecture

### Backend (Node.js + Express + Prisma + PostgreSQL)

- RESTful API with Prisma ORM
- Models: User, Course, Hole, Round, RoundHole, Shot, Club
- Real-time GPS distance calculations
- Club analytics and shot statistics

### Frontend (React Native + Expo)

- **Play Mode**: Scoring with GPS rangefinder (Front/Center/Back distances)
- **Practice Mode**: Club distance tracking and analytics
- **GPS Engine**: Kalman filter smoothing, movement detection, battery optimization
- **Shot Tracking**: Carry/total distance, elevation, dispersion
- **Auto Hole Detection**: Polygon-based tee/fairway/green detection

## 🚀 Getting Started

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
npx prisma migrate dev

# Seed sample data (optional)
npx prisma db seed

# Start server
npm run dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd app

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your backend URL

# Start Expo
npm start

# Run on device
npm run ios     # iOS
npm run android # Android
```

## 📁 Project Structure

```
golf-go/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express server
│   │   └── routes/
│   │       ├── courses.js     # Course endpoints
│   │       ├── rounds.js      # Round endpoints
│   │       ├── shots.js       # Shot endpoints
│   │       └── clubs.js       # Club endpoints
│   └── prisma/
│       └── schema.prisma      # Database schema
│
└── app/
    ├── app/
    │   ├── _layout.jsx        # Root layout with providers
    │   ├── index.jsx          # Home screen
    │   ├── play.jsx           # Play Mode screen
    │   ├── practice.jsx       # Practice Mode screen
    │   └── courses.jsx        # Course selection
    │
    └── src/
        ├── services/
        │   ├── gps/
        │   │   ├── GPSEngine.js       # GPS tracking with Kalman filter
        │   │   ├── KalmanFilter.js    # GPS smoothing
        │   │   └── distanceUtils.js   # Haversine, elevation, etc.
        │   └── holeDetection.js       # Auto hole detection
        │
        ├── context/
        │   ├── GPSProvider.jsx        # GPS state management
        │   └── ShotTrackingProvider.jsx # Shot tracking state
        │
        ├── hooks/
        │   └── useAPI.js              # React Query hooks
        │
        └── components/
            ├── YardageDisplay.jsx     # Front/Center/Back display
            ├── ScoreEntry.jsx         # +/- scoring
            ├── ShotButton.jsx         # Mark/End shot
            └── HoleNavigation.jsx     # Prev/Current/Next
```

## 🎯 Key Features

### GPS Engine

- **Kalman Filter**: Smooths GPS jitter while staying responsive
- **Movement Detection**: Detects still/walking/riding states
- **Dynamic Polling**: Adjusts GPS frequency based on movement (0.5-2 Hz)
- **Battery Optimization**: Reduces polling when idle or in background
- **Accuracy Gating**: Rejects readings worse than 20m

### Shot Tracking

- **Carry Distance**: Haversine formula for precise measurements
- **Elevation Adjustment**: "Plays like" yardage calculation
- **Dispersion**: Left/right distance from target line
- **Quality Checks**: Rejects shots <5 yards or with poor GPS

### Auto Hole Detection

- **Polygon-Based**: Uses tee box, fairway, and green polygons
- **Fairway Locking**: Prevents hole changes mid-fairway
- **Anti-Error Logic**: Requires 3 consecutive GPS points in polygon
- **Fallback**: Nearest tee box detection (40-80 yards)

### Green Distances

- **Front/Center/Back**: Calculated from green polygon geometry
- **Centroid**: Center of green
- **Axis Projection**: Projects polygon vertices to find front/back
- **Elevation Display**: Shows "plays like" distance for uphill/downhill

## 📡 API Endpoints

### Courses

- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course with holes

### Rounds

- `GET /api/rounds` - List rounds
- `GET /api/rounds/:id` - Get round with scores
- `POST /api/rounds` - Create new round
- `PUT /api/rounds/:id/holes/:holeNumber` - Update hole score
- `POST /api/rounds/:id/complete` - Complete round

### Shots

- `GET /api/shots?roundId=X` - Get shots by round
- `GET /api/shots?clubId=X` - Get shots by club
- `POST /api/shots` - Create shot
- `DELETE /api/shots/:id` - Delete shot

### Clubs

- `GET /api/clubs` - List clubs
- `GET /api/clubs/:id/analytics` - Get club statistics
- `POST /api/clubs` - Create club
- `PUT /api/clubs/:id` - Update club
- `DELETE /api/clubs/:id` - Delete club

## 🎨 UI Design Principles

- **Large Typography**: 48px+ for yardages (sunlight readability)
- **High Contrast**: Dark green theme with white text
- **Minimal Icons**: Text-based for clarity
- **One Primary Action**: Single focus per screen
- **Card Layout**: Organized, scannable sections

## 🧠 Key Insights

1. **Keep Play Mode Pure**: No club suggestions during rounds—just yardages and scoring
2. **Separate Shot Tracking**: Practice Mode for distance analysis, Play Mode for scoring
3. **Local-First**: Instant UI updates, background sync to server
4. **Optimistic Hole Detection**: Better UX than conservative detection
5. **Rough Polygons OK**: Consistency matters more than precision

## 📝 Database Schema

```prisma
User → Course → Round → RoundHole
                         ↓
Club → Shot (with GPS coordinates, distances, dispersion)

Hole: Contains teeBoxPolygon, fairwayPolygon, greenPolygon
```

## 🔧 Tech Stack

**Backend:**

- Node.js + Express
- Prisma ORM
- PostgreSQL
- CORS, body-parser

**Frontend:**

- React Native + Expo
- Expo Router (file-based routing)
- React Query (data fetching)
- Expo Location (GPS)
- Zustand (optional state management)

## 📱 Permissions

The app requires:

- **Location (Always)**: For GPS tracking during rounds
- **Background Location**: For continuous tracking while phone is locked

## 🚧 Roadmap

- [ ] Offline mode with local SQLite cache
- [ ] Apple Watch integration
- [ ] Shot shape analysis (draw/fade)
- [ ] Wind adjustment recommendations
- [ ] Social features (share rounds)
- [ ] Handicap tracking
- [ ] Course mapping tools

## 📄 License

MIT

---

Built with ⛳ by the Golf Go team
