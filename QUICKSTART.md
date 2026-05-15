<!-- @format -->

# 🚀 Quick Start Guide

Get your Golf Go app running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on your phone (optional, for physical device testing)

## Step 1: Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd golf-go

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../app
npm install
```

## Step 2: Database Setup

```bash
cd backend

# Create .env file
cp .env.example .env

# Edit .env and add your PostgreSQL connection string:
# DATABASE_URL="postgresql://user:password@localhost:5432/golf_go?schema=public"

# Create database and run migrations
npx prisma migrate dev --name init

# Seed sample data
npm run seed
```

You should see:

```
✅ Created user: Demo User
✅ Created course: Pine Valley Golf Club with 3 holes
✅ Created 3 clubs
✅ Created sample round with 3 holes
🎉 Seeding complete!
```

## Step 3: Start Backend

```bash
# Still in backend directory
npm run dev
```

Server runs on `http://localhost:3000`

Test it: Open `http://localhost:3000/api/courses` in your browser

## Step 4: Configure Frontend

```bash
cd ../app

# Create .env file
cp .env.example .env

# For iOS Simulator/Android Emulator, use:
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# For physical device on same network, use your computer's IP:
# EXPO_PUBLIC_API_URL=http://192.168.1.X:3000/api
# (Find your IP with `ipconfig` on Windows or `ifconfig` on Mac/Linux)
```

## Step 5: Start Frontend

```bash
# Still in app directory
npm start
```

This opens Expo Dev Tools. Choose:

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

## Step 6: Test the App

1. **Home Screen**: You'll see three buttons
   - Play Round
   - Practice Mode
   - Courses

2. **Courses**: Tap to see "Pine Valley Golf Club"

3. **Play Mode**:
   - Select Pine Valley
   - Grant location permissions
   - See Front/Center/Back yardages (once GPS locks)
   - Use +/- to adjust score
   - Navigate between holes

4. **Practice Mode**:
   - Select a club (Driver, 7 Iron, or Pitching Wedge)
   - Tap "Mark Shot" to start
   - Walk forward
   - Tap "End Shot" to record distance

## 📱 GPS Testing Tips

**Simulator/Emulator:**

- iOS Simulator: Debug → Location → Custom Location
- Android Emulator: Extended Controls (⋯) → Location

Set coordinates near your test course:

- Latitude: 39.8283
- Longitude: -74.9872

**Physical Device:**

- Go outside for best GPS accuracy
- Wait for accuracy < 15m before marking shots
- Move at least 10 yards between shot start/end

## 🔧 Troubleshooting

### "Cannot connect to backend"

- Check backend is running (`npm run dev`)
- Verify `EXPO_PUBLIC_API_URL` in app/.env
- For physical device, use computer's IP, not localhost

### "GPS not working"

- Grant location permissions (Always)
- Move to area with clear sky view
- Check location services are enabled in settings

### "Database error"

- Ensure PostgreSQL is running
- Verify DATABASE_URL in backend/.env
- Run `npx prisma migrate reset` to reset database

### "Module not found"

- Delete node_modules: `rm -rf node_modules`
- Reinstall: `npm install`
- Clear cache: `npx expo start -c` (frontend) or `npm run dev` (backend)

## 📊 View Database

```bash
cd backend
npx prisma studio
```

Opens at `http://localhost:5555` - browse all data visually

## 🧪 API Testing

Use curl or Postman:

```bash
# Get courses
curl http://localhost:3000/api/courses

# Get clubs
curl http://localhost:3000/api/clubs

# Create a shot
curl -X POST http://localhost:3000/api/shots \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "clubId": 1,
    "startLatitude": 39.8283,
    "startLongitude": -74.9872,
    "endLatitude": 39.8290,
    "endLongitude": -74.9870,
    "carryDistance": 250
  }'
```

## 🎯 Next Steps

1. **Add Real Course Data**: Replace sample polygons with actual GPS coordinates
2. **Customize Clubs**: Add your own clubs in Practice Mode
3. **Play a Round**: Go to a course and test Play Mode
4. **Track Stats**: Build up shot history for club analytics

## 📚 Need Help?

- Read the full [README.md](README.md)
- Check [Prisma docs](https://www.prisma.io/docs/)
- Check [Expo docs](https://docs.expo.dev/)
- Review code comments in source files

Happy golfing! ⛳🏌️‍♂️
