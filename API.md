<!-- @format -->

# 📡 API Documentation

Complete reference for the Golf Go backend API.

**Base URL:** `http://localhost:3000/api`

All endpoints return JSON. Successful requests return appropriate status codes (200, 201) and data. Errors return 4xx/5xx with error messages.

---

## 🏌️ Courses

### List All Courses

```http
GET /api/courses
```

**Response:**

```json
[
  {
    "id": 1,
    "name": "Pine Valley Golf Club",
    "city": "Pine Valley",
    "state": "NJ",
    "holes": [
      {
        "id": 1,
        "number": 1,
        "par": 4,
        "yardage": 427,
        "name": "Hole 1",
        "teeBoxPolygon": [...],
        "fairwayPolygon": [...],
        "greenPolygon": [...],
        "greenElevation": 100
      }
    ]
  }
]
```

### Get Course by ID

```http
GET /api/courses/:id
```

**Parameters:**

- `id` (number) - Course ID

**Response:** Single course object with holes array

---

## 🎯 Rounds

### List Rounds

```http
GET /api/rounds?limit=20
```

**Query Parameters:**

- `limit` (number, optional) - Max rounds to return (default: 20)

**Response:**

```json
[
  {
    "id": 1,
    "userId": 1,
    "courseId": 1,
    "startTime": "2024-05-14T10:00:00.000Z",
    "endTime": null,
    "isComplete": false,
    "course": {
      "name": "Pine Valley Golf Club"
    },
    "roundHoles": [
      {
        "holeNumber": 1,
        "strokes": 4,
        "putts": 2
      }
    ]
  }
]
```

### Get Round by ID

```http
GET /api/rounds/:id
```

**Response:** Single round object with course info and hole scores

### Create Round

```http
POST /api/rounds
```

**Body:**

```json
{
  "userId": 1,
  "courseId": 1
}
```

**Response:** Created round with auto-generated RoundHole entries (initialized to par)

### Update Hole Score

```http
PUT /api/rounds/:roundId/holes/:holeNumber
```

**Parameters:**

- `roundId` (number) - Round ID
- `holeNumber` (number) - Hole number (1-18)

**Body:**

```json
{
  "strokes": 5,
  "putts": 2
}
```

**Response:** Updated RoundHole object

### Complete Round

```http
POST /api/rounds/:id/complete
```

**Response:** Round object with `isComplete: true` and `endTime` set

---

## 💨 Shots

### List Shots

```http
GET /api/shots?roundId=1
GET /api/shots?clubId=2
```

**Query Parameters:**

- `roundId` (number, optional) - Filter by round
- `clubId` (number, optional) - Filter by club
- `limit` (number, optional) - Max shots to return (default: 100)

**Response:**

```json
[
  {
    "id": 1,
    "userId": 1,
    "clubId": 2,
    "roundId": null,
    "startLatitude": 39.8283,
    "startLongitude": -74.9872,
    "endLatitude": 39.829,
    "endLongitude": -74.987,
    "carryDistance": 150.5,
    "totalDistance": 155.0,
    "elevationChange": 5.0,
    "dispersion": -2.3,
    "timestamp": "2024-05-14T14:30:00.000Z",
    "club": {
      "name": "7 Iron"
    }
  }
]
```

### Create Shot

```http
POST /api/shots
```

**Body:**

```json
{
  "userId": 1,
  "clubId": 2,
  "roundId": 1, // Optional
  "startLatitude": 39.8283,
  "startLongitude": -74.9872,
  "startAltitude": 100, // Optional
  "endLatitude": 39.829,
  "endLongitude": -74.987,
  "endAltitude": 105, // Optional
  "carryDistance": 150.5,
  "totalDistance": 155.0,
  "elevationChange": 5.0,
  "dispersion": -2.3 // Optional
}
```

**Response:** Created shot object

**Notes:**

- All distances in meters
- Negative dispersion = left, positive = right
- Elevation change: positive = uphill

### Delete Shot

```http
DELETE /api/shots/:id
```

**Response:** `204 No Content`

---

## 🏏 Clubs

### List Clubs

```http
GET /api/clubs
```

**Response:**

```json
[
  {
    "id": 1,
    "userId": 1,
    "name": "Driver",
    "avgDistance": 250.5,
    "createdAt": "2024-05-14T10:00:00.000Z"
  }
]
```

### Create Club

```http
POST /api/clubs
```

**Body:**

```json
{
  "userId": 1,
  "name": "9 Iron",
  "avgDistance": 130.0 // Optional, in meters
}
```

**Response:** Created club object

### Update Club

```http
PUT /api/clubs/:id
```

**Body:**

```json
{
  "name": "9 Iron Pro",
  "avgDistance": 135.0
}
```

**Response:** Updated club object

### Delete Club

```http
DELETE /api/clubs/:id
```

**Response:** `204 No Content`

**Note:** Deletes all associated shots!

### Get Club Analytics

```http
GET /api/clubs/:id/analytics
```

**Response:**

```json
{
  "clubId": 1,
  "clubName": "Driver",
  "totalShots": 45,
  "avgDistance": 250.5,
  "minDistance": 220.0,
  "maxDistance": 280.0,
  "stdDeviation": 15.2,
  "avgDispersion": -1.5,
  "consistency": 0.85,
  "recentShots": [
    {
      "id": 123,
      "carryDistance": 255.0,
      "dispersion": -2.0,
      "timestamp": "2024-05-14T14:30:00.000Z"
    }
  ]
}
```

**Notes:**

- `avgDispersion`: Negative = left bias, positive = right bias
- `consistency`: 0-1 score (higher = more consistent)
- `recentShots`: Last 10 shots with this club

---

## 📊 Data Models

### Course

```typescript
{
  id: number
  name: string
  city: string
  state: string
  holes: Hole[]
}
```

### Hole

```typescript
{
  id: number
  courseId: number
  number: number              // 1-18
  par: number                 // 3, 4, or 5
  yardage: number
  name: string?
  teeBoxPolygon: Coordinate[]
  fairwayPolygon: Coordinate[]?
  greenPolygon: Coordinate[]
  greenElevation: number?     // meters
}
```

### Coordinate

```typescript
{
  latitude: number;
  longitude: number;
}
```

### Round

```typescript
{
  id: number
  userId: number
  courseId: number
  startTime: DateTime
  endTime: DateTime?
  isComplete: boolean
  roundHoles: RoundHole[]
  course: Course
}
```

### RoundHole

```typescript
{
  id: number;
  roundId: number;
  holeNumber: number;
  strokes: number;
  putts: number;
}
```

### Shot

```typescript
{
  id: number;
  userId: number;
  clubId: number;
  roundId: number ? startLatitude : number;
  startLongitude: number;
  startAltitude: number ? endLatitude : number;
  endLongitude: number;
  endAltitude: number ? carryDistance : number; // meters
  totalDistance: number; // meters
  elevationChange: number // meters
    ? dispersion
    : number // meters
      ? timestamp
      : DateTime;
  club: Club;
}
```

### Club

```typescript
{
  id: number;
  userId: number;
  name: string;
  avgDistance: number // meters
    ? createdAt
    : DateTime;
}
```

---

## 🔒 Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Status Codes:**

- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## 🧪 Testing with curl

### Create a complete round flow:

```bash
# 1. Get available courses
curl http://localhost:3000/api/courses

# 2. Start a round
curl -X POST http://localhost:3000/api/rounds \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "courseId": 1}'

# 3. Update hole 1 score
curl -X PUT http://localhost:3000/api/rounds/1/holes/1 \
  -H "Content-Type: application/json" \
  -d '{"strokes": 5, "putts": 2}'

# 4. Record a shot
curl -X POST http://localhost:3000/api/shots \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "clubId": 1,
    "roundId": 1,
    "startLatitude": 39.8283,
    "startLongitude": -74.9872,
    "endLatitude": 39.8290,
    "endLongitude": -74.9870,
    "carryDistance": 250
  }'

# 5. Complete the round
curl -X POST http://localhost:3000/api/rounds/1/complete
```

---

## 🚀 Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- Exceeding limit returns `429 Too Many Requests`

---

## 📝 Notes

- All dates are in ISO 8601 format (UTC)
- Distances are in meters (convert to yards in frontend)
- Coordinates use WGS84 datum (standard GPS)
- User authentication not yet implemented (uses userId=1)

---

For implementation details, see the source code in `/backend/src/routes/`
