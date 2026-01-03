// Utility functions for handling avatar images
const fs = require('fs');
const path = require('path');

// Get default avatar (returns base64 or path)
const getDefaultAvatar = () => {
  return '/img/user.png';
};

// Convert file to base64
const fileToBase64 = (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return fileBuffer.toString('base64');
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};

// Convert base64 to buffer
const base64ToBuffer = (base64String) => {
  return Buffer.from(base64String, 'base64');
};

// Save base64 image
const saveBase64Image = (base64String, outputPath) => {
  try {
    const buffer = Buffer.from(base64String, 'base64');
    const dir = path.dirname(outputPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, buffer);
    return true;
  } catch (error) {
    console.error('Error saving image:', error);
    return false;
  }
};

module.exports = {
  getDefaultAvatar,
  fileToBase64,
  base64ToBuffer,
  saveBase64Image,
};
