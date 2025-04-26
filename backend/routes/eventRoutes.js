import express from "express";
import { createEvent, getEvents } from "../controllers/eventController.js";
import verifyToken, { isAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

// Only admins can create events
router.post("/event", verifyToken, isAdmin, createEvent);
router.post("/create-event", verifyToken, isAdmin, createEvent);

// Everyone can view events
router.get("/", getEvents);

export default router;
