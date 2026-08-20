const express = require("express");

const router = express.Router();

const concertController = require("../controllers/concertController");

// GET semua concert
router.get("/", concertController.getAllConcerts);

// GET concert berdasarkan ID
router.get("/:id", concertController.getConcertById);

// POST concert
router.post("/", concertController.createConcert);

// PUT concert
router.put("/:id", concertController.updateConcert);

// DELETE concert
router.delete("/:id", concertController.deleteConcert);

module.exports = router;