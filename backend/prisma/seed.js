/** @format */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create sample user
  const user = await prisma.user.upsert({
    where: { email: "demo@golfgo.app" },
    update: {},
    create: {
      email: "demo@golfgo.app",
      name: "Demo User",
    },
  });

  console.log("✅ Created user:", user.name);

  // Create sample course with holes
  const course = await prisma.course.create({
    data: {
      name: "Pine Valley Golf Club",
      location: "Pine Valley, NJ",
      description: "Championship golf course",
      par: 72,
      holes: {
        create: [
          {
            holeNumber: 1,
            par: 4,
            distance: 427,
            pinLat: 39.8295,
            pinLng: -74.9855,
            teeBoxPolygon: JSON.stringify([
              { latitude: 39.8283, longitude: -74.9872 },
              { latitude: 39.8284, longitude: -74.9872 },
              { latitude: 39.8284, longitude: -74.9871 },
              { latitude: 39.8283, longitude: -74.9871 },
            ]),
            fairwayPolygon: JSON.stringify([
              { latitude: 39.8285, longitude: -74.987 },
              { latitude: 39.829, longitude: -74.987 },
              { latitude: 39.829, longitude: -74.986 },
              { latitude: 39.8285, longitude: -74.986 },
            ]),
            greenPolygon: JSON.stringify([
              { latitude: 39.8295, longitude: -74.9855 },
              { latitude: 39.8296, longitude: -74.9855 },
              { latitude: 39.8296, longitude: -74.9854 },
              { latitude: 39.8295, longitude: -74.9854 },
            ]),
            greenElevation: 100,
          },
          {
            holeNumber: 2,
            par: 3,
            distance: 185,
            pinLat: 39.8305,
            pinLng: -74.985,
            teeBoxPolygon: JSON.stringify([
              { latitude: 39.8297, longitude: -74.9853 },
              { latitude: 39.8298, longitude: -74.9853 },
              { latitude: 39.8298, longitude: -74.9852 },
              { latitude: 39.8297, longitude: -74.9852 },
            ]),
            greenPolygon: JSON.stringify([
              { latitude: 39.8305, longitude: -74.985 },
              { latitude: 39.8306, longitude: -74.985 },
              { latitude: 39.8306, longitude: -74.9849 },
              { latitude: 39.8305, longitude: -74.9849 },
            ]),
            greenElevation: 105,
          },
          {
            holeNumber: 3,
            par: 4,
            distance: 395,
            pinLat: 39.8315,
            pinLng: -74.9842,
            teeBoxPolygon: JSON.stringify([
              { latitude: 39.8307, longitude: -74.9848 },
              { latitude: 39.8308, longitude: -74.9848 },
              { latitude: 39.8308, longitude: -74.9847 },
              { latitude: 39.8307, longitude: -74.9847 },
            ]),
            greenPolygon: JSON.stringify([
              { latitude: 39.8315, longitude: -74.9842 },
              { latitude: 39.8316, longitude: -74.9842 },
              { latitude: 39.8316, longitude: -74.9841 },
              { latitude: 39.8315, longitude: -74.9841 },
            ]),
            greenElevation: 98,
          },
        ],
      },
    },
    include: {
      holes: true,
    },
  });

  console.log(
    `✅ Created course: ${course.name} with ${course.holes.length} holes`,
  );

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
        name: "7 Iron",
        type: "iron",
        userId: user.id,
        avgDistance: 150,
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
  ]);

  console.log(`✅ Created ${clubs.length} clubs`);

  // Create a sample round
  const round = await prisma.round.create({
    data: {
      userId: user.id,
      courseId: course.id,
      roundHoles: {
        create: course.holes.map((hole) => ({
          holeId: hole.id,
          holeNumber: hole.holeNumber,
          score: hole.par,
          putts: 2,
        })),
      },
    },
    include: {
      roundHoles: true,
    },
  });

  console.log(`✅ Created sample round with ${round.roundHoles.length} holes`);

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
