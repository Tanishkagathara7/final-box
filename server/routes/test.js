import express from "express";

const router = express.Router();

// Simple test endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "BoxCric API is working!",
    timestamp: new Date().toISOString(),
    grounds: {
      mumbai: 3,
      delhi: 3,
      total: 6,
    },
  });
});

export default router;
