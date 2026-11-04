import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

const cloudinaryConfigured = Object.values(cloudinaryConfig).every(Boolean);

if (cloudinaryConfigured) {
  cloudinary.config(cloudinaryConfig);
} else {
  console.warn(
    'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
  );
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Keep uploads in memory, then stream them directly to Cloudinary.
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      const error = new Error('Only image files are supported.');
      error.status = 400;
      return callback(error);
    }

    return callback(null, true);
  }
});

function uploadImage(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'photo-gallery'
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    stream.end(buffer);
  });
}

// ============ ROUTES ============

// 1. Upload Image to Cloudinary
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!cloudinaryConfigured) {
      return res.status(503).json({
        error: 'Cloudinary is not configured on this deployment. Add the three CLOUDINARY_* environment variables and redeploy.'
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Choose an image before uploading.' });
    }

    const result = await uploadImage(req.file.buffer);

    return res.status(201).json({
      success: true,
      imageId: result.public_id,
      imageUrl: result.secure_url,
      width: result.width,
      height: result.height,
      size: result.bytes
    });
  } catch (error) {
    console.error('Cloudinary upload failed:', error.message);
    return res.status(502).json({
      error: error.message || 'Cloudinary could not upload this image.'
    });
  }
});

// 2. Get all images from gallery folder
app.get('/api/images', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'photo-gallery',
      max_results: 100
    });

    const images = result.resources.map(img => ({
      id: img.public_id,
      url: img.secure_url,
      width: img.width,
      height: img.height,
      created: img.created_at
    }));

    res.json({ success: true, images });
  } catch (error) {
    console.error('Fetch images error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Transform Image (Resize, Apply Effects)
app.post('/api/transform', express.json(), async (req, res) => {
  try {
    const { imageId, width, height, effect, quality, angle } = req.body;

    if (!imageId) {
      return res.status(400).json({ error: 'imageId is required' });
    }

    let transformationUrl = cloudinary.url(imageId, {
      width: width || 400,
      height: height || 400,
      crop: 'fill',
      quality: quality || 'auto',
      fetch_format: 'auto',
      angle: angle || 0,
      effect: effect || 'auto'
    });

    // Generate transformed image
    await cloudinary.uploader.explicit(imageId, {
      type: 'upload',
      eager: [
        {
          width: width || 400,
          height: height || 400,
          crop: 'fill',
          effect: effect || 'auto'
        }
      ]
    });

    res.json({
      success: true,
      transformedUrl: transformationUrl
    });
  } catch (error) {
    console.error('Transform error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Delete Image
app.delete('/api/images/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    await cloudinary.uploader.destroy(imageId);

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Apply Overlay/Watermark
app.post('/api/watermark', express.json(), async (req, res) => {
  try {
    const { imageId, text } = req.body;

    if (!imageId || !text) {
      return res.status(400).json({ error: 'imageId and text are required' });
    }

    const watermarkedUrl = cloudinary.url(imageId, {
      overlay: {
        text: text,
        font_family: 'arial',
        font_size: 30,
        font_color: 'white',
        text_align: 'center',
        background: 'rgba:0,0,0,0.7'
      },
      width: 600,
      height: 600,
      crop: 'fill'
    });

    res.json({
      success: true,
      watermarkedUrl
    });
  } catch (error) {
    console.error('Watermark error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Get Image Statistics
app.get('/api/stats/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    const result = await cloudinary.api.resource(imageId);

    res.json({
      success: true,
      stats: {
        id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        created: result.created_at,
        bytes: result.bytes,
        version: result.version
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 7. Bulk Transform (Multiple effects)
app.post('/api/batch-transform', express.json(), async (req, res) => {
  try {
    const { imageId, transformations } = req.body;

    if (!imageId || !transformations) {
      return res.status(400).json({ error: 'imageId and transformations are required' });
    }

    const results = transformations.map(transform => {
      const url = cloudinary.url(imageId, {
        width: transform.width || 300,
        height: transform.height || 300,
        crop: 'fill',
        effect: transform.effect || 'auto',
        quality: 'auto',
        fetch_format: 'auto'
      });

      return {
        effect: transform.effect,
        url
      };
    });

    res.json({ success: true, results });
  } catch (error) {
    console.error('Batch transform error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 8. Generate Responsive Image URL
app.post('/api/responsive-url', express.json(), async (req, res) => {
  try {
    const { imageId } = req.body;

    if (!imageId) {
      return res.status(400).json({ error: 'imageId is required' });
    }

    // Generate srcset for responsive images
    const srcset = [
      { width: 300, descriptor: '300w' },
      { width: 600, descriptor: '600w' },
      { width: 900, descriptor: '900w' },
      { width: 1200, descriptor: '1200w' }
    ].map(size => {
      const url = cloudinary.url(imageId, {
        width: size.width,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto'
      });
      return `${url} ${size.descriptor}`;
    }).join(', ');

    res.json({
      success: true,
      srcset,
      defaultUrl: cloudinary.url(imageId, {
        width: 600,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto'
      })
    });
  } catch (error) {
    console.error('Responsive URL error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ADVANCED ROUTES ============

// 9. Smart Crop (Face Detection)
app.post('/api/smart-crop', express.json(), async (req, res) => {
  try {
    const { imageId, width, height } = req.body;

    if (!imageId) {
      return res.status(400).json({ error: 'imageId is required' });
    }

    const croppedUrl = cloudinary.url(imageId, {
      width: width || 500,
      height: height || 500,
      crop: 'thumb',
      gravity: 'face',
      quality: 'auto',
      fetch_format: 'auto'
    });

    res.json({
      success: true,
      croppedUrl
    });
  } catch (error) {
    console.error('Smart crop error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 10. Color Effects
app.post('/api/color-effects', express.json(), async (req, res) => {
  try {
    const { imageId, colorEffect } = req.body;

    if (!imageId || !colorEffect) {
      return res.status(400).json({ error: 'imageId and colorEffect are required' });
    }

    const colorEffectUrl = cloudinary.url(imageId, {
      effect: colorEffect,
      width: 600,
      height: 600,
      crop: 'fill',
      quality: 'auto'
    });

    res.json({
      success: true,
      colorEffectUrl
    });
  } catch (error) {
    console.error('Color effect error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 11. Blur Face (Privacy)
app.post('/api/blur-face', express.json(), async (req, res) => {
  try {
    const { imageId, strength } = req.body;

    if (!imageId) {
      return res.status(400).json({ error: 'imageId is required' });
    }

    const blurredUrl = cloudinary.url(imageId, {
      effect: `blur:${strength || 500}`,
      flags: 'region_relative',
      quality: 'auto',
      fetch_format: 'auto'
    });

    res.json({
      success: true,
      blurredUrl
    });
  } catch (error) {
    console.error('Blur face error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 12. Image Collage/Tile
app.post('/api/tile', express.json(), async (req, res) => {
  try {
    const { imageId } = req.body;

    if (!imageId) {
      return res.status(400).json({ error: 'imageId is required' });
    }

    const tiledUrl = cloudinary.url(imageId, {
      effect: 'tile',
      width: 800,
      height: 800,
      crop: 'fill'
    });

    res.json({
      success: true,
      tiledUrl
    });
  } catch (error) {
    console.error('Tile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 13. Background Removal
app.post('/api/remove-background', express.json(), async (req, res) => {
  try {
    const { imageId } = req.body;

    if (!imageId) {
      return res.status(400).json({ error: 'imageId is required' });
    }

    const bgRemovedUrl = cloudinary.url(imageId, {
      background: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    });

    res.json({
      success: true,
      bgRemovedUrl
    });
  } catch (error) {
    console.error('Background removal error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 14. Apply Border/Frame
app.post('/api/add-frame', express.json(), async (req, res) => {
  try {
    const { imageId, frameColor, borderWidth } = req.body;

    if (!imageId) {
      return res.status(400).json({ error: 'imageId is required' });
    }

    const framedUrl = cloudinary.url(imageId, {
      border: `${borderWidth || 20}px_solid_${frameColor || 'white'}`,
      background: frameColor || 'white',
      quality: 'auto'
    });

    res.json({
      success: true,
      framedUrl
    });
  } catch (error) {
    console.error('Frame error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 15. Overlay with Image
app.post('/api/add-overlay', express.json(), async (req, res) => {
  try {
    const { imageId, overlayImageId, opacity, position } = req.body;

    if (!imageId || !overlayImageId) {
      return res.status(400).json({ error: 'imageId and overlayImageId are required' });
    }

    const overlayUrl = cloudinary.url(imageId, {
      overlay: overlayImageId,
      opacity: opacity || 50,
      gravity: position || 'center',
      quality: 'auto'
    });

    res.json({
      success: true,
      overlayUrl
    });
  } catch (error) {
    console.error('Overlay error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 16. Create Social Media Sizes
app.post('/api/social-sizes', express.json(), async (req, res) => {
  try {
    const { imageId } = req.body;

    if (!imageId) {
      return res.status(400).json({ error: 'imageId is required' });
    }

    const sizes = {
      instagram: {
        square: cloudinary.url(imageId, { width: 1080, height: 1080, crop: 'fill', quality: 'auto' }),
        story: cloudinary.url(imageId, { width: 1080, height: 1920, crop: 'fill', quality: 'auto' }),
        feed: cloudinary.url(imageId, { width: 1200, height: 630, crop: 'fill', quality: 'auto' })
      },
      twitter: {
        post: cloudinary.url(imageId, { width: 1200, height: 675, crop: 'fill', quality: 'auto' }),
        header: cloudinary.url(imageId, { width: 1500, height: 500, crop: 'fill', quality: 'auto' })
      },
      facebook: {
        cover: cloudinary.url(imageId, { width: 820, height: 312, crop: 'fill', quality: 'auto' }),
        post: cloudinary.url(imageId, { width: 1200, height: 630, crop: 'fill', quality: 'auto' })
      },
      linkedin: {
        post: cloudinary.url(imageId, { width: 1200, height: 627, crop: 'fill', quality: 'auto' })
      }
    };

    res.json({
      success: true,
      sizes
    });
  } catch (error) {
    console.error('Social sizes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 17. Create Thumbnail Grid
app.post('/api/thumbnail-grid', express.json(), async (req, res) => {
  try {
    const { imageIds } = req.body;

    if (!imageIds || !Array.isArray(imageIds)) {
      return res.status(400).json({ error: 'imageIds array is required' });
    }

    const thumbnails = imageIds.slice(0, 9).map(id => ({
      id,
      url: cloudinary.url(id, { width: 200, height: 200, crop: 'fill', quality: 'auto' })
    }));

    res.json({
      success: true,
      thumbnails
    });
  } catch (error) {
    console.error('Thumbnail grid error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 18. Get Color Palette
app.get('/api/colors/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    const imageData = await cloudinary.api.resource(imageId, {
      colors: true
    });

    res.json({
      success: true,
      colors: imageData.colors || []
    });
  } catch (error) {
    console.error('Colors error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 19. Generate QR Code Overlay
app.post('/api/add-qr', express.json(), async (req, res) => {
  try {
    const { imageId, qrCode } = req.body;

    if (!imageId || !qrCode) {
      return res.status(400).json({ error: 'imageId and qrCode are required' });
    }

    const qrUrl = cloudinary.url(imageId, {
      overlay: {
        url: qrCode
      },
      opacity: 100,
      gravity: 'south_east',
      x: 10,
      y: 10,
      width: 100,
      crop: 'scale'
    });

    res.json({
      success: true,
      qrUrl
    });
  } catch (error) {
    console.error('QR code error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 20. Advanced Analytics
app.get('/api/analytics/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    const resource = await cloudinary.api.resource(imageId);

    const analytics = {
      fileSize: resource.bytes,
      format: resource.format,
      dimensions: `${resource.width}x${resource.height}`,
      created: resource.created_at,
      assetId: resource.asset_id,
      version: resource.version,
      cloudName: resource.folder,
      url: resource.secure_url
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deployment health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    cloudinary: cloudinaryConfigured ? 'configured' : 'missing_configuration'
  });
});

// Serve the frontend for the root URL and any non-API browser route.
app.get('*', (req, res) => {
  if (req.path === '/api' || req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }

  return res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'The image is too large. Maximum size is 20 MB.' });
  }

  return res.status(error.status || 500).json({
    error: error.message || 'The server could not process the upload.'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
