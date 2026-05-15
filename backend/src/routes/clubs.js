/** @format */

const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET all clubs for a user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const clubs = await prisma.club.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single club by ID
router.get("/:id", async (req, res) => {
  try {
    const club = await prisma.club.findUnique({
      where: { id: req.params.id },
    });

    if (!club) {
      return res.status(404).json({ error: "Club not found" });
    }

    res.json(club);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET club analytics
router.get("/:id/analytics", async (req, res) => {
  try {
    const { id } = req.params;

    const shots = await prisma.shot.findMany({
      where: { clubId: id },
      select: {
        totalDistance: true,
        lateralDist: true,
        carryDistance: true,
      },
    });

    if (shots.length === 0) {
      return res.json({
        totalShots: 0,
        avgDistance: 0,
        avgCarry: 0,
        stdDeviation: 0,
        dispersion: { left: 0, right: 0 },
      });
    }

    // Calculate average distance
    const avgDistance =
      shots.reduce((sum, s) => sum + (s.totalDistance || 0), 0) / shots.length;
    const avgCarry =
      shots.reduce((sum, s) => sum + (s.carryDistance || 0), 0) / shots.length;

    // Calculate standard deviation
    const variance =
      shots.reduce((sum, s) => {
        const diff = (s.totalDistance || 0) - avgDistance;
        return sum + diff * diff;
      }, 0) / shots.length;
    const stdDeviation = Math.sqrt(variance);

    // Calculate dispersion
    const leftShots = shots.filter((s) => (s.lateralDist || 0) < 0);
    const rightShots = shots.filter((s) => (s.lateralDist || 0) > 0);

    const avgLeft =
      leftShots.length > 0
        ? Math.abs(
            leftShots.reduce((sum, s) => sum + s.lateralDist, 0) /
              leftShots.length,
          )
        : 0;
    const avgRight =
      rightShots.length > 0
        ? rightShots.reduce((sum, s) => sum + s.lateralDist, 0) /
          rightShots.length
        : 0;

    res.json({
      totalShots: shots.length,
      avgDistance,
      avgCarry,
      stdDeviation,
      dispersion: {
        left: avgLeft,
        right: avgRight,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new club
router.post("/", async (req, res) => {
  try {
    const { userId, name, type, loft, brand, model } = req.body;

    const club = await prisma.club.create({
      data: {
        userId,
        name,
        type,
        loft,
        brand,
        model,
      },
    });

    res.status(201).json(club);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update club
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      type,
      loft,
      brand,
      model,
      avgDistance,
      stdDeviation,
      totalShots,
    } = req.body;

    const club = await prisma.club.update({
      where: { id: req.params.id },
      data: {
        name,
        type,
        loft,
        brand,
        model,
        avgDistance,
        stdDeviation,
        totalShots,
      },
    });

    res.json(club);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE club
router.delete("/:id", async (req, res) => {
  try {
    await prisma.club.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
