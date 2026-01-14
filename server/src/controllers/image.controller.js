const Image = require("../models/Image");
const sharp = require("sharp");
const fs = require("fs").promises;
const logger = require("../utils/logger");
let uuidv4;

// Dynamically import uuid for ESM compatibility
import("uuid").then((mod) => {
  uuidv4 = mod.v4;
});
const path = require("path");

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(err => {
  logger.error('Failed to create uploads directory', err);
});

class ImageController {
  // Upload single
  static async uploadSingle(req, res) {
    try {
      if (!req.file)
        return res.status(400).json({ success: false, message: "No file" });

      const { imageType, associatedId, associatedModel } = req.body;
      if (!["profile", "part", "project", "post", "other"].includes(imageType))
        return res
          .status(400)
          .json({ success: false, message: "Invalid imageType" });

      let buffer = req.file.buffer;
      let mimetype = req.file.mimetype;

      try {
        const meta = await sharp(buffer).metadata();
        let s = sharp(buffer);
        if (meta.width > 1920 || meta.height > 1920) {
          s = s.resize(1920, 1920, { fit: "inside", withoutEnlargement: true });
        }
        if (mimetype === "image/jpeg")
          buffer = await s.jpeg({ quality: 85 }).toBuffer();
        else if (mimetype === "image/png")
          buffer = await s.png({ compressionLevel: 8 }).toBuffer();
        else buffer = await s.toBuffer();
      } catch (err) {
        logger.error('Image optimization failed, using original:', err);
      }

      // Get original filename without extension
      const originalNameWithoutExt = path.parse(req.file.originalname).name;
      // Get extension from original file
      const ext = path.extname(req.file.originalname);
      // Add timestamp prefix to avoid conflicts while keeping original name
      const filename = `${Date.now()}_${originalNameWithoutExt}${ext}`;

      // Save to filesystem
      const filePath = path.join(UPLOADS_DIR, filename);
      try {
        await fs.writeFile(filePath, buffer);
        logger.info(`File saved to filesystem: ${filePath}`);
      } catch (error) {
        logger.error('Error saving file to filesystem', error);
        return res.status(500).json({
          success: false,
          message: "Failed to save file to filesystem",
        });
      }

      let image;
      try {
        image = await Image.create({
          filename,
          originalname: req.file.originalname,
          mimetype,
          size: buffer.length,
          data: buffer,
          filePath, // Store the file path in database
          imageType,
          associatedId: associatedId || null,
          associatedModel: associatedModel || null,
          uploadedBy: req.user.id,
        });
      } catch (error) {
        logger.error('Error saving to database', error);
        // Try to clean up file if database save fails
        try {
          await fs.unlink(filePath);
        } catch (unlinkError) {
          logger.error(
            "Error cleaning up file after failed db save:",
            unlinkError
          );
        }
        return res
          .status(500)
          .json({ success: false, message: "Failed to save to database" });
      }

      res.status(201).json({
        success: true,
        data: { _id: image._id, url: `/api/images/${image._id}` },
      });
    } catch (err) {
      logger.logError(err, { context: 'uploadSingle' });
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  }

  // Get image by ID
  static async getImage(req, res) {
    try {
      const image = await Image.findById(req.params.id);
      if (!image)
        return res.status(404).json({ success: false, message: "Not found" });

      // Try to serve from filesystem first
      const filePath = path.join(UPLOADS_DIR, image.filename);
      try {
        await fs.access(filePath);
        res.set({ "Content-Type": image.mimetype });
        res.sendFile(filePath);
      } catch {
        // Fallback to database if file doesn't exist in filesystem
        res.set({
          "Content-Type": image.mimetype,
          "Content-Length": image.size,
        });
        res.send(image.data);
      }
    } catch (err) {
      logger.logError(err, { context: 'getImageById', imageId: req.params.id });
      res.status(500).json({ success: false, message: "Error retrieving" });
    }
  }

  // NEW: Get image by associated entity
  static async getImageByAssociation(req, res) {
    try {
      const { associatedId, imageType } = req.params;
      
      const image = await Image.findOne({
        associatedId,
        imageType,
        isActive: true
      }).sort({ createdAt: -1 }); // Get the most recent image
      
      if (!image) {
        return res.status(404).json({ success: false, message: "No image found" });
      }

      // Try to serve from filesystem first
      const filePath = path.join(UPLOADS_DIR, image.filename);
      try {
        await fs.access(filePath);
        res.set({ "Content-Type": image.mimetype });
        res.sendFile(filePath);
      } catch {
        // Fallback to database if file doesn't exist in filesystem
        res.set({
          "Content-Type": image.mimetype,
          "Content-Length": image.size,
        });
        res.send(image.data);
      }
    } catch (err) {
      logger.logError(err, {
        context: 'getImageByAssociation',
        model: req.params.model,
        id: req.params.id
      });
      res.status(500).json({ success: false, message: "Error retrieving image" });
    }
  }

  // Get thumbnail
  static async getThumbnail(req, res) {
    try {
      const image = await Image.findById(req.params.id);
      if (!image)
        return res.status(404).json({ success: false, message: "Not found" });

      const thumb = await sharp(image.data)
        .resize(
          parseInt(req.query.width || 150),
          parseInt(req.query.height || 150)
        )
        .jpeg({ quality: 80 })
        .toBuffer();

      res.set({ "Content-Type": "image/jpeg", "Content-Length": thumb.length });
      res.send(thumb);
    } catch {
      res.status(500).json({ success: false, message: "Thumbnail error" });
    }
  }

  // NEW: Get thumbnail by association
  static async getThumbnailByAssociation(req, res) {
    try {
      const { associatedId, imageType } = req.params;
      
      const image = await Image.findOne({
        associatedId,
        imageType,
        isActive: true
      }).sort({ createdAt: -1 });
      
      if (!image) {
        return res.status(404).json({ success: false, message: "No image found" });
      }

      const thumb = await sharp(image.data)
        .resize(
          parseInt(req.query.width || 150),
          parseInt(req.query.height || 150)
        )
        .jpeg({ quality: 80 })
        .toBuffer();

      res.set({ "Content-Type": "image/jpeg", "Content-Length": thumb.length });
      res.send(thumb);
    } catch (err) {
      logger.logError(err, {
        context: 'getThumbnailByAssociation',
        model: req.params.model,
        id: req.params.id
      });
      res.status(500).json({ success: false, message: "Thumbnail error" });
    }
  }
}

module.exports = ImageController;