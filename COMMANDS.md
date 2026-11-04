# 🎯 Quick Commands Reference

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm start
```

### Start with Auto-Reload
```bash
npm run dev
```

### Access Application
```
http://localhost:5000
```

---

## 🔧 Development Commands

### Install a New Package
```bash
npm install package-name
```

### Remove a Package
```bash
npm uninstall package-name
```

### Check Dependencies
```bash
npm list
```

### Update Packages
```bash
npm update
```

### Audit Security
```bash
npm audit
```

### Fix Security Issues
```bash
npm audit fix
```

---

## 📦 Package.json Scripts

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start with auto-reload (nodemon)

### Add Custom Script
Edit `package.json`:
```json
"scripts": {
  "start": "node server.js",
  "dev": "node --watch server.js",
  "test": "node test.js"
}
```

Then run: `npm run test`

---

## 📁 Useful File Commands

### View Project Structure
```bash
tree -I 'node_modules'
```

### List Files
```bash
ls -la
```

### See File Sizes
```bash
du -sh *
```

### Count Lines of Code
```bash
wc -l *.js public/*.js
```

---

## 🔍 Debugging

### Check if Port is in Use
```bash
lsof -i :5000
```

### Kill Process on Port
```bash
kill -9 $(lsof -t -i:5000)
```

### View Server Logs
- Logs appear in terminal when running `npm start`

### Browser Console
- Press `F12` to open developer tools
- Check Console tab for JavaScript errors

---

## 📝 File Editing

### Edit .env File
```bash
nano .env
```

### View .env Contents
```bash
cat .env
```

### Edit server.js
```bash
nano server.js
```

---

## 🚀 Deployment Commands

### Deploy to Heroku

1. **Install Heroku CLI** (if not already installed)

2. **Login to Heroku**
```bash
heroku login
```

3. **Create App**
```bash
heroku create your-app-name
```

4. **Set Environment Variables**
```bash
heroku config:set CLOUDINARY_CLOUD_NAME=qykl9pb7
heroku config:set CLOUDINARY_API_KEY=414559493258584
heroku config:set CLOUDINARY_API_SECRET=DPujuXaVpF3ykAUPsiqIpvt1630
```

5. **Initialize Git** (if not already)
```bash
git init
git add .
git commit -m "Initial commit"
```

6. **Deploy**
```bash
git push heroku main
```

7. **View Logs**
```bash
heroku logs --tail
```

---

## 🐳 Docker Commands

### Build Docker Image
```bash
docker build -t cloudinary-gallery .
```

### Run Container
```bash
docker run -p 5000:5000 cloudinary-gallery
```

### Stop Container
```bash
docker stop container-id
```

### View Images
```bash
docker images
```

### View Containers
```bash
docker ps -a
```

---

## 🔄 Git Commands

### Initialize Git
```bash
git init
```

### Add Files
```bash
git add .
```

### Commit Changes
```bash
git commit -m "Your message"
```

### View Status
```bash
git status
```

### View Log
```bash
git log
```

### Create Branch
```bash
git branch feature-name
git checkout feature-name
```

### Merge Branch
```bash
git checkout main
git merge feature-name
```

---

## 📤 API Testing Commands

### Test Upload Endpoint
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@/path/to/image.jpg"
```

### Get All Images
```bash
curl http://localhost:5000/api/images
```

### Transform Image
```bash
curl -X POST http://localhost:5000/api/transform \
  -H "Content-Type: application/json" \
  -d '{"imageId":"photo-gallery/abc123","effect":"grayscale"}'
```

### Delete Image
```bash
curl -X DELETE http://localhost:5000/api/images/photo-gallery/abc123
```

### Get Statistics
```bash
curl http://localhost:5000/api/stats/photo-gallery/abc123
```

---

## 🧹 Cleanup Commands

### Remove node_modules
```bash
rm -rf node_modules
```

### Remove package-lock.json
```bash
rm package-lock.json
```

### Clean Install
```bash
rm -rf node_modules package-lock.json
npm install
```

### Remove All Generated Files
```bash
rm -rf node_modules .env dist build
```

---

## 📊 System Commands

### Check Node Version
```bash
node --version
```

### Check npm Version
```bash
npm --version
```

### Check Port Usage
```bash
netstat -tlnp | grep 5000
```

### Monitor Process
```bash
top
```

---

## 🎯 Useful Combinations

### Full Clean Restart
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Deploy with Logs
```bash
git push heroku main && heroku logs --tail
```

### Test All Endpoints
```bash
# After server is running:
curl http://localhost:5000/api/images | json_pp
```

---

## 📝 Notes

### Development Mode
- Server auto-reloads on file changes with `npm run dev`
- Edit files and changes take effect immediately
- Check browser console for frontend errors

### Production Mode
- Run `npm start` for stable server
- Errors logged to console
- Process exits if server crashes

### Debugging Tips
- Use `console.log()` in JavaScript
- Check Network tab in browser DevTools
- Read API response errors in browser console
- Check server console for backend errors

---

## 🔗 Resources

### Cloudinary API
```
https://cloudinary.com/documentation/image_upload_api_reference
```

### Express.js
```
https://expressjs.com/
```

### Multer
```
https://github.com/expressjs/multer
```

### Node.js
```
https://nodejs.org/docs/
```

---

## ⚡ Pro Tips

1. **Use Postman** - Test APIs visually
2. **Check logs** - Terminal shows all errors
3. **Browser DevTools** - F12 for debugging
4. **Comment code** - Future you will thank you
5. **Version control** - Use git regularly
6. **Environment variables** - Never commit secrets
7. **Test endpoints** - Use curl or Postman before frontend

---

**Happy coding!** 🚀
