# Editor.js Custom Plugins Project

This project contains a clean, modular implementation of Editor.js with custom plugins organized in separate directories.

## Project Structure

```
editorjs-project/
├── index-clean.html           # Clean, refactored main file
├── index.html                 # Original implementation (legacy)
├── plugins/                   # Custom plugins directory
│   ├── font-size/
│   │   ├── font-size.js      # Font size plugin logic
│   │   └── font-size.css     # Font size plugin styles
│   ├── text-color/
│   │   ├── text-color.js     # Text color plugin logic
│   │   └── text-color.css    # Text color plugin styles
│   └── code-block/
│       ├── code-block.js     # Code block plugin logic
│       └── code-block.css    # Code block plugin styles
├── highlight/                 # Local highlight.js files (optional)
│   ├── highlight.min.js
│   └── default.min.css
└── README.md                 # This file
```

## Custom Plugins

### 1. Font Size Plugin (`plugins/font-size/`)

- **Type**: Inline tool
- **Features**:
  - Dropdown with predefined font sizes
  - Visual feedback for active states
  - Keyboard shortcut: `CMD+SHIFT+F`
- **Usage**: Select text and click the font size button in the inline toolbar

### 2. Text Color Plugin (`plugins/text-color/`)

- **Type**: Inline tool
- **Features**:
  - Text color and background color options
  - Color palette with recent colors
  - Modern UI with hover effects
- **Usage**: Select text and click the text color button in the inline toolbar

### 3. Code Block Plugin (`plugins/code-block/`)

- **Type**: Block tool
- **Features**:
  - Syntax highlighting with Atom One Dark theme
  - Language selection (22+ languages)
  - Copy to clipboard functionality
  - Resizable container
  - Hover-triggered copy button
  - Minimal, clean design
- **Usage**: Click the code block tool in the toolbox

## Dependencies

### External CDN Dependencies

- **Editor.js**: Core editor framework
- **Official Plugins**: Header, Paragraph, List, Table, etc.
- **Highlight.js**: Syntax highlighting for code blocks
- **Fonts**: Montserrat from Google Fonts

### Internal Dependencies

- Custom plugin files (CSS + JS)
- Modular structure for easy maintenance

## Getting Started

1. **Use the clean version**: Open `index-clean.html` in your browser
2. **Development**: Edit individual plugin files in their respective directories
3. **Customization**: Modify plugin configs in the main HTML file

## Plugin Architecture

Each custom plugin follows this structure:

```
plugin-name/
├── plugin-name.js    # Main plugin class
└── plugin-name.css   # Plugin-specific styles
```

### Benefits of This Structure:

- ✅ **Modularity**: Each plugin is self-contained
- ✅ **Maintainability**: Easy to update individual plugins
- ✅ **Scalability**: Simple to add new plugins
- ✅ **Clean Separation**: Styles and logic are separated
- ✅ **Standard Loading**: Plugins load like official Editor.js plugins

## Customization

### Adding a New Plugin

1. Create a new directory: `plugins/your-plugin/`
2. Add your plugin files: `your-plugin.js` and `your-plugin.css`
3. Import in `index-clean.html`:
   ```html
   <link rel="stylesheet" href="./plugins/your-plugin/your-plugin.css" />
   <script src="./plugins/your-plugin/your-plugin.js"></script>
   ```
4. Add to Editor.js config:
   ```javascript
   tools: {
     yourPlugin: {
       class: YourPluginClass,
       config: { /* your config */ }
     }
   }
   ```

### Modifying Existing Plugins

- **Styles**: Edit the respective `.css` file
- **Logic**: Edit the respective `.js` file
- **Config**: Modify the plugin config in `index-clean.html`

## Browser Compatibility

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ ES6+ features used
- ✅ CSS Grid and Flexbox layouts

## Performance

- 📦 **Minimal bundle**: Only necessary dependencies loaded
- 🚀 **Fast loading**: CDN-hosted external dependencies
- 💾 **Efficient**: Modular CSS prevents style conflicts
