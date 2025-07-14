/**
 * Web Bookmark Tool for Editor.js
 * Creates visual bookmarks from URLs by fetching metadata
 */
class WebBookmark {
  /**
   * Get Tool title
   * @returns {string}
   */
  static get toolbox() {
    return {
      title: "Web Bookmark",
      icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M3 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H5z"/><path fill="currentColor" d="M6 6h8v1H6V6zm0 2h8v1H6V8zm0 2h5v1H6v-1z"/></svg>',
    };
  }

  /**
   * Constructor
   * @param {object} options - Tool's initial config
   * @param {EditorAPI} options.api - Editor.js API
   * @param {object} options.config - Tool's initial config
   * @param {object} options.data - Previously saved data
   */
  constructor({ data, config, api }) {
    this.api = api;
    this.data = data || {};
    this.config = config || {};
    this.wrapper = null;
    this.isLoading = false;
  }

  /**
   * Render plugin HTML
   * @returns {HTMLElement}
   */
  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("web-bookmark-tool");

    if (this.data && this.data.url) {
      this.renderBookmark();
    } else {
      this.renderInputForm();
    }

    return this.wrapper;
  }

  /**
   * Render the input form for URL entry
   */
  renderInputForm() {
    this.wrapper.innerHTML = `
      <div class="web-bookmark-input-form">
        <div class="web-bookmark-input-wrapper">
          <input 
            type="url" 
            class="web-bookmark-input" 
            placeholder="Enter URL (https://example.com)"
            value=""
          />
          <button class="web-bookmark-submit">Add Bookmark</button>
        </div>
      </div>
    `;

    const input = this.wrapper.querySelector(".web-bookmark-input");
    const button = this.wrapper.querySelector(".web-bookmark-submit");

    button.addEventListener("click", () => this.handleSubmit());
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleSubmit();
      }
    });

    // Focus the input
    setTimeout(() => input.focus(), 100);
  }

  /**
   * Handle form submission
   */
  async handleSubmit() {
    const input = this.wrapper.querySelector(".web-bookmark-input");
    const button = this.wrapper.querySelector(".web-bookmark-submit");
    const url = input.value.trim();

    if (!url) {
      this.showError("Please enter a valid URL");
      return;
    }

    if (!this.isValidUrl(url)) {
      this.showError(
        "Please enter a valid URL starting with http:// or https://"
      );
      return;
    }

    button.disabled = true;
    button.textContent = "Loading...";
    this.showLoading();

    try {
      const metadata = await this.fetchMetadata(url);
      this.data = {
        url: url,
        title: metadata.title || "Untitled",
        description: metadata.description || "",
        image: metadata.image || "",
        favicon: metadata.favicon || "",
        domain: this.extractDomain(url),
      };
      this.renderBookmark();
    } catch (error) {
      console.error("Error fetching metadata:", error);
      this.showError(
        "Unable to fetch website data. Using basic information from URL.",
        url
      );
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.wrapper.innerHTML = `
      <div class="web-bookmark-loading">
        <div class="web-bookmark-loading-spinner"></div>
        <div>Fetching website information...</div>
      </div>
    `;
  }

  /**
   * Validate URL format
   * @param {string} url
   * @returns {boolean}
   */
  isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  }

  /**
   * Extract domain from URL
   * @param {string} url
   * @returns {string}
   */
  extractDomain(url) {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "";
    }
  }

  /**
   * Fetch metadata from URL using multiple CORS proxy services with fallbacks
   * @param {string} url
   * @returns {Promise<object>}
   */
  async fetchMetadata(url) {
    // List of CORS proxy services to try in order
    const proxies = [
      {
        name: "allorigins",
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        parse: (data) => data.contents,
      },
      {
        name: "corsproxy",
        url: `https://corsproxy.io/?${encodeURIComponent(url)}`,
        parse: (data) => data,
      },
      {
        name: "cors-anywhere-heroku",
        url: `https://cors-anywhere.herokuapp.com/${url}`,
        parse: (data) => data,
      },
      {
        name: "thingproxy",
        url: `https://thingproxy.freeboard.io/fetch/${url}`,
        parse: (data) => data,
      },
    ];

    for (const proxy of proxies) {
      try {
        console.log(`Trying ${proxy.name} proxy...`);
        const response = await fetch(proxy.url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        let content;
        if (proxy.name === "allorigins") {
          const data = await response.json();
          content = proxy.parse(data);
        } else {
          content = await response.text();
        }

        if (!content) {
          throw new Error("No content received");
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");

        const metadata = this.extractMetaData(doc, url);
        console.log(`Successfully fetched metadata using ${proxy.name}`);
        return metadata;
      } catch (error) {
        console.warn(`${proxy.name} proxy failed:`, error.message);
        continue;
      }
    }

    // All proxies failed, try Open Graph API as a last resort
    try {
      console.log("Trying OpenGraph API...");
      const ogResponse = await fetch(
        `https://opengraph.io/api/1.1/site/${encodeURIComponent(
          url
        )}?app_id=your_app_id`
      );
      const ogData = await ogResponse.json();

      if (ogData.hybridGraph) {
        return {
          title: ogData.hybridGraph.title || this.extractDomain(url),
          description: ogData.hybridGraph.description || "",
          image: ogData.hybridGraph.image || "",
          favicon:
            ogData.hybridGraph.favicon || `${new URL(url).origin}/favicon.ico`,
        };
      }
    } catch (error) {
      console.warn("OpenGraph API failed:", error.message);
    }

    // Final fallback: create basic metadata from URL analysis
    console.log("All services failed, creating basic metadata...");
    return this.createFallbackMetadata(url);
  }

  /**
   * Create fallback metadata when all services fail
   * @param {string} url
   * @returns {object}
   */
  createFallbackMetadata(url) {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace("www.", "");

    // Extract potential title from URL path
    let title = domain;
    const path = urlObj.pathname;
    if (path && path !== "/") {
      const pathParts = path.split("/").filter((part) => part);
      if (pathParts.length > 0) {
        // Use the last part of the path as potential title
        const lastPart = pathParts[pathParts.length - 1];
        title = lastPart.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, ""); // Remove extension
        title = title.charAt(0).toUpperCase() + title.slice(1); // Capitalize
      }
    }

    return {
      title: title || domain,
      description: `Visit ${domain}`,
      image: "",
      favicon: `${urlObj.origin}/favicon.ico`,
    };
  }

  /**
   * Extract metadata from HTML document
   * @param {Document} doc
   * @param {string} url
   * @returns {object}
   */
  extractMetaData(doc, url) {
    const getMetaContent = (selectors) => {
      for (const selector of selectors) {
        const element = doc.querySelector(selector);
        if (element) {
          return element.getAttribute("content") || element.textContent;
        }
      }
      return "";
    };

    const title =
      getMetaContent([
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
        "title",
      ]) || "Untitled";

    const description = getMetaContent([
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ]);

    let image = getMetaContent([
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'meta[name="twitter:image:src"]',
    ]);

    // Make image URL absolute if it's relative
    if (image && !image.startsWith("http")) {
      const baseUrl = new URL(url);
      image = new URL(image, baseUrl.origin).href;
    }

    const favicon = this.findFavicon(doc, url);

    return {
      title: title.trim(),
      description: description.trim(),
      image: image,
      favicon: favicon,
    };
  }

  /**
   * Find favicon URL
   * @param {Document} doc
   * @param {string} url
   * @returns {string}
   */
  findFavicon(doc, url) {
    const faviconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
    ];

    for (const selector of faviconSelectors) {
      const link = doc.querySelector(selector);
      if (link) {
        const href = link.getAttribute("href");
        if (href) {
          return href.startsWith("http") ? href : new URL(href, url).href;
        }
      }
    }

    // Fallback to default favicon
    return `${new URL(url).origin}/favicon.ico`;
  }

  /**
   * Render the bookmark card
   */
  renderBookmark() {
    const { url, title, description, image, favicon, domain } = this.data;

    this.wrapper.innerHTML = `
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="web-bookmark-content">
        <div class="web-bookmark-text">
          <h3 class="web-bookmark-title">${this.escapeHtml(title)}</h3>
          ${
            description
              ? `<p class="web-bookmark-description">${this.escapeHtml(
                  description
                )}</p>`
              : ""
          }
          <div class="web-bookmark-meta">
            ${
              favicon
                ? `<img src="${favicon}" alt="" class="web-bookmark-favicon" onerror="this.style.display='none'">`
                : ""
            }
            <span class="web-bookmark-url">${domain || url}</span>
          </div>
        </div>
        ${this.renderImage(image)}
      </a>
    `;

    // Temporarily disable settings panel to debug
    // <div class="web-bookmark-settings">
    //   <div class="web-bookmark-settings-item" data-action="edit">Edit URL</div>
    //   <div class="web-bookmark-settings-item" data-action="remove">Remove</div>
    // </div>

    // Temporarily disable settings functionality to debug
    // Add settings functionality
    // const settings = this.wrapper.querySelectorAll('.web-bookmark-settings-item');
    // settings.forEach(item => {
    //   item.addEventListener('click', (e) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     const action = item.getAttribute('data-action');
    //     if (action === 'edit') {
    //       this.editBookmark();
    //     } else if (action === 'remove') {
    //       this.removeBookmark();
    //     }
    //   });
    // });
  }

  /**
   * Render image or placeholder
   * @param {string} imageUrl
   * @returns {string}
   */
  renderImage(imageUrl) {
    if (imageUrl) {
      return `<img src="${imageUrl}" alt="" class="web-bookmark-image" onerror="this.outerHTML='${this.getPlaceholderImage()}`;
    }
    return this.getPlaceholderImage();
  }

  /**
   * Get placeholder image HTML
   * @returns {string}
   */
  getPlaceholderImage() {
    return `
      <div class="web-bookmark-image-placeholder">
      </div>
    `;
  }

  /**
   * Edit bookmark URL
   */
  editBookmark() {
    this.data = {};
    this.renderInputForm();
  }

  /**
   * Remove bookmark
   */
  removeBookmark() {
    if (this.api.blocks) {
      const currentBlockIndex = this.api.blocks.getCurrentBlockIndex();
      this.api.blocks.delete(currentBlockIndex);
    }
  }

  /**
   * Show error message with option to use basic bookmark
   * @param {string} message
   * @param {string} url - URL to create basic bookmark for
   */
  showError(message, url = null) {
    this.wrapper.innerHTML = `
      <div class="web-bookmark-error">
        <div class="web-bookmark-error-title">Notice</div>
        <div>${message}</div>
        ${
          url
            ? `
          <button class="web-bookmark-retry" data-action="basic">Create Basic Bookmark</button>
          <button class="web-bookmark-retry" data-action="retry">Try Again</button>
        `
            : `
          <button class="web-bookmark-retry" data-action="retry">Try Again</button>
        `
        }
      </div>
    `;

    const buttons = this.wrapper.querySelectorAll(".web-bookmark-retry");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.getAttribute("data-action");
        if (action === "basic" && url) {
          // Create basic bookmark with fallback metadata
          const metadata = this.createFallbackMetadata(url);
          this.data = {
            url: url,
            title: metadata.title,
            description: metadata.description,
            image: metadata.image,
            favicon: metadata.favicon,
            domain: this.extractDomain(url),
          };
          this.renderBookmark();
        } else {
          this.renderInputForm();
        }
      });
    });
  }

  /**
   * Escape HTML characters
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Save tool data
   * @returns {object}
   */
  save() {
    return this.data;
  }

  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      url: {},
      title: {},
      description: {},
      image: {},
      favicon: {},
      domain: {},
    };
  }

  /**
   * Skip empty blocks
   * @returns {boolean}
   */
  static get isEmpty() {
    return false;
  }

  /**
   * Allow to press Enter inside the plugin
   * @returns {boolean}
   */
  static get enableLineBreaks() {
    return false;
  }

  /**
   * Automatic sanitize config
   */
  static get pasteConfig() {
    return {
      tags: ["A", "DIV", "H3", "P", "IMG", "SPAN"],
      attributes: {
        a: ["href", "target", "rel"],
        img: ["src", "alt"],
        div: ["class"],
        span: ["class"],
      },
    };
  }

  /**
   * Shortcut for the tool
   * @returns {string}
   */
  static get shortcut() {
    return "CMD+SHIFT+B";
  }
}

// Make the class available globally
window.WebBookmark = WebBookmark;
