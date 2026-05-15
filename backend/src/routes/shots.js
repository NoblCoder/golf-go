/** @format */

const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET shots for a round
router.get("/", async (req, res) => {
  try {
    const { roundId, clubId, holeNumber } = req.query;

    const where = {};
    if (roundId) where.roundId = roundId;
    if (clubId) where.clubId = clubId;
    if (holeNumber) where.holeNumber = parseInt(holeNumber);

    const shots = await prisma.shot.findMany({
      where,
      include: {
        club: true,
      },
      orderBy: { startTimestamp: "asc" },
    });

    res.json(shots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single shot by ID
router.get("/:id", async (req, res) => {
  try {
    const shot = await prisma.shot.findUnique({
      where: { id: req.params.id },
      include: {
        club: true,
        round: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!shot) {
      return res.status(404).json({ error: "Shot not found" });
    }

    res.json(shot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new shot
router.post("/", async (req, res) => {
  try {
    const {
      roundId,
      holeNumber,
      clubId,
      startLat,
      startLng,
      startElevation,
      startAccuracy,
      startTimestamp,
      endLat,
      endLng,
      endElevation,
      endAccuracy,
      endTimestamp,
      carryDistance,
      totalDistance,
      lateralDist,
      elevationChange,
      shotType,
      shotTag,
      notes,
    } = req.body;

    const shot = await prisma.shot.create({
      data: {
        roundId,
        holeNumber,
        clubId,
        startLat,
        startLng,
        startElevation,
        startAccuracy,
        startTimestamp: new Date(startTimestamp),
        endLat,
        endLng,
        endElevation,
        endAccuracy,
        endTimestamp: new Date(endTimestamp),
        carryDistance,
        totalDistance,
        lateralDist,
        elevationChange,
        shotType,
        shotTag,
        notes,
      },
      include: {
        club: true,
      },
    });

    res.status(201).json(shot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST batch create shots (for sync)
router.post("/batch", async (req, res) => {
  try {
    const { shots } = req.body;

    const createdShots = await prisma.shot.createMany({
      data: shots.map((shot) => ({
        ...shot,
        startTimestamp: new Date(shot.startTimestamp),
        endTimestamp: new Date(shot.endTimestamp),
      })),
    });

    res.status(201).json({ count: createdShots.count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update shot
router.put("/:id", async (req, res) => {
  try {
    const { clubId, shotType, shotTag, notes } = req.body;

    const shot = await prisma.shot.update({
      where: { id: req.params.id },
      data: { clubId, shotType, shotTag, notes },
    });

    res.json(shot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE shot
router.delete("/:id", async (req, res) => {
  try {
    await prisma.shot.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
