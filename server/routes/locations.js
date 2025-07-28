import express from "express";
import Location from "../models/Location.js";

const adminRouter = express.Router();

// Simple admin auth middleware
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  next();
};

// GET /api/admin/locations - get all locations
adminRouter.get("/", adminAuth, async (req, res) => {
  try {
    const locations = await Location.find({});
    res.json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ success: false, message: "Failed to fetch locations" });
  }
});

// POST /api/admin/locations - create new location
adminRouter.post("/", adminAuth, async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.json(location);
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/admin/locations/:id - update location
adminRouter.put("/:id", adminAuth, async (req, res) => {
  try {
    const location = await Location.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(location);
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/admin/locations/:id - delete location
adminRouter.delete("/:id", adminAuth, async (req, res) => {
  try {
    await Location.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(400).json({ message: error.message });
  }
});

export { adminRouter }; 