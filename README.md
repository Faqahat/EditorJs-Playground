# Editor.js Custom Plugins Project

This project contains a clean, modular implementation of Editor.js with custom plugins organized in separate directories.

## Project Structure

```
editorjs-project/
├── index.html                 # Main entry point (clean, refactored)
├── index-legacy.html          # Original implementation (backup)
├── plugins/                   # Custom plugins directory
│   ├── font-size/
│   │   ├── font-size.js      # Font size plugin logic
│   │   └── font-size.css     # Font size plugin styles
│   ├── text-color/
│   │   ├── text-color.js     # Text color plugin logic
│   │   └── text-color.css    # Text color plugin styles
│   ├── code-block/
│   │   ├── code-block.js     # Code block plugin logic
│   │   └── code-block.css    # Code block plugin styles
│   ├── line-separator/
│   │   ├── line-separator.js # Line separator plugin logic
│   │   └── line-separator.css # Line separator plugin styles
│   └── web-bookmark/
│       ├── web-bookmark.js   # Web bookmark plugin logic
│       └── web-bookmark.css  # Web bookmark plugin styles
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

### 4. Line Separator Plugin (`plugins/line-separator/`)

- **Type**: Block tool
- **Features**:
  - 9 different separator styles (default, solid, dashed, dotted, thick, double, wavy, gradient, shadow)
  - Interactive settings panel that appears on hover
  - Visual style previews in settings
  - Keyboard shortcut: `CMD+SHIFT+L`
  - Customizable styles with CSS variables
- **Usage**: Click the line separator tool in the toolbox, then hover to access style options
- **Styles Available**:
  - **Default**: Gradient fade effect
  - **Solid**: Simple solid line
  - **Dashed**: Dashed line pattern
  - **Dotted**: Dotted line pattern
  - **Thick**: Bold 3px line
  - **Double**: Double line effect
  - **Wavy**: SVG-based wavy line
  - **Gradient**: Colorful gradient line
  - **Shadow**: Line with drop shadow

### 5. Web Bookmark Plugin (`plugins/web-bookmark/`)

- **Type**: Block tool
- **Features**:
  - Automatic metadata extraction from URLs
  - Beautiful visual bookmark cards with title, description, and images
  - Favicon and domain display
  - CORS proxy for fetching metadata
  - Error handling and retry functionality
  - Hover settings panel for editing/removing
  - Responsive design with mobile support
  - Dark mode support
  - Keyboard shortcut: `CMD+SHIFT+B`
- **Usage**: Click the web bookmark tool, enter a URL, and the plugin will automatically fetch and display the page metadata
- **Metadata Extracted**:
  - **Title**: From og:title, twitter:title, or page title
  - **Description**: From og:description, twitter:description, or meta description
  - **Image**: From og:image, twitter:image, or meta image
  - **Favicon**: From various favicon link tags or default favicon.ico
  - **Domain**: Cleaned domain name for display

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

1. **Open the editor**: Open `index.html` in your browser
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
3. Import in `index.html`:
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
- **Config**: Modify the plugin config in `index.html`

### Customizing Line Separator Styles

The line separator plugin supports easy style customization. You can:

1. **Modify existing styles** in `plugins/line-separator/line-separator.css`
2. **Add new styles** by creating new CSS classes following the pattern `.line-separator-line.style-{name}`
3. **Update the JavaScript** to include new styles in the `styles` array

Example of adding a custom style:

```css
.line-separator-line.style-custom {
  background: repeating-linear-gradient(
    45deg,
    #ff6b6b,
    #ff6b6b 10px,
    #4ecdc4 10px,
    #4ecdc4 20px
  );
  height: 4px;
}
```

## Keyboard Shortcuts

- **Font Size**: `CMD+SHIFT+F`
- **Line Separator**: `CMD+SHIFT+L`
- **Web Bookmark**: `CMD+SHIFT+B`
- **Standard Editor.js shortcuts** for other tools

## Browser Compatibility

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ ES6+ features used
- ✅ CSS Grid and Flexbox layouts
- ✅ SVG support for wavy line separator

## Performance

- 📦 **Minimal bundle**: Only necessary dependencies loaded
- 🚀 **Fast loading**: CDN-hosted external dependencies
- 💾 **Efficient**: Modular CSS prevents style conflicts
- 🎨 **Optimized**: SVG patterns and CSS effects for visual elements

## Contributing

To contribute a new plugin:

1. Follow the established plugin structure
2. Include both `.js` and `.css` files
3. Update this README with plugin documentation
4. Test compatibility with existing plugins
5. Ensure keyboard shortcuts don't conflict

## License

This project is open source and available under the MIT License.
