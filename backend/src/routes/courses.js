/** @format */

const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET all courses
router.get("/", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        holes: {
          orderBy: { holeNumber: "asc" },
        },
      },
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single course by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        holes: {
          orderBy: { holeNumber: "asc" },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new course
router.post("/", async (req, res) => {
  try {
    const { name, location, description, par, holes } = req.body;

    const course = await prisma.course.create({
      data: {
        name,
        location,
        description,
        par,
        holes: {
          create: holes,
        },
      },
      include: {
        holes: true,
      },
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update course
router.put("/:id", async (req, res) => {
  try {
    const { name, location, description, par } = req.body;

    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: { name, location, description, par },
    });

    res.json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET holes for a course
router.get("/:id/holes", async (req, res) => {
  try {
    const holes = await prisma.hole.findMany({
      where: { courseId: req.params.id },
      orderBy: { holeNumber: "asc" },
    });
    res.json(holes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update hole geometry
router.put("/:courseId/holes/:holeNumber", async (req, res) => {
  try {
    const { courseId, holeNumber } = req.params;
    const { teeBoxPolygon, fairwayPolygon, greenPolygon, pinLat, pinLng } =
      req.body;

    const hole = await prisma.hole.updateMany({
      where: {
        courseId,
        holeNumber: parseInt(holeNumber),
      },
      data: {
        teeBoxPolygon,
        fairwayPolygon,
        greenPolygon,
        pinLat,
        pinLng,
      },
    });

    res.json(hole);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
