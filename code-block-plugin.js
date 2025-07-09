/**
 * Code Block Tool for Editor.js
 * A block tool for creating syntax-highlighted code blocks with language selection and copy functionality
 */
class CodeBlock {
  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.config = config || {};
    this.readOnly = readOnly;

    this.data = {
      code: data.code || "",
      language: data.language || "javascript",
    };

    // Supported languages for syntax highlighting
    this.supportedLanguages = [
      { value: "javascript", label: "JavaScript" },
      { value: "python", label: "Python" },
      { value: "java", label: "Java" },
      { value: "cpp", label: "C++" },
      { value: "c", label: "C" },
      { value: "csharp", label: "C#" },
      { value: "php", label: "PHP" },
      { value: "ruby", label: "Ruby" },
      { value: "go", label: "Go" },
      { value: "rust", label: "Rust" },
      { value: "typescript", label: "TypeScript" },
      { value: "html", label: "HTML" },
      { value: "css", label: "CSS" },
      { value: "scss", label: "SCSS" },
      { value: "json", label: "JSON" },
      { value: "xml", label: "XML" },
      { value: "yaml", label: "YAML" },
      { value: "markdown", label: "Markdown" },
      { value: "bash", label: "Bash" },
      { value: "shell", label: "Shell" },
      { value: "sql", label: "SQL" },
      { value: "plaintext", label: "Plain Text" },
    ];

    this.wrapper = null;
    this.textarea = null;
    this.languageSelect = null;
    this.highlightedCode = null;
  }

  /**
   * Get Tool toolbox settings
   * Icon and title for displaying at the Toolbox
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      title: "Code Block",
      icon: `<svg width="66" height="42" viewBox="0 0 66 42" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M37.0938 0.421875L25.0938 40.4219L28.9062 41.5781L40.9062 1.57812L37.0938 0.421875ZM17.625 4.54688L1.625 19.5469L0.0625 21.0156L1.625 22.4531L17.625 37.4531L20.375 34.5469L5.9375 21.0156L20.375 7.45312L17.625 4.54688ZM48.375 4.54688L45.625 7.45312L60.0625 21.0156L45.625 34.5469L48.375 37.4531L64.375 22.4531L65.9375 21.0156L64.375 19.5469L48.375 4.54688Z" fill="black"/>
</svg>
`,
    };
  }

  /**
   * Return Tool's view
   * @returns {HTMLDivElement}
   */
  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("code-block-tool");

    // Create header with language selector and copy button
    const header = document.createElement("div");
    header.classList.add("code-block-header");

    // Language selector
    this.languageSelect = document.createElement("select");
    this.languageSelect.classList.add("code-block-language-select");
    this.supportedLanguages.forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang.value;
      option.textContent = lang.label;
      option.selected = lang.value === this.data.language;
      this.languageSelect.appendChild(option);
    });

    this.languageSelect.addEventListener("change", () => {
      this.data.language = this.languageSelect.value;
      this.highlightCode();
    });

    // Copy button
    const copyButton = document.createElement("button");
    copyButton.classList.add("code-block-copy-btn");
    copyButton.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M22.087 0C9.89457 0 0 9.89457 0 22.087V45.3366C0 57.5291 9.89457 67.4236 22.087 67.4236V60.4488C13.7334 60.4488 6.97486 53.6902 6.97486 45.3366V22.087C6.97486 13.7334 13.7334 6.97486 22.087 6.97486H45.3366C53.6902 6.97486 60.4488 13.7334 60.4488 22.087H67.4236C67.4236 9.89457 57.5291 0 45.3366 0H22.087ZM54.6634 32.5764C42.4709 32.5764 32.5764 42.4709 32.5764 54.6634V77.913C32.5764 90.1054 42.4709 100 54.6634 100H77.913C90.1054 100 100 90.1054 100 77.913V54.6634C100 42.4709 90.1054 32.5764 77.913 32.5764H54.6634ZM39.5512 54.6634C39.5512 46.3098 46.3098 39.5512 54.6634 39.5512H77.913C86.2666 39.5512 93.0251 46.3098 93.0251 54.6634V77.913C93.0251 86.2666 86.2666 93.0251 77.913 93.0251H54.6634C46.3098 93.0251 39.5512 86.2666 39.5512 77.913V54.6634Z" fill="currentColor"/>
      </svg>
    `;
    copyButton.title = "Copy code";
    copyButton.addEventListener("click", () => this.copyCode());

    header.appendChild(this.languageSelect);
    header.appendChild(copyButton);

    // Create code container
    const codeContainer = document.createElement("div");
    codeContainer.classList.add("code-block-container");

    // Create textarea for editing
    this.textarea = document.createElement("textarea");
    this.textarea.classList.add("code-block-textarea");
    this.textarea.placeholder = "Enter your code here...";
    this.textarea.value = this.data.code;
    this.textarea.addEventListener("input", () => {
      this.data.code = this.textarea.value;
      this.highlightCode();
    });

    this.textarea.addEventListener("scroll", () => {
      // Sync scroll position with highlighted code
      if (this.highlightedCode) {
        this.highlightedCode.scrollTop = this.textarea.scrollTop;
        this.highlightedCode.scrollLeft = this.textarea.scrollLeft;
      }
    });

    this.textarea.addEventListener("keydown", (e) => {
      // Handle tab key for indentation
      if (e.key === "Tab") {
        e.preventDefault();
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;

        this.textarea.value =
          this.textarea.value.substring(0, start) +
          "  " +
          this.textarea.value.substring(end);

        this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
        this.data.code = this.textarea.value;
        this.highlightCode();
      }
    });

    // Create pre element for highlighted code
    this.highlightedCode = document.createElement("pre");
    this.highlightedCode.classList.add("code-block-highlighted");

    codeContainer.appendChild(this.textarea);
    codeContainer.appendChild(this.highlightedCode);

    // Add resize observer to handle manual resizing
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { height } = entry.contentRect;
          if (this.textarea && this.highlightedCode) {
            this.textarea.style.height = height + "px";
            this.highlightedCode.style.height = height + "px";
          }
        }
      });
      resizeObserver.observe(codeContainer);
    }

    this.wrapper.appendChild(header);
    this.wrapper.appendChild(codeContainer);

    // Initial highlight
    this.highlightCode();

    return this.wrapper;
  }

  /**
   * Highlight the code using highlight.js
   */
  highlightCode() {
    if (typeof hljs !== "undefined" && this.highlightedCode) {
      // Clear previous content
      this.highlightedCode.innerHTML = "";

      const codeElement = document.createElement("code");
      codeElement.textContent = this.data.code || "";

      // Set language class for highlight.js
      if (this.data.language && this.data.language !== "plaintext") {
        codeElement.className = `language-${this.data.language}`;
      }

      this.highlightedCode.appendChild(codeElement);

      // Apply syntax highlighting
      try {
        if (this.data.code && this.data.code.trim()) {
          hljs.highlightElement(codeElement);
        }
      } catch (error) {
        console.warn("Highlight.js error:", error);
      }

      // Sync height between textarea and highlighted code
      this.syncHeight();
    }
  }

  /**
   * Sync height between textarea and highlighted code container
   */
  syncHeight() {
    if (this.textarea && this.highlightedCode) {
      // Get the container height (for manual resize) or calculate from content
      const container = this.wrapper.querySelector(".code-block-container");
      let targetHeight;

      if (container && container.style.height) {
        // Use manually resized height
        targetHeight = parseInt(container.style.height);
      } else {
        // Calculate height based on content
        const lines = (this.data.code || "").split("\n").length;
        const lineHeight = 18.2; // 13px font-size * 1.4 line-height
        const padding = 24; // 12px top + 12px bottom
        const minHeight = 100;

        targetHeight = Math.max(minHeight, lines * lineHeight + padding);
        container.style.height = targetHeight + "px";
      }

      // Set both elements to the calculated height
      this.textarea.style.height = targetHeight + "px";
      this.highlightedCode.style.height = targetHeight + "px";
    }
  }

  /**
   * Copy code to clipboard
   */
  async copyCode() {
    try {
      await navigator.clipboard.writeText(this.data.code);

      // Show feedback
      const copyBtn = this.wrapper.querySelector(".code-block-copy-btn");
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      copyBtn.classList.add("copied");

      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.classList.remove("copied");
      }, 1500);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  }

  /**
   * Extract Tool's data from the view
   * @param {HTMLDivElement} blockContent - Tool's wrapper
   * @returns {CodeBlockData} - saved data
   */
  save(blockContent) {
    return {
      code: this.data.code,
      language: this.data.language,
    };
  }

  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      code: false, // Allow all content in code
      language: false,
    };
  }

  /**
   * Allow Code Block to be converted to/from other blocks
   */
  static get conversionConfig() {
    return {
      export: "code", // use 'code' property for other blocks
      import: "code", // fill 'code' property from other block's export string
    };
  }

  /**
   * Tool's CSS classes
   */
  get CSS() {
    return {
      wrapper: "code-block-tool",
      header: "code-block-header",
      container: "code-block-container",
      textarea: "code-block-textarea",
      highlighted: "code-block-highlighted",
      languageSelect: "code-block-language-select",
      copyBtn: "code-block-copy-btn",
    };
  }
}

// Make sure the class is globally available
window.CodeBlock = CodeBlock;
