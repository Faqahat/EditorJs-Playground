/**
 * Cloudinary Image Tool for Editor.js
 * Uploads images to Cloudinary and displays them with various options
 */
class CloudinaryImage {
  static get isInline() {
    return false;
  }

  static get pasteConfig() {
    return {
      tags: ["IMG"],
      files: {
        mimeTypes: ["image/*"],
      },
    };
  }

  static get toolbox() {
    return {
      title: "Cloudinary",
      icon: `<svg width="98" height="76" viewBox="0 0 98 76" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.85 0.129883H83.15C91.32 0.129883 98 6.81988 98 14.9799V61.0199C98 69.1799 91.32 75.8699 83.15 75.8699H14.85C6.68 75.8699 0 69.1799 0 61.0199V14.9799C0 6.81988 6.68 0.129883 14.85 0.129883ZM70.01 11.0299C74.21 11.0299 77.61 14.4299 77.61 18.6299C77.61 22.8299 74.21 26.2399 70.01 26.2399C65.81 26.2399 62.4 22.8299 62.4 18.6299C62.4 14.4299 65.81 11.0299 70.01 11.0299ZM21.03 52.6099L38.48 24.2799C39.94 22.5999 43.25 22.5999 44.71 24.2799L56.04 42.6599L60.53 35.3699C61.57 34.1699 63.92 34.1699 64.96 35.3699L77.35 55.4899C79.69 59.2899 77.22 63.9499 73.08 63.9499C57.73 63.9499 42.38 63.9499 27.03 63.9499C21.14 63.9499 17.73 57.9599 21.03 52.6099Z" fill="black"/>
</svg>
`,
    };
  }

  constructor({ data, config, api }) {
    this.api = api;
    this.config = config || {};

    // Cloudinary configuration - these should be set in the Editor.js config
    this.cloudName = this.config.cloudName || "";
    this.uploadPreset = this.config.uploadPreset || "";
    this.apiKey = this.config.apiKey || "";

    this.data = {
      url: data.url || "",
      caption: data.caption || "",
      withBackground:
        data.withBackground !== undefined ? data.withBackground : false,
      alignment: data.alignment || "center", // left, center, right
      width: data.width || null,
      height: data.height || null,
      customWidth: data.customWidth || null, // User-defined width from resizing
      publicId: data.publicId || "",
    };

    this.wrapper = null;
    this.imageHolder = null;
    this.uploader = null;
  }

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("cloudinary-image-tool");

    if (this.data.url) {
      this.showImage();
    } else {
      this.showUploader();
    }

    return this.wrapper;
  }

  showUploader() {
    this.uploader = document.createElement("div");
    this.uploader.classList.add("cloudinary-uploader");
    this.uploader.innerHTML = `
      <div class="cloudinary-uploader-content">
        <div class="cloudinary-upload-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="cloudinary-upload-text">
          <div class="cloudinary-upload-title">Upload to Cloudinary</div>
          <div class="cloudinary-upload-subtitle">Click to select an image or drag and drop</div>
        </div>
        <input type="file" class="cloudinary-file-input" accept="image/*" style="display: none;">
      </div>
      <div class="cloudinary-upload-progress" style="display: none;">
        <div class="cloudinary-progress-bar">
          <div class="cloudinary-progress-fill"></div>
        </div>
        <div class="cloudinary-progress-text">Uploading...</div>
      </div>
    `;

    // Add event listeners
    const fileInput = this.uploader.querySelector(".cloudinary-file-input");
    const uploaderContent = this.uploader.querySelector(
      ".cloudinary-uploader-content"
    );

    uploaderContent.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        this.uploadToCloudinary(file);
      }
    });

    // Drag and drop support
    uploaderContent.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploaderContent.classList.add("dragover");
    });

    uploaderContent.addEventListener("dragleave", () => {
      uploaderContent.classList.remove("dragover");
    });

    uploaderContent.addEventListener("drop", (e) => {
      e.preventDefault();
      uploaderContent.classList.remove("dragover");

      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith("image/")) {
        this.uploadToCloudinary(files[0]);
      }
    });

    this.wrapper.appendChild(this.uploader);
  }

  async uploadToCloudinary(file) {
    if (!this.cloudName || !this.uploadPreset) {
      this.showError(
        "Cloudinary configuration missing. Please configure cloudName and uploadPreset."
      );
      return;
    }

    const progressContainer = this.uploader.querySelector(
      ".cloudinary-upload-progress"
    );
    const uploaderContent = this.uploader.querySelector(
      ".cloudinary-uploader-content"
    );
    const progressFill = this.uploader.querySelector(
      ".cloudinary-progress-fill"
    );
    const progressText = this.uploader.querySelector(
      ".cloudinary-progress-text"
    );

    // Show progress
    uploaderContent.style.display = "none";
    progressContainer.style.display = "block";

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", this.uploadPreset);
      formData.append("cloud_name", this.cloudName);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100);
          progressFill.style.width = `${percentage}%`;
          progressText.textContent = `Uploading... ${percentage}%`;
        }
      });

      // Handle response
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          this.data.url = response.secure_url;
          this.data.publicId = response.public_id;
          this.data.width = response.width;
          this.data.height = response.height;
          this.showImage();
        } else {
          this.showError("Upload failed. Please try again.");
        }
      });

      xhr.addEventListener("error", () => {
        this.showError(
          "Upload failed. Please check your connection and try again."
        );
      });

      // Start upload
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`
      );
      xhr.send(formData);
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      this.showError("Upload failed. Please try again.");
    }
  }

  showError(message) {
    const progressContainer = this.uploader?.querySelector(
      ".cloudinary-upload-progress"
    );
    const uploaderContent = this.uploader?.querySelector(
      ".cloudinary-uploader-content"
    );

    if (progressContainer) progressContainer.style.display = "none";
    if (uploaderContent) uploaderContent.style.display = "block";

    // Show error message
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("cloudinary-error");
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
    this.wrapper.innerHTML = "";

    this.imageHolder = document.createElement("div");
    this.imageHolder.classList.add("cloudinary-image-holder");

    // Apply styling classes
    if (this.data.withBackground) {
      this.imageHolder.classList.add("cloudinary-image--with-background");
    }

    // Apply alignment classes
    this.imageHolder.classList.add(`cloudinary-image--${this.data.alignment}`);

    // Create image container for resize functionality
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("cloudinary-image-container");

    const image = document.createElement("img");
    image.src = this.data.url;
    image.classList.add("cloudinary-image");

    // Apply custom width if set
    if (this.data.customWidth) {
      imageContainer.style.width = this.data.customWidth + "px";
      imageContainer.style.maxWidth = "100%";
    }

    // Add loading and error handling
    image.addEventListener("load", () => {
      image.classList.add("cloudinary-image--loaded");
    });

    image.addEventListener("error", () => {
      this.showError("Failed to load image.");
    });

    // Create options overlay
    const optionsOverlay = document.createElement("div");
    optionsOverlay.classList.add("cloudinary-options-overlay");

    const optionsButton = document.createElement("button");
    optionsButton.classList.add("cloudinary-options-button");
    optionsButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="8" cy="3" r="1.5"/>
        <circle cx="8" cy="8" r="1.5"/>
        <circle cx="8" cy="13" r="1.5"/>
      </svg>
    `;

    // Create resize handles
    const resizeHandle = document.createElement("div");
    resizeHandle.classList.add("cloudinary-resize-handle");
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

    const caption = document.createElement("div");
    caption.classList.add("cloudinary-caption");
    caption.contentEditable = true;
    caption.innerHTML = this.data.caption;
    caption.setAttribute("data-placeholder", "Add a caption...");

    caption.addEventListener("input", () => {
      this.data.caption = caption.innerHTML;
    });

    // Prevent Enter key from creating new blocks
    caption.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    });

    this.imageHolder.appendChild(imageContainer);
    this.imageHolder.appendChild(caption);
    this.wrapper.appendChild(this.imageHolder);
  }

  addResizeHandlers(container, handle) {
    let isResizing = false;
    let startX, startWidth;

    handle.addEventListener("mousedown", (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = parseInt(window.getComputedStyle(container).width, 10);

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      e.preventDefault();
    });

    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const newWidth = startWidth + deltaX;
      const minWidth = 100;
      const maxWidth = this.wrapper.offsetWidth;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        container.style.width = newWidth + "px";
        this.data.customWidth = newWidth;
      }
    };

    const handleMouseUp = () => {
      isResizing = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }

  addOptionsHandler(button) {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.showOptionsMenu(button);
    });
  }

  showOptionsMenu(button) {
    // Remove existing menu if any
    const existingMenu = document.querySelector(".cloudinary-options-menu");
    if (existingMenu) {
      existingMenu.remove();
      return;
    }

    const menu = document.createElement("div");
    menu.classList.add("cloudinary-options-menu");

    // Alignment options
    const alignmentOptions = [
      { name: "left", icon: "⬅️", label: "Left" },
      { name: "center", icon: "⬆️", label: "Center" },
      { name: "right", icon: "➡️", label: "Right" },
    ];

    alignmentOptions.forEach((option) => {
      const optionButton = document.createElement("button");
      optionButton.classList.add("cloudinary-option-item");
      if (this.data.alignment === option.name) {
        optionButton.classList.add("active");
      }

      optionButton.innerHTML = `
        <span class="option-icon">${option.icon}</span>
        <span class="option-label">${option.label}</span>
      `;

      optionButton.addEventListener("click", () => {
        this.data.alignment = option.name;
        this.updateAlignment();
        menu.remove();
      });

      menu.appendChild(optionButton);
    });

    // Background toggle
    const backgroundButton = document.createElement("button");
    backgroundButton.classList.add("cloudinary-option-item");
    if (this.data.withBackground) {
      backgroundButton.classList.add("active");
    }

    backgroundButton.innerHTML = `
      <span class="option-icon">🎨</span>
      <span class="option-label">Background</span>
    `;

    backgroundButton.addEventListener("click", () => {
      this.data.withBackground = !this.data.withBackground;
      this.updateBackground();
      menu.remove();
    });

    menu.appendChild(backgroundButton);

    // Position menu near button
    const rect = button.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.top = rect.bottom + 5 + "px";
    menu.style.left = rect.left - 50 + "px";
    menu.style.zIndex = "1000";

    document.body.appendChild(menu);

    // Close menu when clicking outside
    setTimeout(() => {
      const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener("click", closeMenu);
        }
      };
      document.addEventListener("click", closeMenu);
    }, 0);
  }

  updateAlignment() {
    this.imageHolder.className = this.imageHolder.className.replace(
      /cloudinary-image--(?:left|center|right)\b/g,
      ""
    );
    this.imageHolder.classList.add(`cloudinary-image--${this.data.alignment}`);
  }

  updateBackground() {
    if (this.data.withBackground) {
      this.imageHolder.classList.add("cloudinary-image--with-background");
    } else {
      this.imageHolder.classList.remove("cloudinary-image--with-background");
    }
  }

  save() {
    return {
      url: this.data.url,
      caption: this.data.caption,
      withBackground: this.data.withBackground,
      alignment: this.data.alignment,
      width: this.data.width,
      height: this.data.height,
      customWidth: this.data.customWidth,
      publicId: this.data.publicId,
    };
  }

  renderSettings() {
    // No longer needed as options are now on-image
    return null;
  }

  onPaste(event) {
    const data = event.detail.data;

    if (data.tagName === "IMG") {
      // Handle pasted images - could implement URL-based import here
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
          href: true,
        },
        code: {},
        mark: {},
      },
      withBackground: {},
      alignment: {},
      width: {},
      height: {},
      customWidth: {},
      publicId: {},
    };
  }

  static get shortcut() {
    return "CMD+SHIFT+I";
  }
}

// Make it available globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = CloudinaryImage;
} else {
  window.CloudinaryImage = CloudinaryImage;
}
