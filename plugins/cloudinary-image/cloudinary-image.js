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
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.14023 11.2131C7.15743 11.2131 7.1739 11.22 7.18598 11.2322L9.3487 13.3969C9.36655 13.4152 9.3718 13.4424 9.36208 13.4661C9.35235 13.4897 9.32953 13.5054 9.30393 13.5059H8.75108C8.71528 13.5059 8.68595 13.5343 8.6849 13.5701V18.4367C8.68568 18.7448 8.80813 19.04 9.02558 19.2582L9.3487 19.5814C9.36655 19.5997 9.3718 19.6269 9.36208 19.6506C9.35235 19.6742 9.32953 19.6899 9.30393 19.6904H6.75383C6.10878 19.6904 5.58585 19.1675 5.58585 18.5224V13.5701C5.58585 13.5347 5.55708 13.5059 5.5216 13.5059H4.97655C4.9506 13.5062 4.92705 13.4908 4.91685 13.467C4.90663 13.4431 4.91175 13.4155 4.92983 13.3969L7.0945 11.2322C7.10658 11.22 7.12305 11.2131 7.14023 11.2131ZM11.9232 12.4667C11.9404 12.4667 11.9568 12.4736 11.9689 12.4859L14.1336 14.6427C14.1517 14.6613 14.1568 14.689 14.1466 14.7128C14.1363 14.7367 14.1128 14.752 14.0869 14.7517H13.534C13.4982 14.7528 13.4698 14.7821 13.4698 14.8179V18.4367C13.47 18.7445 13.5918 19.0397 13.8085 19.2582L14.1336 19.5814C14.1517 19.6 14.1568 19.6276 14.1466 19.6515C14.1363 19.6753 14.1128 19.6907 14.0869 19.6904H11.5426C10.8975 19.6904 10.3746 19.1675 10.3746 18.5224V14.8218C10.3746 14.786 10.3462 14.7567 10.3104 14.7556H9.75945C9.73388 14.7551 9.71103 14.7395 9.7013 14.7158C9.6916 14.6922 9.69685 14.665 9.71468 14.6466L11.8774 12.4859C11.8895 12.4736 11.906 12.4667 11.9232 12.4667ZM16.707 13.7069C16.7239 13.7069 16.7401 13.7137 16.7518 13.7259L18.9165 15.8886C18.9357 15.9067 18.9418 15.9348 18.932 15.9593C18.9221 15.9839 18.8982 15.9998 18.8717 15.9995H18.3169C18.2814 15.9995 18.2527 16.0283 18.2527 16.0638V18.4367C18.2534 18.7448 18.3759 19.04 18.5933 19.2582L18.9165 19.5814C18.9343 19.5997 18.9396 19.6269 18.9298 19.6506C18.9201 19.6742 18.8973 19.6899 18.8717 19.6904H16.3197C15.6746 19.6904 15.1517 19.1675 15.1517 18.5224V16.0638C15.1517 16.0283 15.1229 15.9995 15.0874 15.9995H14.5424C14.5159 15.9998 14.492 15.9839 14.4821 15.9593C14.4722 15.9348 14.4784 15.9067 14.4976 15.8886L16.6623 13.7259C16.674 13.7137 16.6902 13.7069 16.707 13.7069ZM11.8794 4.30969C15.2796 4.33444 18.2785 6.54242 19.3116 9.78197C21.8368 10.1115 23.7316 12.2539 23.75 14.8004C23.75 16.9022 22.4356 18.6487 20.3133 19.3758L20.2344 19.4023L20.137 19.4334V17.8644C21.4861 17.296 22.2783 16.1728 22.2783 14.8004C22.2714 12.8638 20.7378 11.2825 18.8103 11.2088L18.7452 11.2069H18.1612L18.021 10.6502C17.3331 7.81079 14.8008 5.80417 11.8794 5.78354C9.47553 5.77202 7.28033 7.13794 6.22688 9.29299L6.0102 9.73914L5.60143 9.78197C3.75515 9.97947 2.23916 11.3299 1.83036 13.1411C1.42739 14.9265 2.18823 16.7695 3.72565 17.7522L3.79298 17.7944V19.449H3.78325L3.63725 19.3828C1.32813 18.3213 -0.0244409 15.8835 0.296928 13.3624C0.618298 10.8414 2.5392 8.82089 5.04078 8.37259C6.3923 5.85667 9.02345 4.29357 11.8794 4.30969Z" fill="black"/>
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
