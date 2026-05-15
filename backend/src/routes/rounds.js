/** @format */

const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET all rounds for a user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    const rounds = await prisma.round.findMany({
      where: userId ? { userId } : {},
      include: {
        course: true,
        roundHoles: {
          orderBy: { holeNumber: "asc" },
          include: {
            hole: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    res.json(rounds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single round by ID
router.get("/:id", async (req, res) => {
  try {
    const round = await prisma.round.findUnique({
      where: { id: req.params.id },
      include: {
        course: {
          include: {
            holes: {
              orderBy: { holeNumber: "asc" },
            },
          },
        },
        roundHoles: {
          orderBy: { holeNumber: "asc" },
          include: {
            hole: true,
          },
        },
        shots: {
          orderBy: { startTimestamp: "asc" },
        },
      },
    });

    if (!round) {
      return res.status(404).json({ error: "Round not found" });
    }

    res.json(round);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new round
router.post("/", async (req, res) => {
  try {
    const { userId, courseId, weather, notes } = req.body;

    // Get all holes for the course
    const holes = await prisma.hole.findMany({
      where: { courseId },
      orderBy: { holeNumber: "asc" },
    });

    // Create round with RoundHole entries for each hole
    const round = await prisma.round.create({
      data: {
        userId,
        courseId,
        weather,
        notes,
        roundHoles: {
          create: holes.map((hole) => ({
            holeId: hole.id,
            holeNumber: hole.holeNumber,
          })),
        },
      },
      include: {
        course: true,
        roundHoles: {
          include: {
            hole: true,
          },
          orderBy: { holeNumber: "asc" },
        },
      },
    });

    res.status(201).json(round);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update round
router.put("/:id", async (req, res) => {
  try {
    const { completedAt, totalScore, weather, notes } = req.body;

    const round = await prisma.round.update({
      where: { id: req.params.id },
      data: { completedAt, totalScore, weather, notes },
    });

    res.json(round);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH update hole score
router.patch("/:roundId/holes/:holeNumber", async (req, res) => {
  try {
    const { roundId, holeNumber } = req.params;
    const { score, putts, fairwayHit, greenInReg, completedAt } = req.body;

    const roundHole = await prisma.roundHole.updateMany({
      where: {
        roundId,
        holeNumber: parseInt(holeNumber),
      },
      data: {
        score,
        putts,
        fairwayHit,
        greenInReg,
        completedAt,
      },
    });

    // Recalculate total score
    const allHoles = await prisma.roundHole.findMany({
      where: { roundId },
    });

    const totalScore = allHoles.reduce(
      (sum, hole) => sum + (hole.score || 0),
      0,
    );

    await prisma.round.update({
      where: { id: roundId },
      data: { totalScore },
    });

    res.json(roundHole);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE round
router.delete("/:id", async (req, res) => {
  try {
    await prisma.round.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
