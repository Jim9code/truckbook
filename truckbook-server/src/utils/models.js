import db from '../models/index.js';

// Cache for loaded models
let modelsCache = null;

// Get models - ensures they're loaded
export const getModels = async () => {
  if (!modelsCache) {
    modelsCache = await db;
  }
  return modelsCache;
};

