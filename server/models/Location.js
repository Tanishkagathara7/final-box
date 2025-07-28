import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // cityId
  name: { type: String, required: true },
  state: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  popular: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Location", locationSchema); 