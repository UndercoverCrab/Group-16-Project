import express from "express";
import { createEvent, getEvents } from "../controllers/eventController.js";

const router = express.Router();

router.post("/create-event", createEvent);
router.get("/", getEvents);

export default router;
