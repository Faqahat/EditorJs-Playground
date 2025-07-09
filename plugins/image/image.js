/**
 * Simple Image Tool for Editor.js
 * Upload images to HTTP endpoint or add via URL
 */
class SimpleImage {
  static get isInline() {
    return false;
  }

  static get pasteConfig() {
    return {
      tags: ['IMG'],
      files: {
        mimeTypes: ['image/*']
      }
    };
  }

  static get toolbox() {
    return {
      title: "Image",
      icon: `<svg width="17" height="15" viewBox="0 0 17 15" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.8 6.8L14.6 5.7C14.2 5.3 13.5 5.3 13.1 5.7L5.8 13H3C2.4 13 2 12.6 2 12V3C2 2.4 2.4 2 3 2H14C14.6 2 15 2.4 15 3V6.8H15.8Z"/>
        <circle cx="6.8" cy="5.8" r="1.8"/>
        <path d="M16 11L13 8L10 11H16Z"/>
      </svg>`
    };
  }

  constructor({ data, config, api }) {
    this.api = api;
    this.config = config || {};
    
    // Configuration
    this.uploadEndpoint = this.config.uploadEndpoint || '';
    this.uploadField = this.config.uploadField || 'image';
    this.additionalRequestData = this.config.additionalRequestData || {};
    this.additionalRequestHeaders = this.config.additionalRequestHeaders || {};
    
    this.data = {
      url: data.url || '',
      caption: data.caption || '',
      withBorder: data.withBorder !== undefined ? data.withBorder : false,
      withBackground: data.withBackground !== undefined ? data.withBackground : false,
      stretched: data.stretched !== undefined ? data.stretched : false,
      alignment: data.alignment || 'center',
      customWidth: data.customWidth || null // User-defined width from resizing
    };

    this.wrapper = null;
    this.imageHolder = null;
    this.uploader = null;
    this.urlInput = null;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('simple-image-tool');

    if (this.data.url) {
      this.showImage();
    } else {
      this.showUploader();
    }

    return this.wrapper;
  }

  showUploader() {
    this.uploader = document.createElement('div');
    this.uploader.classList.add('simple-image-uploader');
    this.uploader.innerHTML = `
      <div class="simple-image-upload-tabs">
        <button class="simple-image-tab active" data-tab="upload">Upload</button>
        <button class="simple-image-tab" data-tab="url">URL</button>
      </div>
      
      <div class="simple-image-upload-content">
        <!-- Upload Tab -->
        <div class="simple-image-tab-content active" data-content="upload">
          <div class="simple-image-upload-area">
            <div class="simple-image-upload-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="simple-image-upload-text">
              <div class="simple-image-upload-title">Upload Image</div>
              <div class="simple-image-upload-subtitle">Click to select or drag and drop</div>
            </div>
            <input type="file" class="simple-image-file-input" accept="image/*" style="display: none;">
          </div>
          <div class="simple-image-upload-progress" style="display: none;">
            <div class="simple-image-progress-bar">
              <div class="simple-image-progress-fill"></div>
            </div>
            <div class="simple-image-progress-text">Uploading...</div>
          </div>
        </div>
        
        <!-- URL Tab -->
        <div class="simple-image-tab-content" data-content="url">
          <div class="simple-image-url-input-container">
            <input type="url" class="simple-image-url-input" placeholder="Paste image URL here...">
            <button class="simple-image-url-button">Add Image</button>
          </div>
        </div>
      </div>
    `;

    this.setupUploaderEvents();
    this.wrapper.appendChild(this.uploader);
  }

  setupUploaderEvents() {
    // Tab switching
    const tabs = this.uploader.querySelectorAll('.simple-image-tab');
    const tabContents = this.uploader.querySelectorAll('.simple-image-tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update tab states
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update content states
        tabContents.forEach(content => {
          content.classList.remove('active');
          if (content.dataset.content === targetTab) {
            content.classList.add('active');
          }
        });
      });
    });

    // File upload events
    const fileInput = this.uploader.querySelector('.simple-image-file-input');
    const uploadArea = this.uploader.querySelector('.simple-image-upload-area');

    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.uploadFile(file);
      }
    });

    // Drag and drop support
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith('image/')) {
        this.uploadFile(files[0]);
      }
    });

    // URL input events
    const urlInput = this.uploader.querySelector('.simple-image-url-input');
    const urlButton = this.uploader.querySelector('.simple-image-url-button');

    urlButton.addEventListener('click', () => {
      const url = urlInput.value.trim();
      if (url) {
        this.addImageFromUrl(url);
      }
    });

    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const url = urlInput.value.trim();
        if (url) {
          this.addImageFromUrl(url);
        }
      }
    });

    urlInput.addEventListener('paste', (e) => {
      setTimeout(() => {
        const url = urlInput.value.trim();
        if (url && this.isValidImageUrl(url)) {
          this.addImageFromUrl(url);
        }
      }, 100);
    });
  }

  async uploadFile(file) {
    if (!this.uploadEndpoint) {
      this.showError('Upload endpoint not configured.');
      return;
    }

    const progressContainer = this.uploader.querySelector('.simple-image-upload-progress');
    const uploadArea = this.uploader.querySelector('.simple-image-upload-area');
    const progressFill = this.uploader.querySelector('.simple-image-progress-fill');
    const progressText = this.uploader.querySelector('.simple-image-progress-text');

    // Show progress
    uploadArea.style.display = 'none';
    progressContainer.style.display = 'block';

    try {
      const formData = new FormData();
      formData.append(this.uploadField, file);
      
      // Add additional request data
      Object.keys(this.additionalRequestData).forEach(key => {
        formData.append(key, this.additionalRequestData[key]);
      });

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100);
          progressFill.style.width = `${percentage}%`;
          progressText.textContent = `Uploading... ${percentage}%`;
        }
      });

      // Handle response
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            const imageUrl = this.extractImageUrl(response);
            
            if (imageUrl) {
              this.data.url = imageUrl;
              this.showImage();
            } else {
              this.showError('Invalid response format from server.');
            }
          } catch (error) {
            this.showError('Invalid JSON response from server.');
          }
        } else {
          this.showError(`Upload failed with status: ${xhr.status}`);
        }
      });

      xhr.addEventListener('error', () => {
        this.showError('Upload failed. Please check your connection and try again.');
      });

      // Start upload
      xhr.open('POST', this.uploadEndpoint);
      
      // Add additional headers
      Object.keys(this.additionalRequestHeaders).forEach(key => {
        xhr.setRequestHeader(key, this.additionalRequestHeaders[key]);
      });
      
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      this.showError('Upload failed. Please try again.');
    }
  }

  extractImageUrl(response) {
    // Try different common response formats
    if (typeof response === 'string') {
      return response;
    }
    
    if (response.url) {
      return response.url;
    }
    
    if (response.data && response.data.url) {
      return response.data.url;
    }
    
    if (response.file && response.file.url) {
      return response.file.url;
    }
    
    if (response.image && response.image.url) {
      return response.image.url;
    }
    
    if (response.link) {
      return response.link;
    }
    
    return null;
  }

  addImageFromUrl(url) {
    if (!this.isValidImageUrl(url)) {
      this.showError('Please enter a valid image URL.');
      return;
    }

    // Test if image loads
    const testImage = new Image();
    
    testImage.onload = () => {
      this.data.url = url;
      this.showImage();
    };
    
    testImage.onerror = () => {
      this.showError('Failed to load image from URL.');
    };
    
    testImage.src = url;
  }

  isValidImageUrl(url) {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|bmp|svg|webp)(\?.*)?$/i.test(url);
    } catch {
      return false;
    }
  }

  showError(message) {
    const progressContainer = this.uploader?.querySelector('.simple-image-upload-progress');
    const uploadArea = this.uploader?.querySelector('.simple-image-upload-area');
    
    if (progressContainer) progressContainer.style.display = 'none';
    if (uploadArea) uploadArea.style.display = 'block';

    // Show error message
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('simple-image-error');
    errorDiv.textContent = message;
    this.wrapper.appendChild(errorDiv);

    // Remove error after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  showImage() {
    this.wrapper.innerHTML = '';
    
    this.imageHolder = document.createElement('div');
    this.imageHolder.classList.add('simple-image-holder');

    // Apply styling classes
    if (this.data.withBorder) {
      this.imageHolder.classList.add('simple-image--with-border');
    }
    if (this.data.withBackground) {
      this.imageHolder.classList.add('simple-image--with-background');
    }
    if (this.data.stretched) {
      this.imageHolder.classList.add('simple-image--stretched');
    }
    
    // Apply alignment classes
    this.imageHolder.classList.add(`simple-image--${this.data.alignment}`);

    // Create image container for resize functionality
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('simple-image-container');

    const image = document.createElement('img');
    image.src = this.data.url;
    image.classList.add('simple-image');

    // Apply custom width if set
    if (this.data.customWidth) {
      imageContainer.style.width = this.data.customWidth + 'px';
      imageContainer.style.maxWidth = '100%';
    }
    
    // Add loading and error handling
    image.addEventListener('load', () => {
      image.classList.add('simple-image--loaded');
    });

    image.addEventListener('error', () => {
      this.showError('Failed to load image.');
    });

    // Create options overlay (like Cloudinary plugin)
    const optionsOverlay = document.createElement('div');
    optionsOverlay.classList.add('simple-image-options-overlay');

    const optionsButton = document.createElement('button');
    optionsButton.classList.add('simple-image-options-button');
    optionsButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="8" cy="3" r="1.5"/>
        <circle cx="8" cy="8" r="1.5"/>
        <circle cx="8" cy="13" r="1.5"/>
      </svg>
    `;

    // Create resize handle (like Cloudinary plugin)
    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('simple-image-resize-handle');
    resizeHandle.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M16 0v6l-2-2-4 4-2-2 4-4-2-2h6zM6 10l-4 4 2 2H0v-6l2 2 4-4 2 2z"/>
      </svg>
    `;

    optionsOverlay.appendChild(optionsButton);
    optionsOverlay.appendChild(resizeHandle);

    imageContainer.appendChild(image);
    imageContainer.appendChild(optionsOverlay);

    // Add resize functionality
    this.addResizeHandlers(imageContainer, resizeHandle);

    // Add options functionality
    this.addOptionsHandler(optionsButton);

    const caption = document.createElement('div');
    caption.classList.add('simple-image-caption');
    caption.contentEditable = true;
    caption.innerHTML = this.data.caption;
    caption.setAttribute('data-placeholder', 'Add a caption...');

    caption.addEventListener('input', () => {
      this.data.caption = caption.innerHTML;
    });

    // Prevent Enter key from creating new blocks
    caption.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });

    this.imageHolder.appendChild(imageContainer);
    this.imageHolder.appendChild(caption);
    this.wrapper.appendChild(this.imageHolder);
  }

  save() {
    return {
      url: this.data.url,
      caption: this.data.caption,
      withBorder: this.data.withBorder,
      withBackground: this.data.withBackground,
      stretched: this.data.stretched,
      alignment: this.data.alignment,
      customWidth: this.data.customWidth
    };
  }

  renderSettings() {
    // No longer needed as options are now on-image
    return null;
  }

  onPaste(event) {
    const data = event.detail.data;
    
    if (data.tagName === 'IMG') {
      const url = data.src;
      if (url) {
        this.data.url = url;
        this.showImage();
      }
    }
  }

  static get sanitize() {
    return {
      url: {},
      caption: {
        b: {},
        i: {},
        u: {},
        s: {},
        a: {
          href: true
        },
        code: {},
        mark: {}
      },
      withBorder: {},
      withBackground: {},
      stretched: {},
      alignment: {},
      customWidth: {}
    };
  }

  static get shortcut() {
    return 'CMD+SHIFT+P';
  }

  addResizeHandlers(container, handle) {
    let isResizing = false;
    let startX, startWidth;

    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = parseInt(window.getComputedStyle(container).width, 10);

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      e.preventDefault();
    });

    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const newWidth = startWidth + deltaX;
      const minWidth = 100;
      const maxWidth = this.wrapper.offsetWidth;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        container.style.width = newWidth + 'px';
        this.data.customWidth = newWidth;
      }
    };

    const handleMouseUp = () => {
      isResizing = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }

  addOptionsHandler(button) {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showOptionsMenu(button);
    });
  }

  showOptionsMenu(button) {
    // Remove existing menu if any
    const existingMenu = document.querySelector('.simple-image-options-menu');
    if (existingMenu) {
      existingMenu.remove();
      return;
    }

    const menu = document.createElement('div');
    menu.classList.add('simple-image-options-menu');

    // Alignment options
    const alignmentOptions = [
      { name: 'left', icon: '⬅️', label: 'Left' },
      { name: 'center', icon: '⬆️', label: 'Center' },
      { name: 'right', icon: '➡️', label: 'Right' }
    ];

    alignmentOptions.forEach(option => {
      const optionButton = document.createElement('button');
      optionButton.classList.add('simple-image-option-item');
      if (this.data.alignment === option.name) {
        optionButton.classList.add('active');
      }

      optionButton.innerHTML = `
        <span class="option-icon">${option.icon}</span>
        <span class="option-label">${option.label}</span>
      `;

      optionButton.addEventListener('click', () => {
        this.data.alignment = option.name;
        this.updateAlignment();
        menu.remove();
      });

      menu.appendChild(optionButton);
    });

    // Background toggle
    const backgroundButton = document.createElement('button');
    backgroundButton.classList.add('simple-image-option-item');
    if (this.data.withBackground) {
      backgroundButton.classList.add('active');
    }

    backgroundButton.innerHTML = `
      <span class="option-icon">🎨</span>
      <span class="option-label">Background</span>
    `;

    backgroundButton.addEventListener('click', () => {
      this.data.withBackground = !this.data.withBackground;
      this.updateBackground();
      menu.remove();
    });

    menu.appendChild(backgroundButton);

    // Border toggle
    const borderButton = document.createElement('button');
    borderButton.classList.add('simple-image-option-item');
    if (this.data.withBorder) {
      borderButton.classList.add('active');
    }

    borderButton.innerHTML = `
      <span class="option-icon">⬜</span>
      <span class="option-label">Border</span>
    `;

    borderButton.addEventListener('click', () => {
      this.data.withBorder = !this.data.withBorder;
      this.updateBorder();
      menu.remove();
    });

    menu.appendChild(borderButton);

    // Stretch toggle
    const stretchButton = document.createElement('button');
    stretchButton.classList.add('simple-image-option-item');
    if (this.data.stretched) {
      stretchButton.classList.add('active');
    }

    stretchButton.innerHTML = `
      <span class="option-icon">↔️</span>
      <span class="option-label">Stretch</span>
    `;

    stretchButton.addEventListener('click', () => {
      this.data.stretched = !this.data.stretched;
      this.updateStretch();
      menu.remove();
    });

    menu.appendChild(stretchButton);

    // Position menu near button
    const rect = button.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = rect.bottom + 5 + 'px';
    menu.style.left = rect.left - 50 + 'px';
    menu.style.zIndex = '1000';

    document.body.appendChild(menu);

    // Close menu when clicking outside
    setTimeout(() => {
      const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      };
      document.addEventListener('click', closeMenu);
    }, 0);
  }

  updateAlignment() {
    this.imageHolder.className = this.imageHolder.className.replace(
      /simple-image--(?:left|center|right)\b/g,
      ''
    );
    this.imageHolder.classList.add(`simple-image--${this.data.alignment}`);
  }

  updateBackground() {
    if (this.data.withBackground) {
      this.imageHolder.classList.add('simple-image--with-background');
    } else {
      this.imageHolder.classList.remove('simple-image--with-background');
    }
  }

  updateBorder() {
    if (this.data.withBorder) {
      this.imageHolder.classList.add('simple-image--with-border');
    } else {
      this.imageHolder.classList.remove('simple-image--with-border');
    }
  }

  updateStretch() {
    if (this.data.stretched) {
      this.imageHolder.classList.add('simple-image--stretched');
    } else {
      this.imageHolder.classList.remove('simple-image--stretched');
    }
  }

  // ...existing code...
}

// Make it available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SimpleImage;
} else {
  window.SimpleImage = SimpleImage;
}
