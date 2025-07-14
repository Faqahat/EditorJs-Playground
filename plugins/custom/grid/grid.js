/**
 * Grid Tool for Edi    this.data = {
      columns: data.columns || 2,
      items: data.items || [],
      columnWidths: data.columnWidths || [] // Store custom column widths
    };js
 * Creates clean grid layouts with nested Editor.js blocks
 */
class GridTool {
  static get isInline() {
    return false;
  }

  static get toolbox() {
    return {
      title: "Grid",
      icon: `<svg width="17" height="17" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="6" height="14" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <rect x="9" y="1" width="6" height="14" stroke="currentColor" stroke-width="1.5" fill="none"/>
      </svg>`,
    };
  }

  constructor({ data, config, api, block }) {
    this.api = api;
    this.config = config || {};
    this.block = block;

    this.data = {
      columns: data.columns || 2,
      items: data.items || [],
      columnWidths: data.columnWidths || [], // Store custom column widths
    };

    // Initialize items if empty
    if (this.data.items.length === 0) {
      for (let i = 0; i < this.data.columns; i++) {
        this.data.items.push({
          blocks: [],
        });
      }
    }

    this.wrapper = null;
    this.gridContainer = null;
    this.editors = [];
  }

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("grid-tool");

    this.createGrid();
    return this.wrapper;
  }

  createGrid() {
    this.gridContainer = document.createElement("div");
    this.gridContainer.classList.add("grid-container");
    this.gridContainer.classList.add(`grid-columns-${this.data.columns}`);

    // Apply custom column widths if available
    this.applyColumnWidths();

    this.createGridItems();
    this.wrapper.appendChild(this.gridContainer);
  }

  applyColumnWidths() {
    if (
      this.data.columnWidths &&
      this.data.columnWidths.length === this.data.columns
    ) {
      const widthsString = this.data.columnWidths
        .map((width) => `${width}fr`)
        .join(" ");
      this.gridContainer.style.gridTemplateColumns = widthsString;
    } else {
      // Use default equal columns
      this.gridContainer.style.gridTemplateColumns = "";
    }
  }

  createGridItems() {
    this.editors = [];

    for (let i = 0; i < this.data.columns; i++) {
      const gridItem = document.createElement("div");
      gridItem.classList.add("grid-item");

      const itemContent = document.createElement("div");
      itemContent.classList.add("grid-item-content");
      itemContent.id = `grid-item-${this.block.id}-${i}`;

      gridItem.appendChild(itemContent);
      this.gridContainer.appendChild(gridItem);

      // Create Editor.js instance for this grid item
      this.createItemEditor(i, itemContent);
    }

    // Add resize handles after all grid items are created
    this.createResizeHandles();
  }

  createResizeHandles() {
    // Remove existing resize handles
    const existingHandles = this.gridContainer.querySelectorAll(
      ".grid-resize-handle"
    );
    existingHandles.forEach((handle) => handle.remove());

    // Add resize handles between columns (except after the last column)
    for (let i = 0; i < this.data.columns - 1; i++) {
      const resizeHandle = document.createElement("div");
      resizeHandle.classList.add("grid-resize-handle");
      resizeHandle.dataset.columnIndex = i;
      resizeHandle.innerHTML = `
        <div class="grid-resize-line"></div>
      `;

      this.gridContainer.appendChild(resizeHandle);
      this.addResizeHandlers(resizeHandle, i);
      this.positionResizeHandle(resizeHandle, i);
    }
  }

  positionResizeHandle(handle, columnIndex) {
    // Calculate the position based on current column widths
    if (
      this.data.columnWidths &&
      this.data.columnWidths.length === this.data.columns
    ) {
      const totalWidth = this.data.columnWidths.reduce(
        (sum, width) => sum + width,
        0
      );
      let leftPosition = 0;

      for (let i = 0; i <= columnIndex; i++) {
        leftPosition += this.data.columnWidths[i] / totalWidth;
      }

      handle.style.left = `calc(${leftPosition * 100}% - 4px)`;
    } else {
      // Default positioning when no custom widths are set
      const position = ((columnIndex + 1) / this.data.columns) * 100;
      handle.style.left = `calc(${position}% - 4px)`;
    }
  }

  async createItemEditor(columnIndex, container) {
    try {
      const EditorJS = window.EditorJS;
      if (!EditorJS) {
        console.error("EditorJS not found");
        return;
      }

      // Get available tools from main editor (excluding Grid to prevent infinite nesting)
      const availableTools = {};

      // Add common tools with their configurations
      if (window.Header) {
        availableTools.header = {
          class: window.Header,
          inlineToolbar: true,
          config: {
            placeholder: "Enter a header",
            levels: [1, 2, 3],
            defaultLevel: 2,
          },
        };
      }

      if (window.SimpleImage) {
        availableTools.image = {
          class: window.SimpleImage,
          config: this.config.imageConfig || {
            uploadEndpoint: "https://your-api.com/upload",
            uploadField: "image",
            additionalRequestData: {},
            additionalRequestHeaders: {},
            shortcut: "CMD+SHIFT+P",
          },
        };
      }

      if (window.CloudinaryImage) {
        availableTools.cloudinary = {
          class: window.CloudinaryImage,
          config: this.config.cloudinaryConfig || {
            cloudName: "dqjambruk",
            uploadPreset: "mylastdraft",
            shortcut: "CMD+SHIFT+I",
          },
        };
      }

      if (window.Paragraph) {
        availableTools.paragraph = {
          class: window.Paragraph,
          inlineToolbar: true,
        };
      }

      if (window.List) availableTools.list = { class: window.List };
      if (window.NestedList) {
        availableTools.list = {
          class: window.NestedList,
          inlineToolbar: true,
          config: {
            defaultStyle: "unordered",
          },
        };
      }
      if (window.Quote) availableTools.quote = { class: window.Quote };
      if (window.Code) availableTools.code = { class: window.Code };
      if (window.Delimiter)
        availableTools.delimiter = { class: window.Delimiter };
      if (window.Table) availableTools.table = { class: window.Table };
      if (window.LinkTool) availableTools.linkTool = { class: window.LinkTool };
      if (window.Marker) availableTools.marker = { class: window.Marker };
      if (window.InlineCode)
        availableTools.inlineCode = { class: window.InlineCode };
      if (window.Underline)
        availableTools.underline = { class: window.Underline };
      if (window.Checklist) {
        availableTools.checklist = {
          class: window.Checklist,
          inlineToolbar: true,
          config: {
            shortcut: "CMD+SHIFT+C",
          },
        };
      }

      const editor = new EditorJS({
        holder: container,
        tools: availableTools,
        data: {
          blocks: this.data.items[columnIndex]?.blocks || [],
        },
        placeholder: `Column ${columnIndex + 1}`,
        minHeight: 50,
        onChange: () => {
          this.saveColumnData(columnIndex, editor);
        },
      });

      await editor.isReady;
      this.editors[columnIndex] = editor;
    } catch (error) {
      console.error("Error creating grid item editor:", error);
      // Fallback: create a simple textarea
      container.innerHTML = `
        <textarea 
          class="grid-fallback-editor" 
          placeholder="Column ${columnIndex + 1}"
          rows="3"
        ></textarea>
      `;
    }
  }

  async saveColumnData(columnIndex, editor) {
    try {
      const outputData = await editor.save();
      if (!this.data.items[columnIndex]) {
        this.data.items[columnIndex] = { blocks: [] };
      }
      this.data.items[columnIndex].blocks = outputData.blocks;
    } catch (error) {
      console.error("Error saving column data:", error);
    }
  }

  updateColumns(newColumns) {
    const oldColumns = this.data.columns;
    this.data.columns = newColumns;

    // Adjust items array
    if (newColumns > oldColumns) {
      // Add new empty columns
      for (let i = oldColumns; i < newColumns; i++) {
        this.data.items.push({ blocks: [] });
      }
    } else if (newColumns < oldColumns) {
      // Move blocks from removed columns to the last remaining column
      const removedItems = this.data.items.splice(newColumns);
      removedItems.forEach((item) => {
        if (item.blocks.length > 0) {
          this.data.items[newColumns - 1].blocks.push(...item.blocks);
        }
      });
    }

    this.recreateGrid();
  }

  recreateGrid() {
    if (this.gridContainer) {
      this.gridContainer.remove();
    }

    // Destroy existing editors
    this.editors.forEach((editor) => {
      if (editor && editor.destroy) {
        editor.destroy();
      }
    });

    // Reset column widths when changing column count
    this.data.columnWidths = [];

    this.createGrid();
  }

  renderSettings() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("grid-settings");

    const settings = [
      { columns: 1, label: "1 Column" },
      { columns: 2, label: "2 Columns" },
      { columns: 3, label: "3 Columns" },
      { columns: 4, label: "4 Columns" },
    ];

    settings.forEach((setting) => {
      const button = document.createElement("div");
      button.classList.add("grid-settings-button");
      if (this.data.columns === setting.columns) {
        button.classList.add("grid-settings-button--active");
      }

      button.innerHTML = `
        <div class="grid-settings-icon">
          ${this.getColumnIcon(setting.columns)}
        </div>
        <div class="grid-settings-label">${setting.label}</div>
      `;

      button.addEventListener("click", () => {
        // Remove active class from all buttons
        wrapper.querySelectorAll(".grid-settings-button").forEach((btn) => {
          btn.classList.remove("grid-settings-button--active");
        });

        this.updateColumns(setting.columns);
        button.classList.add("grid-settings-button--active");
      });

      wrapper.appendChild(button);
    });

    return wrapper;
  }

  getColumnIcon(columns) {
    const icons = {
      1: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`,
      2: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="6" height="12" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="9" y="2" width="6" height="12" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`,
      3: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="4" height="12" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="6" y="2" width="4" height="12" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="11" y="2" width="4" height="12" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`,
      4: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="3" height="12" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="5" y="2" width="3" height="12" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="9" y="2" width="3" height="12" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="13" y="2" width="2" height="12" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`,
    };
    return icons[columns] || icons[2];
  }

  async save() {
    // Save all editor states
    for (let i = 0; i < this.editors.length; i++) {
      const editor = this.editors[i];
      if (editor && editor.save) {
        try {
          const outputData = await editor.save();
          if (!this.data.items[i]) {
            this.data.items[i] = { blocks: [] };
          }
          this.data.items[i].blocks = outputData.blocks;
        } catch (error) {
          console.error(`Error saving editor ${i}:`, error);
        }
      }
    }

    return {
      columns: this.data.columns,
      items: this.data.items,
      columnWidths: this.data.columnWidths,
    };
  }

  destroy() {
    // Clean up editors
    this.editors.forEach((editor) => {
      if (editor && editor.destroy) {
        editor.destroy();
      }
    });
  }

  static get sanitize() {
    return {
      columns: {},
      items: {},
      columnWidths: {},
    };
  }

  static get shortcut() {
    return "CMD+SHIFT+G";
  }

  addResizeHandlers(handle, columnIndex) {
    let isResizing = false;
    let startX, startWidths;

    handle.addEventListener("mousedown", (e) => {
      isResizing = true;
      startX = e.clientX;

      // Initialize column widths if not set
      if (
        !this.data.columnWidths ||
        this.data.columnWidths.length !== this.data.columns
      ) {
        this.data.columnWidths = new Array(this.data.columns).fill(1);
      }

      startWidths = [...this.data.columnWidths];

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      // Add visual feedback
      this.gridContainer.classList.add("grid-resizing");

      e.preventDefault();
    });

    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const containerWidth = this.gridContainer.offsetWidth;
      const deltaRatio = (deltaX / containerWidth) * this.data.columns;

      // Update the widths of adjacent columns
      const newWidths = [...startWidths];
      newWidths[columnIndex] = Math.max(
        0.2,
        startWidths[columnIndex] + deltaRatio
      );
      newWidths[columnIndex + 1] = Math.max(
        0.2,
        startWidths[columnIndex + 1] - deltaRatio
      );

      this.data.columnWidths = newWidths;
      this.applyColumnWidths();
      this.updateResizeHandlePositions();
    };

    const handleMouseUp = () => {
      isResizing = false;
      this.gridContainer.classList.remove("grid-resizing");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    // Show handle on hover
    handle.addEventListener("mouseenter", () => {
      handle.classList.add("grid-resize-handle--visible");
    });

    handle.addEventListener("mouseleave", () => {
      if (!isResizing) {
        handle.classList.remove("grid-resize-handle--visible");
      }
    });
  }

  updateResizeHandlePositions() {
    const handles = this.gridContainer.querySelectorAll(".grid-resize-handle");
    handles.forEach((handle, index) => {
      this.positionResizeHandle(handle, index);
    });
  }
}

// Make it available globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = GridTool;
} else {
  window.GridTool = GridTool;
}
