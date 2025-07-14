/**
 * Line Separator Tool for Editor.js
 * Customizable line separator with multiple styles and interactive settings panel
 */
class LineSeparator {
  /**
   * Get Tool title
   * @returns {string}
   */
  static get toolbox() {
    return {
      title: "Separator",
      icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 10h16M2 6h16M2 14h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    };
  }

  /**
   * Render plugin HTML
   * @returns {HTMLElement}
   */
  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("line-separator-tool");

    // Create the line element
    this.line = document.createElement("div");
    this.line.classList.add("line-separator-line");

    // Set initial style
    const style = this.data && this.data.style ? this.data.style : "default";
    this.line.classList.add(`style-${style}`);

    // Create settings panel
    this.settingsPanel = this.createSettingsPanel();

    this.wrapper.appendChild(this.line);
    this.wrapper.appendChild(this.settingsPanel);

    return this.wrapper;
  }

  /**
   * Create the settings panel
   * @returns {HTMLElement}
   */
  createSettingsPanel() {
    const panel = document.createElement("div");
    panel.classList.add("line-separator-settings");

    const title = document.createElement("div");
    title.classList.add("line-separator-settings-title");
    title.textContent = "Separator Style";

    const grid = document.createElement("div");
    grid.classList.add("line-separator-style-grid");

    const styles = [
      { key: "default", label: "Default" },
      { key: "solid", label: "Solid" },
      { key: "dashed", label: "Dashed" },
      { key: "dotted", label: "Dotted" },
      { key: "thick", label: "Thick" },
      { key: "double", label: "Double" },
      { key: "wavy", label: "Wavy" },
      { key: "gradient", label: "Gradient" },
      { key: "shadow", label: "Shadow" },
    ];

    styles.forEach((styleData) => {
      const option = document.createElement("div");
      option.classList.add("line-separator-style-option");

      // Check if this is the current style
      const currentStyle =
        this.data && this.data.style ? this.data.style : "default";
      if (styleData.key === currentStyle) {
        option.classList.add("active");
      }

      const preview = document.createElement("div");
      preview.classList.add("line-separator-style-preview");
      if (styleData.key !== "default") {
        preview.classList.add(styleData.key);
      }

      const label = document.createElement("div");
      label.textContent = styleData.label;

      option.appendChild(preview);
      option.appendChild(label);

      // Add click handler
      option.addEventListener("click", () => this.changeStyle(styleData.key));

      grid.appendChild(option);
    });

    panel.appendChild(title);
    panel.appendChild(grid);

    return panel;
  }

  /**
   * Change the separator style
   * @param {string} newStyle - The new style to apply
   */
  changeStyle(newStyle) {
    // Remove all existing style classes
    const styleClasses = [
      "style-default",
      "style-solid",
      "style-dashed",
      "style-dotted",
      "style-thick",
      "style-double",
      "style-wavy",
      "style-gradient",
      "style-shadow",
    ];

    styleClasses.forEach((className) => {
      this.line.classList.remove(className);
    });

    // Add the new style class
    this.line.classList.add(`style-${newStyle}`);

    // Update active option in settings panel
    const options = this.settingsPanel.querySelectorAll(
      ".line-separator-style-option"
    );
    options.forEach((option, index) => {
      option.classList.remove("active");
      if (index === this.getStyleIndex(newStyle)) {
        option.classList.add("active");
      }
    });

    // Update data
    this.data = { style: newStyle };

    // Trigger change event for Editor.js
    if (this.api && this.api.blocks) {
      this.api.blocks.getBlockIndex(this.api.blocks.getCurrentBlockIndex());
    }
  }

  /**
   * Get the index of a style in the styles array
   * @param {string} style - The style key
   * @returns {number}
   */
  getStyleIndex(style) {
    const styles = [
      "default",
      "solid",
      "dashed",
      "dotted",
      "thick",
      "double",
      "wavy",
      "gradient",
      "shadow",
    ];
    return styles.indexOf(style);
  }

  /**
   * Return Tool's view
   * @returns {HTMLElement}
   */
  save() {
    return {
      style: this.data && this.data.style ? this.data.style : "default",
    };
  }

  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      style: {},
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
   * Default placeholder for the Tool's input
   * @returns {string}
   */
  static get placeholder() {
    return "";
  }

  /**
   * Automatic sanitize config
   */
  static get pasteConfig() {
    return {
      tags: ["DIV"],
      attributes: {
        class: ["line-separator-tool", "line-separator-line"],
      },
    };
  }

  /**
   * Shortcut for the tool
   * @returns {string}
   */
  static get shortcut() {
    return "CMD+SHIFT+L";
  }
}

// Make the class available globally
window.LineSeparator = LineSeparator;
