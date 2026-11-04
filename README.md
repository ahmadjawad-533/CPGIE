# 🎨 Cloudinary Photo Gallery & Image Editor

A full-featured photo gallery and image editing application built with **Cloudinary APIs**, **Node.js/Express**, and **Vanilla JavaScript**. Perfect for joining the Cloudinary Creator Community!

## 📋 Features

### ✅ Image Management
- **Drag & Drop Upload** - Easily upload images with visual feedback
- **Gallery Display** - Beautiful responsive grid gallery
- **Batch Operations** - Manage multiple images efficiently
- **Auto Optimization** - Cloudinary's smart format and quality optimization

### 🎨 Image Transformations
- **Resize Images** - Custom width and height
- **Apply Effects** - Grayscale, Sepia, Blur, Sharpen, Oil Paint, Cartoonify, Pixelate
- **Rotation** - Rotate images by any angle
- **Quality Control** - Adjust compression levels
- **Watermarking** - Add custom text watermarks
- **Responsive URLs** - Generate srcset for responsive images

### 📊 Advanced Features
- **Image Statistics** - View metadata (size, dimensions, format, creation date)
- **URL Generation** - Get optimized URLs for different devices
- **Bulk Transformations** - Apply multiple effects at once
- **One-Click Download** - Download transformed images
- **URL Copy** - Share images via clipboard

## 🚀 Project Structure

```
Sp24-bcs-160/
├── server.js              # Express backend server
├── package.json           # Dependencies
├── .env                   # Environment variables (Cloudinary credentials)
├── public/
│   ├── index.html        # Main HTML page
│   ├── style.css         # Styling
│   └── app.js            # Frontend JavaScript
└── README.md             # This file
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs:
- **express** - Web framework
- **cloudinary** - Cloudinary SDK
- **multer** - File upload handling
- **cors** - Cross-origin requests
- **dotenv** - Environment variables

### 2. Configure Environment Variables

Update `.env` with your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=qykl9pb7
CLOUDINARY_API_KEY=414559493258584
CLOUDINARY_API_SECRET=DPujuXaVpF3ykAUPsiqIpvt1630
PORT=5000
```

### 3. Start the Server

```bash
npm start
```

The application will be available at: **http://localhost:5000**

### 4. (Optional) Development Mode

For automatic restart on file changes:

```bash
npm run dev
```

## 📚 API Endpoints

### Upload Image
```
POST /api/upload
Content-Type: multipart/form-data

Body: file (image file)

Response:
{
  "success": true,
  "imageId": "photo-gallery/abc123",
  "imageUrl": "https://...",
  "width": 1920,
  "height": 1080,
  "size": 245678
}
```

### Get All Images
```
GET /api/images

Response:
{
  "success": true,
  "images": [
    {
      "id": "photo-gallery/abc123",
      "url": "https://...",
      "width": 1920,
      "height": 1080,
      "created": "2024-11-05T..."
    }
  ]
}
```

### Transform Image
```
POST /api/transform
Content-Type: application/json

Body: {
  "imageId": "photo-gallery/abc123",
  "width": 400,
  "height": 400,
  "effect": "sepia",
  "quality": "auto",
  "angle": 0
}

Response:
{
  "success": true,
  "transformedUrl": "https://..."
}
```

### Add Watermark
```
POST /api/watermark
Content-Type: application/json

Body: {
  "imageId": "photo-gallery/abc123",
  "text": "© My Photo"
}

Response:
{
  "success": true,
  "watermarkedUrl": "https://..."
}
```

### Delete Image
```
DELETE /api/images/:imageId

Response:
{
  "success": true,
  "message": "Image deleted successfully"
}
```

### Get Image Statistics
```
GET /api/stats/:imageId

Response:
{
  "success": true,
  "stats": {
    "id": "photo-gallery/abc123",
    "url": "https://...",
    "width": 1920,
    "height": 1080,
    "format": "jpg",
    "size": 245678,
    "created": "2024-11-05T..."
  }
}
```

### Batch Transformations
```
POST /api/batch-transform
Content-Type: application/json

Body: {
  "imageId": "photo-gallery/abc123",
  "transformations": [
    { "effect": "grayscale", "width": 300 },
    { "effect": "sepia", "width": 300 },
    { "effect": "blur", "width": 300 }
  ]
}

Response:
{
  "success": true,
  "results": [
    { "effect": "grayscale", "url": "https://..." },
    { "effect": "sepia", "url": "https://..." },
    { "effect": "blur", "url": "https://..." }
  ]
}
```

### Generate Responsive URLs
```
POST /api/responsive-url
Content-Type: application/json

Body: {
  "imageId": "photo-gallery/abc123"
}

Response:
{
  "success": true,
  "srcset": "https://... 300w, https://... 600w, ...",
  "defaultUrl": "https://..."
}
```

## 🎯 Available Transformations

### Effects
- `grayscale` - Convert to black and white
- `sepia` - Add vintage sepia tone
- `blur` - Add blur effect
- `sharpen` - Enhance sharpness
- `oil_paint` - Artistic oil painting effect
- `cartoonify` - Cartoon effect
- `pixelate` - Pixelate effect

### Quality Options
- `auto` - Cloudinary auto-optimizes
- `80` - 80% quality (smaller file)
- `90` - 90% quality (balanced)
- `100` - 100% quality (highest quality)

## 💡 Usage Examples

### Example 1: Basic Upload
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

### Example 2: Apply Grayscale Effect
```javascript
const response = await fetch('/api/transform', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageId: 'photo-gallery/abc123',
    effect: 'grayscale',
    width: 600,
    height: 400
  })
});
```

### Example 3: Generate Responsive Images
```javascript
const response = await fetch('/api/responsive-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageId: 'photo-gallery/abc123'
  })
});

const data = await response.json();
// Use data.srcset in img srcset attribute for responsive images
```

## 🎨 Frontend Features

### Real-Time Preview
- See transformations applied in real-time
- Live preview in the editor modal
- Instant feedback on parameter changes

### Responsive Design
- Mobile-first approach
- Works on desktop, tablet, and mobile
- Touch-friendly interface

### User Experience
- Drag & drop file upload
- Visual progress indicators
- Toast notifications
- Smooth animations
- Clean, modern UI

## 🔒 Security Considerations

✅ **Implementation Details:**
- Uses environment variables for sensitive credentials
- API secret never exposed to frontend
- Secure HTTPS URLs from Cloudinary
- File validation on backend
- Rate limiting recommended for production

⚠️ **Production Recommendations:**
1. Add authentication for user accounts
2. Implement rate limiting
3. Add CORS whitelist
4. Use signed URLs for sensitive operations
5. Monitor upload file sizes
6. Implement error logging
7. Use HTTPS in production
8. Add API key rotation

## 🚀 Deployment Options

### Option 1: Heroku
```bash
heroku create your-app-name
heroku config:set CLOUDINARY_CLOUD_NAME=qykl9pb7
heroku config:set CLOUDINARY_API_KEY=414559493258584
heroku config:set CLOUDINARY_API_SECRET=DPujuXaVpF3ykAUPsiqIpvt1630
git push heroku main
```

### Option 2: Vercel (Backend)
- Use Vercel Functions for serverless deployment

### Option 3: Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Performance Optimization

### Cloudinary Features Used
- **Auto Format** - WebP/AVIF for modern browsers
- **Auto Quality** - Intelligent compression
- **Responsive Breakpoints** - Multiple sizes for srcset
- **Lazy Loading** - Images load on demand
- **CDN Delivery** - Global content delivery network

### Frontend Optimization
- Lazy loading images in gallery
- Debounced resize handlers
- Optimized bundle size
- CSS animations instead of JS
- Efficient DOM updates

## 🐛 Troubleshooting

### Issue: "Cannot find module 'cloudinary'"
**Solution:** Run `npm install`

### Issue: Images not uploading
**Solution:** Check `.env` file has correct credentials
- Verify `CLOUDINARY_CLOUD_NAME` is correct
- Ensure `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` match

### Issue: CORS errors
**Solution:** CORS is already configured, but if issues persist:
```javascript
app.use(cors({
  origin: 'http://localhost:3000', // your frontend URL
}));
```

### Issue: 413 Payload Too Large
**Solution:** Increase multer limits in server.js:
```javascript
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});
```

## 📈 Next Steps for Creator Community

1. **Build Portfolio** - Use this to showcase photography
2. **Add Authentication** - Let users create accounts
3. **Share Gallery** - Generate public gallery links
4. **Social Sharing** - Add share buttons
5. **Batch Processing** - Process multiple images
6. **Storage Management** - Track storage usage
7. **Analytics** - Track image views/downloads
8. **Monetization** - Sell prints or licenses

## 🎓 Learning Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary JavaScript SDK](https://cloudinary.com/documentation/javascript_integration)
- [Transformation Reference](https://cloudinary.com/documentation/transformation_reference)
- [Upload API Reference](https://cloudinary.com/documentation/image_upload_api_reference)

## 📝 License

MIT License - Feel free to use this project for the Cloudinary Creator Community!

## 🤝 Support

For issues or questions:
1. Check Cloudinary documentation
2. Review API endpoint responses for error messages
3. Check browser console for JavaScript errors
4. Verify environment variables are set correctly

## ✨ Features Showcased

This project demonstrates:
- ✅ Image upload management
- ✅ Cloud storage
- ✅ Image transformations
- ✅ Real-time preview
- ✅ API integration
- ✅ Modern UI/UX
- ✅ Error handling
- ✅ Performance optimization
- ✅ Responsive design
- ✅ User notifications

Perfect for Cloudinary Creator Community portfolio! 🚀
