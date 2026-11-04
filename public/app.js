// ============ GLOBAL STATE ============
let currentImageId = null;
let currentImageUrl = null;
let allImages = [];
let filteredImages = [];

// ============ DOM ELEMENTS ============
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const gallery = document.getElementById('gallery');
const notification = document.getElementById('notification');
const progressBar = document.getElementById('progressBar');

// Control elements
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const effectSelect = document.getElementById('effectSelect');
const qualitySelect = document.getElementById('qualitySelect');
const watermarkText = document.getElementById('watermarkText');
const rotateInput = document.getElementById('rotateInput');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

// Advanced Modal
const advancedModal = document.getElementById('advancedModal');

// ============ EVENT LISTENERS ============
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('drop', handleDrop);
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    uploadFile(e.target.files[0]);
  }
});

searchInput?.addEventListener('input', filterGallery);
sortSelect?.addEventListener('change', sortGallery);

// Load images on page load
window.addEventListener('load', async () => {
  await loadImages();
  updateAnalytics();
});

// ============ TAB SWITCHING ============
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Remove active class from all nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // Show selected tab
  const tabElement = document.getElementById(`${tabName}-tab`);
  if (tabElement) {
    tabElement.classList.add('active');
  }

  // Add active class to clicked link
  event.target.classList.add('active');
}

// ============ FILE UPLOAD ============
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
  dropZone.style.background = 'rgba(236, 72, 153, 0.05)';
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.style.borderColor = '';
  dropZone.style.background = '';

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    uploadFile(files[0]);
  }
}

async function uploadFile(file) {
  if (!file.type.startsWith('image/')) {
    showNotification('❌ Please select an image file', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  progressBar.style.display = 'block';
  document.querySelector('.progress-fill').style.width = '30%';

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    document.querySelector('.progress-fill').style.width = '70%';

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();

    if (data.success) {
      document.querySelector('.progress-fill').style.width = '100%';
      showNotification(`✅ Image uploaded successfully!`);
      
      setTimeout(() => {
        progressBar.style.display = 'none';
        document.querySelector('.progress-fill').style.width = '0%';
        loadImages();
        updateAnalytics();
      }, 500);

      fileInput.value = '';
    }
  } catch (error) {
    showNotification(`❌ Upload failed: ${error.message}`, 'error');
    progressBar.style.display = 'none';
  }
}

// ============ GALLERY FUNCTIONS ============
async function loadImages() {
  try {
    const response = await fetch('/api/images');
    const data = await response.json();

    if (data.success && data.images.length > 0) {
      allImages = data.images;
      filteredImages = [...allImages];
      renderGallery();
      updateStats();
    } else {
      gallery.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-image"></i>
          <p>No images yet. Start by uploading!</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Failed to load images:', error);
    showNotification('Failed to load gallery', 'error');
  }
}

function renderGallery() {
  if (filteredImages.length === 0) {
    gallery.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p>No images found</p>
      </div>
    `;
    return;
  }

  gallery.innerHTML = filteredImages.map(img => `
    <div class="gallery-item" onclick="openEditor('${img.id}', '${img.url}')">
      <img src="${img.url}" alt="Gallery image" loading="lazy">
      <div class="gallery-overlay">
        <button class="edit-btn" onclick="event.stopPropagation(); openEditor('${img.id}', '${img.url}')">
          <i class="fas fa-edit"></i> Edit
        </button>
      </div>
    </div>
  `).join('');
}

function filterGallery() {
  const query = searchInput.value.toLowerCase();
  filteredImages = allImages.filter(img => 
    img.id.toLowerCase().includes(query)
  );
  renderGallery();
}

function sortGallery() {
  const sortBy = sortSelect.value;
  
  if (sortBy === 'recent') {
    filteredImages.sort((a, b) => new Date(b.created) - new Date(a.created));
  } else if (sortBy === 'size') {
    filteredImages.sort((a, b) => b.width * b.height - a.width * a.height);
  } else if (sortBy === 'name') {
    filteredImages.sort((a, b) => a.id.localeCompare(b.id));
  }
  
  renderGallery();
}

// ============ EDITOR FUNCTIONS ============
function openEditor(imageId, imageUrl) {
  currentImageId = imageId;
  currentImageUrl = imageUrl;
  document.getElementById('editorImage').src = imageUrl;
  document.getElementById('previewInfo').textContent = imageId.substring(0, 50) + '...';
  switchTab('editor');
}

// ============ TRANSFORMATIONS ============
async function applyTransform() {
  if (!currentImageId) {
    showNotification('⚠️ Please select an image first', 'warning');
    return;
  }

  try {
    const width = parseInt(widthInput.value) || 400;
    const height = parseInt(heightInput.value) || 400;
    const effect = effectSelect.value || 'auto';
    const quality = qualitySelect.value || 'auto';
    const angle = parseInt(rotateInput.value) || 0;

    progressBar.style.display = 'block';
    document.querySelector('.progress-fill').style.width = '50%';

    const response = await fetch('/api/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageId: currentImageId,
        width,
        height,
        effect,
        quality,
        angle
      })
    });

    document.querySelector('.progress-fill').style.width = '80%';

    const data = await response.json();

    if (data.success) {
      document.querySelector('.progress-fill').style.width = '100%';
      document.getElementById('editorImage').src = data.transformedUrl;
      currentImageUrl = data.transformedUrl;
      showNotification('✅ Transform applied successfully!');
      setTimeout(() => { progressBar.style.display = 'none'; }, 300);
    }
  } catch (error) {
    showNotification(`❌ Transform failed: ${error.message}`, 'error');
    progressBar.style.display = 'none';
  }
}

async function applyWatermark() {
  if (!currentImageId) {
    showNotification('⚠️ Please select an image first', 'warning');
    return;
  }

  if (!watermarkText.value.trim()) {
    showNotification('⚠️ Please enter watermark text', 'warning');
    return;
  }

  try {
    const response = await fetch('/api/watermark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageId: currentImageId,
        text: watermarkText.value
      })
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById('editorImage').src = data.watermarkedUrl;
      currentImageUrl = data.watermarkedUrl;
      showNotification('✅ Watermark applied successfully!');
    }
  } catch (error) {
    showNotification(`❌ Watermark failed: ${error.message}`, 'error');
  }
}

async function quickApply(effect) {
  if (!currentImageId) {
    showNotification('⚠️ Please select an image first', 'warning');
    return;
  }

  try {
    const response = await fetch('/api/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageId: currentImageId,
        width: 600,
        height: 600,
        effect: effect,
        quality: 'auto'
      })
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById('editorImage').src = data.transformedUrl;
      currentImageUrl = data.transformedUrl;
      showNotification(`✅ ${effect} applied!`);
    }
  } catch (error) {
    showNotification(`❌ Failed: ${error.message}`, 'error');
  }
}

// ============ ADVANCED TOOLS ============
function openTool(toolName) {
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');

  if (toolName === 'smart-crop') {
    modalTitle.textContent = 'Smart Crop';
    modalContent.innerHTML = `
      <div class="control-section">
        <label>Crop Width (px)</label>
        <input type="number" id="cropWidth" value="500" min="100">
      </div>
      <div class="control-section">
        <label>Crop Height (px)</label>
        <input type="number" id="cropHeight" value="500" min="100">
      </div>
      <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">Smart crop uses face detection for optimal results</p>
    `;
  } else if (toolName === 'watermark') {
    modalTitle.textContent = 'Add Watermark';
    modalContent.innerHTML = `
      <div class="control-section">
        <label>Watermark Text</label>
        <input type="text" id="modalWatermark" placeholder="Enter your watermark text" class="full-select">
      </div>
      <div class="control-section">
        <label>Font Size</label>
        <input type="number" id="fontSize" value="30" min="10" max="100" class="full-select">
      </div>
    `;
  } else if (toolName === 'frame') {
    modalTitle.textContent = 'Add Frame';
    modalContent.innerHTML = `
      <div class="control-section">
        <label>Border Width (px)</label>
        <input type="number" id="borderWidth" value="20" min="5" max="100" class="full-select">
      </div>
      <div class="control-section">
        <label>Frame Color</label>
        <input type="color" id="frameColor" value="#ffffff" class="full-select">
      </div>
    `;
  } else if (toolName === 'blur-face') {
    modalTitle.textContent = 'Blur Face';
    modalContent.innerHTML = `
      <div class="control-section">
        <label>Blur Strength</label>
        <input type="range" id="blurStrength" value="500" min="100" max="1000" class="slider">
        <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">Automatically detects and blurs faces for privacy</p>
      </div>
    `;
  } else if (toolName === 'social') {
    modalTitle.textContent = 'Social Media Optimization';
    modalContent.innerHTML = `
      <p>Click 'Apply' to generate optimized sizes for all social media platforms</p>
    `;
  }

  advancedModal.style.display = 'flex';
}

function closeAdvancedModal() {
  advancedModal.style.display = 'none';
}

async function applyAdvanced() {
  const modalTitle = document.getElementById('modalTitle').textContent;

  try {
    if (modalTitle === 'Smart Crop') {
      const width = document.getElementById('cropWidth').value;
      const height = document.getElementById('cropHeight').value;

      const response = await fetch('/api/smart-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: currentImageId,
          width: parseInt(width),
          height: parseInt(height)
        })
      });

      const data = await response.json();
      if (data.success) {
        document.getElementById('editorImage').src = data.croppedUrl;
        currentImageUrl = data.croppedUrl;
        showNotification('✅ Smart crop applied!');
        closeAdvancedModal();
      }
    } else if (modalTitle === 'Add Watermark') {
      const text = document.getElementById('modalWatermark').value;
      if (!text) {
        showNotification('⚠️ Please enter watermark text', 'warning');
        return;
      }

      const response = await fetch('/api/watermark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: currentImageId,
          text: text
        })
      });

      const data = await response.json();
      if (data.success) {
        document.getElementById('editorImage').src = data.watermarkedUrl;
        currentImageUrl = data.watermarkedUrl;
        showNotification('✅ Watermark added!');
        closeAdvancedModal();
      }
    } else if (modalTitle === 'Add Frame') {
      const borderWidth = document.getElementById('borderWidth').value;
      const frameColor = document.getElementById('frameColor').value.replace('#', '');

      const response = await fetch('/api/add-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: currentImageId,
          frameColor: frameColor,
          borderWidth: parseInt(borderWidth)
        })
      });

      const data = await response.json();
      if (data.success) {
        document.getElementById('editorImage').src = data.framedUrl;
        currentImageUrl = data.framedUrl;
        showNotification('✅ Frame applied!');
        closeAdvancedModal();
      }
    } else if (modalTitle === 'Blur Face') {
      const strength = document.getElementById('blurStrength').value;

      const response = await fetch('/api/blur-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: currentImageId,
          strength: parseInt(strength)
        })
      });

      const data = await response.json();
      if (data.success) {
        document.getElementById('editorImage').src = data.blurredUrl;
        currentImageUrl = data.blurredUrl;
        showNotification('✅ Face blurred!');
        closeAdvancedModal();
      }
    }
  } catch (error) {
    showNotification(`❌ Failed: ${error.message}`, 'error');
  }
}

async function generateSocialSizes() {
  if (!currentImageId) {
    showNotification('⚠️ Please select an image first', 'warning');
    return;
  }

  try {
    const response = await fetch('/api/social-sizes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId: currentImageId })
    });

    const data = await response.json();

    if (data.success) {
      const sizes = data.sizes;
      const html = Object.entries(sizes).map(([platform, platformSizes]) => `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #6366f1; margin-bottom: 10px; text-transform: uppercase;">${platform}</h4>
          <div style="display: grid; gap: 10px;">
            ${Object.entries(platformSizes).map(([type, url]) => `
              <div class="size-result">
                <h4>${type} - ${url.split('w_')[1]?.split('/')[0] || 'custom'}</h4>
                <p>${url.substring(0, 80)}...</p>
                <button onclick="navigator.clipboard.writeText('${url}')">Copy URL</button>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');

      document.getElementById('socialSizesDisplay').innerHTML = html;
      document.getElementById('socialResult').style.display = 'block';
      showNotification('✅ Social sizes generated!');
      switchTab('templates');
      closeAdvancedModal();
    }
  } catch (error) {
    showNotification(`❌ Failed: ${error.message}`, 'error');
  }
}

// ============ DOWNLOAD & COPY ============
async function downloadImage() {
  if (!currentImageUrl) {
    showNotification('⚠️ No image to download', 'warning');
    return;
  }

  try {
    const link = document.createElement('a');
    link.href = currentImageUrl + '?dl=true';
    link.download = `image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('✅ Image download started!');
  } catch (error) {
    showNotification(`❌ Download failed: ${error.message}`, 'error');
  }
}

function copyUrl() {
  if (!currentImageUrl) {
    showNotification('⚠️ No URL to copy', 'warning');
    return;
  }

  navigator.clipboard.writeText(currentImageUrl).then(() => {
    showNotification('✅ URL copied to clipboard!');
  }).catch(() => {
    showNotification('❌ Failed to copy', 'error');
  });
}

// ============ DELETE ============
async function deleteImage() {
  if (!currentImageId) {
    showNotification('⚠️ No image to delete', 'warning');
    return;
  }

  if (!confirm('Are you sure you want to delete this image?')) return;

  try {
    const response = await fetch(`/api/images/${currentImageId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showNotification('✅ Image deleted successfully!');
      await loadImages();
      updateAnalytics();
      switchTab('gallery');
    }
  } catch (error) {
    showNotification(`❌ Delete failed: ${error.message}`, 'error');
  }
}

// ============ ANALYTICS ============
function updateAnalytics() {
  const imageCount = allImages.length;
  const totalSize = allImages.reduce((sum, img) => sum + (img.width * img.height), 0);
  const avgSize = imageCount > 0 ? Math.round(totalSize / imageCount) : 0;
  const highestRes = imageCount > 0 
    ? `${Math.max(...allImages.map(img => img.width))}x${Math.max(...allImages.map(img => img.height))}`
    : '0x0';

  document.getElementById('imageCount').textContent = `${imageCount} Images`;
  document.getElementById('totalSize').textContent = `${(totalSize / 1024 / 1024).toFixed(1)} MB`;
  document.getElementById('totalImages').textContent = imageCount;
  document.getElementById('totalStorage').textContent = `${(totalSize / 1024 / 1024).toFixed(1)} MB`;
  document.getElementById('avgSize').textContent = `${avgSize} pixels`;
  document.getElementById('highestRes').textContent = highestRes;
}

function updateStats() {
  const totalSize = allImages.reduce((sum, img) => sum + (img.width * img.height), 0);
  const avgSize = allImages.length > 0 ? Math.round(totalSize / allImages.length) : 0;

  let html = '<div style="display: grid; gap: 10px;">';
  allImages.slice(0, 5).forEach(img => {
    html += `
      <div style="padding: 10px; background: #f3f4f6; border-radius: 8px;">
        <strong>${img.id.substring(0, 40)}</strong>
        <p style="font-size: 0.85rem; color: #666; margin-top: 5px;">
          ${img.width}x${img.height} - ${new Date(img.created).toLocaleDateString()}
        </p>
      </div>
    `;
  });
  html += '</div>';
  document.getElementById('imageStats').innerHTML = html;
}

// ============ UTILITY FUNCTIONS ============
function showNotification(message, type = 'success') {
  notification.textContent = message;
  notification.className = 'notification ' + type;
  notification.style.display = 'block';

  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Close modal on outside click
window.addEventListener('click', (e) => {
  if (e.target === advancedModal) {
    closeAdvancedModal();
  }
});
