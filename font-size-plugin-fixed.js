/**
 * Custom EditorJS Font Size Plugin
 * An inline tool for changing font size in EditorJS
 */
class FontSizeTool {
  constructor({ api, config }) {
    this.api = api;
    this.config = config || {};
    this.tag = "SPAN";
    this.class = "font-size-tool";

    // Default font sizes
    this.fontSizes = this.config.fontSizes || [
      { size: "12px", label: "Small" },
      { size: "14px", label: "Normal" },
      { size: "16px", label: "Medium" },
      { size: "18px", label: "Large" },
      { size: "20px", label: "Extra Large" },
      { size: "24px", label: "XXL" },
      { size: "28px", label: "XXXL" },
    ];

    this.defaultSize = this.config.defaultSize || "14px";
    this.button = null;
    this.state = false;
    this.currentFontSize = null;
    this.activeDropdown = null;
  }

  /**
   * Create Tool's button
   * @returns {HTMLElement}
   */
  render() {
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.innerHTML = this.getIcon();
    this.button.classList.add("ce-inline-tool", "ce-inline-tool--font-size");
    this.button.title = "Font Size";

    return this.button;
  }

  /**
   * Check if selection has font size applied
   * @param {Selection} selection
   * @returns {boolean}
   */
  checkState(selection) {
    const text = selection.anchorNode;

    if (!text) {
      this.state = false;
      this.currentFontSize = null;
      this.updateButtonState();
      return false;
    }

    const parentNode =
      text.nodeType === Node.TEXT_NODE ? text.parentNode : text;

    // Check if parent has font size styling
    const fontSizeInfo = this.checkForFontSize(parentNode);
    this.state = fontSizeInfo.hasSize;
    this.currentFontSize = fontSizeInfo.size;

    this.updateButtonState();

    return this.state;
  }

  /**
   * Update button visual state
   */
  updateButtonState() {
    if (this.state && this.currentFontSize) {
      this.button.classList.add("ce-inline-tool--active");
      this.button.title = `Font Size: ${this.currentFontSize}`;
    } else {
      this.button.classList.remove("ce-inline-tool--active");
      this.button.title = "Font Size";
    }
  }

  /**
   * Check if element has font size applied
   * @param {HTMLElement} element
   * @returns {Object} {hasSize: boolean, size: string|null}
   */
  checkForFontSize(element) {
    if (!element) return { hasSize: false, size: null };

    // Check if element has inline style font-size
    if (element.style && element.style.fontSize) {
      return { hasSize: true, size: element.style.fontSize };
    }

    // Check if element has font-size class
    if (element.classList && element.classList.contains(this.class)) {
      const computedStyle = window.getComputedStyle(element);
      return { hasSize: true, size: computedStyle.fontSize };
    }

    // Check parent elements
    if (element.parentElement) {
      return this.checkForFontSize(element.parentElement);
    }

    return { hasSize: false, size: null };
  }

  /**
   * Handle button click - always show dropdown
   * @param {Range} range
   */
  surround(range) {
    // Always show font size options, never toggle off
    this.showFontSizeOptions(range);
  }

  /**
   * Show font size dropdown
   * @param {Range} range
   */
  showFontSizeOptions(range) {
    // Close any existing dropdown
    if (this.activeDropdown) {
      this.activeDropdown.remove();
      this.activeDropdown = null;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (!selectedText) {
      return;
    }

    // Create dropdown
    const dropdown = document.createElement("div");
    dropdown.className = "font-size-dropdown";
    dropdown.style.cssText = `
      position: fixed;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      z-index: 10000;
      min-width: 140px;
      padding: 8px 0;
      font-family: "Montserrat", sans-serif;
    `;

    // Position dropdown relative to button
    const buttonRect = this.button.getBoundingClientRect();
    dropdown.style.left = buttonRect.left + "px";
    dropdown.style.top = buttonRect.bottom + 8 + "px";

    // Add font size options
    this.fontSizes.forEach((fontSizeOption) => {
      const option = document.createElement("div");
      option.className = "font-size-option";
      option.textContent =
        fontSizeOption.label + " (" + fontSizeOption.size + ")";
      option.style.cssText = `
        padding: 10px 16px;
        cursor: pointer;
        font-size: ${fontSizeOption.size};
        transition: background-color 0.2s;
        border-bottom: 1px solid #f5f5f5;
      `;

      // Highlight current font size
      if (this.currentFontSize === fontSizeOption.size) {
        option.style.backgroundColor = "#e3f2fd";
        option.style.fontWeight = "bold";
      }

      option.addEventListener("mouseenter", () => {
        if (this.currentFontSize !== fontSizeOption.size) {
          option.style.backgroundColor = "#f8f9fa";
        }
      });

      option.addEventListener("mouseleave", () => {
        if (this.currentFontSize !== fontSizeOption.size) {
          option.style.backgroundColor = "transparent";
        }
      });

      option.addEventListener("click", () => {
        this.applyFontSize(range, fontSizeOption.size);
        dropdown.remove();
        this.activeDropdown = null;
      });

      dropdown.appendChild(option);
    });

    // Remove last border
    const lastOption = dropdown.querySelector(".font-size-option:last-child");
    if (lastOption) {
      lastOption.style.borderBottom = "none";
    }

    document.body.appendChild(dropdown);
    this.activeDropdown = dropdown;

    // Remove dropdown when clicking outside
    const removeDropdown = (e) => {
      if (!dropdown.contains(e.target) && e.target !== this.button) {
        dropdown.remove();
        this.activeDropdown = null;
        document.removeEventListener("click", removeDropdown);
      }
    };

    // Add slight delay to prevent immediate closing
    setTimeout(() => {
      document.addEventListener("click", removeDropdown);
    }, 100);
  }

  /**
   * Apply font size to selection
   * @param {Range} range
   * @param {string} fontSize
   */
  applyFontSize(range, fontSize) {
    const selectedText = range.extractContents();

    if (selectedText.textContent.length === 0) {
      return;
    }

    // Remove existing font size if any
    this.removeExistingFontSize(selectedText);

    // Create span with font size
    const span = document.createElement(this.tag);
    span.classList.add(this.class);
    span.style.fontSize = fontSize;
    span.appendChild(selectedText);

    range.insertNode(span);

    // Update state
    this.state = true;
    this.currentFontSize = fontSize;
    this.updateButtonState();

    // Clear selection and set cursor after the span
    const selection = window.getSelection();
    selection.removeAllRanges();

    const newRange = document.createRange();
    newRange.setStartAfter(span);
    newRange.collapse(true);
    selection.addRange(newRange);
  }

  /**
   * Remove existing font size from content
   * @param {DocumentFragment} content
   */
  removeExistingFontSize(content) {
    const spans = content.querySelectorAll("span.font-size-tool");
    spans.forEach((span) => {
      span.style.fontSize = "";
      span.classList.remove(this.class);
      if (!span.style.cssText && span.classList.length === 0) {
        const parent = span.parentNode;
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
      }
    });
  }

  /**
   * Get tool icon
   * @returns {string}
   */
  getIcon() {
    return `
      <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_3233_160)">
          <path d="M12.5 18C12.5 18.1326 12.4473 18.2598 12.3536 18.3536C12.2598 18.4473 12.1326 18.5 12 18.5H6C5.86739 18.5 5.74021 18.4473 5.64645 18.3536C5.55268 18.2598 5.5 18.1326 5.5 18C5.5 17.8674 5.55268 17.7402 5.64645 17.6464C5.74021 17.5527 5.86739 17.5 6 17.5H8.5V2.5H2.5V4C2.5 4.13261 2.44732 4.25979 2.35355 4.35355C2.25979 4.44732 2.13261 4.5 2 4.5C1.86739 4.5 1.74021 4.44732 1.64645 4.35355C1.55268 4.25979 1.5 4.13261 1.5 4V2C1.5 1.86739 1.55268 1.74021 1.64645 1.64645C1.74021 1.55268 1.86739 1.5 2 1.5H16C16.1326 1.5 16.2598 1.55268 16.3536 1.64645C16.4473 1.74021 16.5 1.86739 16.5 2V4C16.5 4.13261 16.4473 4.25979 16.3536 4.35355C16.2598 4.44732 16.1326 4.5 16 4.5C15.8674 4.5 15.7402 4.44732 15.6464 4.35355C15.5527 4.25979 15.5 4.13261 15.5 4V2.5H9.5V17.5H12C12.1326 17.5 12.2598 17.5527 12.3536 17.6464C12.4473 17.7402 12.5 17.8674 12.5 18ZM22 9.5H14C13.8674 9.5 13.7402 9.55268 13.6464 9.64645C13.5527 9.74021 13.5 9.86739 13.5 10V11C13.5 11.1326 13.5527 11.2598 13.6464 11.3536C13.7402 11.4473 13.8674 11.5 14 11.5C14.1326 11.5 14.2598 11.4473 14.3536 11.3536C14.4473 11.2598 14.5 11.1326 14.5 11V10.5H17.5V17.5H16C15.8674 17.5 15.7402 17.5527 15.6464 17.6464C15.5527 17.7402 15.5 17.8674 15.5 18C15.5 18.1326 15.5527 18.2598 15.6464 18.3536C15.7402 18.4473 15.8674 18.5 16 18.5H20C20.1326 18.5 20.2598 18.4473 20.3536 18.3536C20.4473 18.2598 20.5 18.1326 20.5 18C20.5 17.8674 20.4473 17.7402 20.3536 17.6464C20.2598 17.5527 20.1326 17.5 20 17.5H18.5V10.5H21.5V11C21.5 11.1326 21.5527 11.2598 21.6464 11.3536C21.7402 11.4473 21.8674 11.5 22 11.5C22.1326 11.5 22.2598 11.4473 22.3536 11.3536C22.4473 11.2598 22.5 11.1326 22.5 11V10C22.5 9.86739 22.4473 9.74021 22.3536 9.64645C22.2598 9.55268 22.1326 9.5 22 9.5Z" fill="currentColor"/>
        </g>
        <defs>
          <clipPath id="clip0_3233_160">
            <rect width="24" height="20" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    `;
  }

  /**
   * Tool's shortcut
   * @returns {string}
   */
  static get shortcut() {
    return "CMD+SHIFT+F";
  }

  /**
   * Identify this as an inline tool
   * @returns {boolean}
   */
  static get isInline() {
    return true;
  }

  /**
   * Tool's sanitize config
   * @returns {Object}
   */
  static get sanitize() {
    return {
      span: {
        class: "font-size-tool",
        style: true,
      },
    };
  }
}

// Make it available globally
window.FontSizeTool = FontSizeTool;
