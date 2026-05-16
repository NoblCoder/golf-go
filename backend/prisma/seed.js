/** @format */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper to generate GPS polygons for holes
function generateHolePolygons(baseLat, baseLng, holeNumber, distance) {
  const offset = (holeNumber - 1) * 0.002; // Offset holes by ~200m
  const distanceInDegrees = distance * 0.000009; // Convert yards to rough degrees

  return {
    pinLat: baseLat + offset + distanceInDegrees,
    pinLng: baseLng,
    teeBoxPolygon: JSON.stringify([
      { latitude: baseLat + offset, longitude: baseLng - 0.00005 },
      { latitude: baseLat + offset + 0.0001, longitude: baseLng - 0.00005 },
      { latitude: baseLat + offset + 0.0001, longitude: baseLng + 0.00005 },
      { latitude: baseLat + offset, longitude: baseLng + 0.00005 },
    ]),
    fairwayPolygon: JSON.stringify([
      { latitude: baseLat + offset + 0.0002, longitude: baseLng - 0.0001 },
      {
        latitude: baseLat + offset + distanceInDegrees - 0.0002,
        longitude: baseLng - 0.0001,
      },
      {
        latitude: baseLat + offset + distanceInDegrees - 0.0002,
        longitude: baseLng + 0.0001,
      },
      { latitude: baseLat + offset + 0.0002, longitude: baseLng + 0.0001 },
    ]),
    greenPolygon: JSON.stringify([
      {
        latitude: baseLat + offset + distanceInDegrees,
        longitude: baseLng - 0.00005,
      },
      {
        latitude: baseLat + offset + distanceInDegrees + 0.0001,
        longitude: baseLng - 0.00005,
      },
      {
        latitude: baseLat + offset + distanceInDegrees + 0.0001,
        longitude: baseLng + 0.00005,
      },
      {
        latitude: baseLat + offset + distanceInDegrees,
        longitude: baseLng + 0.00005,
      },
    ]),
  };
}

// Famous US Golf Courses
const courses = [
  {
    name: "Augusta National Golf Club",
    location: "Augusta, GA",
    description: "Home of The Masters Tournament",
    par: 72,
    baseLat: 33.503,
    baseLng: -82.02,
    holes: [
      { number: 1, par: 4, distance: 445 },
      { number: 2, par: 5, distance: 575 },
      { number: 3, par: 4, distance: 350 },
    ],
  },
  {
    name: "Pebble Beach Golf Links",
    location: "Pebble Beach, CA",
    description: "Iconic oceanside course on the Monterey Peninsula",
    par: 72,
    baseLat: 36.5674,
    baseLng: -121.95,
    holes: [
      { number: 1, par: 4, distance: 380 },
      { number: 2, par: 5, distance: 502 },
      { number: 3, par: 4, distance: 390 },
    ],
  },
  {
    name: "Pinehurst No. 2",
    location: "Pinehurst, NC",
    description: "Donald Ross masterpiece, host of multiple U.S. Opens",
    par: 72,
    baseLat: 35.19,
    baseLng: -79.47,
    holes: [
      { number: 1, par: 4, distance: 420 },
      { number: 2, par: 4, distance: 450 },
      { number: 3, par: 4, distance: 335 },
    ],
  },
  {
    name: "Bethpage Black",
    location: "Farmingdale, NY",
    description: "Challenging public course, host of major championships",
    par: 71,
    baseLat: 40.745,
    baseLng: -73.455,
    holes: [
      { number: 1, par: 4, distance: 430 },
      { number: 2, par: 4, distance: 389 },
      { number: 3, par: 3, distance: 210 },
    ],
  },
  {
    name: "Torrey Pines (South)",
    location: "La Jolla, CA",
    description: "Municipal masterpiece overlooking the Pacific",
    par: 72,
    baseLat: 32.895,
    baseLng: -117.25,
    holes: [
      { number: 1, par: 4, distance: 450 },
      { number: 2, par: 4, distance: 390 },
      { number: 3, par: 3, distance: 200 },
    ],
  },
  {
    name: "TPC Sawgrass (Stadium)",
    location: "Ponte Vedra Beach, FL",
    description: "Home of THE PLAYERS Championship and the famous island green",
    par: 72,
    baseLat: 30.198,
    baseLng: -81.395,
    holes: [
      { number: 1, par: 4, distance: 423 },
      { number: 2, par: 5, distance: 532 },
      { number: 3, par: 3, distance: 177 },
    ],
  },
  {
    name: "Kiawah Island (Ocean Course)",
    location: "Kiawah Island, SC",
    description: "Pete Dye's seaside masterpiece",
    par: 72,
    baseLat: 32.61,
    baseLng: -80.085,
    holes: [
      { number: 1, par: 4, distance: 395 },
      { number: 2, par: 5, distance: 543 },
      { number: 3, par: 4, distance: 390 },
    ],
  },
  {
    name: "Oakmont Country Club",
    location: "Oakmont, PA",
    description: "Historic championship course with lightning-fast greens",
    par: 71,
    baseLat: 40.521,
    baseLng: -79.845,
    holes: [
      { number: 1, par: 4, distance: 482 },
      { number: 2, par: 4, distance: 341 },
      { number: 3, par: 4, distance: 428 },
    ],
  },
  {
    name: "Whistling Straits",
    location: "Sheboygan, WI",
    description: "Links-style course on Lake Michigan",
    par: 72,
    baseLat: 43.885,
    baseLng: -87.695,
    holes: [
      { number: 1, par: 4, distance: 423 },
      { number: 2, par: 5, distance: 584 },
      { number: 3, par: 4, distance: 390 },
    ],
  },
  {
    name: "Shinnecock Hills",
    location: "Southampton, NY",
    description: "One of America's oldest clubs, frequent U.S. Open host",
    par: 70,
    baseLat: 40.89,
    baseLng: -72.455,
    holes: [
      { number: 1, par: 4, distance: 393 },
      { number: 2, par: 4, distance: 226 },
      { number: 3, par: 4, distance: 478 },
    ],
  },
  {
    name: "Chambers Bay",
    location: "University Place, WA",
    description: "Modern links-style course in the Pacific Northwest",
    par: 72,
    baseLat: 47.21,
    baseLng: -122.575,
    holes: [
      { number: 1, par: 4, distance: 417 },
      { number: 2, par: 4, distance: 452 },
      { number: 3, par: 3, distance: 207 },
    ],
  },
  {
    name: "Bandon Dunes",
    location: "Bandon, OR",
    description: "True links golf on the Oregon coast",
    par: 72,
    baseLat: 43.12,
    baseLng: -124.42,
    holes: [
      { number: 1, par: 4, distance: 417 },
      { number: 2, par: 4, distance: 353 },
      { number: 3, par: 3, distance: 163 },
    ],
  },
  {
    name: "Spyglass Hill",
    location: "Pebble Beach, CA",
    description:
      "Challenging course named after Robert Louis Stevenson's novel",
    par: 72,
    baseLat: 36.582,
    baseLng: -121.96,
    holes: [
      { number: 1, par: 5, distance: 595 },
      { number: 2, par: 4, distance: 350 },
      { number: 3, par: 4, distance: 152 },
    ],
  },
  {
    name: "Merion Golf Club (East)",
    location: "Ardmore, PA",
    description: "Historic Hugh Wilson design without a single par 5",
    par: 70,
    baseLat: 40.005,
    baseLng: -75.31,
    holes: [
      { number: 1, par: 4, distance: 362 },
      { number: 2, par: 5, distance: 556 },
      { number: 3, par: 3, distance: 183 },
    ],
  },
  {
    name: "Congressional Country Club",
    location: "Bethesda, MD",
    description: "Home to multiple major championships",
    par: 72,
    baseLat: 39.015,
    baseLng: -77.085,
    holes: [
      { number: 1, par: 5, distance: 560 },
      { number: 2, par: 4, distance: 389 },
      { number: 3, par: 4, distance: 213 },
    ],
  },
  {
    name: "Shadow Creek",
    location: "Las Vegas, NV",
    description: "Desert oasis designed by Tom Fazio",
    par: 72,
    baseLat: 36.18,
    baseLng: -114.99,
    holes: [
      { number: 1, par: 4, distance: 391 },
      { number: 2, par: 3, distance: 203 },
      { number: 3, par: 4, distance: 475 },
    ],
  },
  {
    name: "Prairie Dunes Country Club",
    location: "Hutchinson, KS",
    description: "Links-style course in the Kansas prairie",
    par: 70,
    baseLat: 38.065,
    baseLng: -97.905,
    holes: [
      { number: 1, par: 4, distance: 428 },
      { number: 2, par: 5, distance: 596 },
      { number: 3, par: 4, distance: 373 },
    ],
  },
  {
    name: "Harbour Town Golf Links",
    location: "Hilton Head Island, SC",
    description: "Pete Dye design, home of the RBC Heritage",
    par: 71,
    baseLat: 32.13,
    baseLng: -80.805,
    holes: [
      { number: 1, par: 4, distance: 410 },
      { number: 2, par: 5, distance: 502 },
      { number: 3, par: 4, distance: 436 },
    ],
  },
  {
    name: "Winged Foot (West)",
    location: "Mamaroneck, NY",
    description: "Tillinghast masterpiece known for its difficulty",
    par: 72,
    baseLat: 40.95,
    baseLng: -73.745,
    holes: [
      { number: 1, par: 4, distance: 446 },
      { number: 2, par: 4, distance: 474 },
      { number: 3, par: 3, distance: 216 },
    ],
  },
  {
    name: "Pasatiempo Golf Club",
    location: "Santa Cruz, CA",
    description: "Alister MacKenzie design with stunning views",
    par: 72,
    baseLat: 36.985,
    baseLng: -122.065,
    holes: [
      { number: 1, par: 4, distance: 401 },
      { number: 2, par: 4, distance: 348 },
      { number: 3, par: 3, distance: 222 },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database with US golf courses...");

  // Clear existing data
  await prisma.shot.deleteMany({});
  await prisma.roundHole.deleteMany({});
  await prisma.round.deleteMany({});
  await prisma.club.deleteMany({});
  await prisma.hole.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  // Create sample user with fixed ID for development
  const user = await prisma.user.create({
    data: {
      id: "00000000-0000-0000-0000-000000000001",
      email: "demo@golfgo.app",
      name: "Demo User",
    },
  });

  console.log("✅ Created user:", user.name);

  // Create all courses
  let courseCount = 0;
  for (const courseData of courses) {
    const holes = courseData.holes.map((hole) => {
      const polygons = generateHolePolygons(
        courseData.baseLat,
        courseData.baseLng,
        hole.number,
        hole.distance,
      );

      return {
        holeNumber: hole.number,
        par: hole.par,
        distance: hole.distance,
        ...polygons,
        greenElevation: 100 + Math.floor(Math.random() * 50),
      };
    });

    await prisma.course.create({
      data: {
        name: courseData.name,
        location: courseData.location,
        description: courseData.description,
        par: courseData.par,
        holes: {
          create: holes,
        },
      },
    });

    courseCount++;
    console.log(`✅ Created: ${courseData.name}`);
  }

  console.log(`\n✅ Created ${courseCount} courses across the United States`);

  // Create sample clubs
  const clubs = await Promise.all([
    prisma.club.create({
      data: {
        name: "Driver",
        type: "driver",
        userId: user.id,
        avgDistance: 250,
      },
    }),
    prisma.club.create({
      data: {
        name: "3 Wood",
        type: "wood",
        userId: user.id,
        avgDistance: 230,
      },
    }),
    prisma.club.create({
      data: {
        name: "5 Iron",
        type: "iron",
        userId: user.id,
        avgDistance: 180,
      },
    }),
    prisma.club.create({
      data: {
        name: "7 Iron",
        type: "iron",
        userId: user.id,
        avgDistance: 150,
      },
    }),
    prisma.club.create({
      data: {
        name: "9 Iron",
        type: "iron",
        userId: user.id,
        avgDistance: 130,
      },
    }),
    prisma.club.create({
      data: {
        name: "Pitching Wedge",
        type: "wedge",
        userId: user.id,
        avgDistance: 120,
      },
    }),
    prisma.club.create({
      data: {
        name: "Sand Wedge",
        type: "wedge",
        userId: user.id,
        avgDistance: 90,
      },
    }),
    prisma.club.create({
      data: {
        name: "Putter",
        type: "putter",
        userId: user.id,
        avgDistance: 0,
      },
    }),
  ]);

  console.log(`✅ Created ${clubs.length} clubs`);

  console.log("\n🎉 Seeding complete!");
  console.log(`📍 ${courseCount} golf courses ready to play!`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
