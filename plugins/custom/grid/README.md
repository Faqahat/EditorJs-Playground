# Grid Plugin for Editor.js

A minimal grid layout plugin for Editor.js that creates clean, responsive grid layouts with nested Editor.js blocks.

## Features

- **Clean Design**: No visual UI - pure content focus
- **Responsive Grid Layouts**: Create 1-4 column layouts that adapt to screen size
- **Nested Editor.js Blocks**: Add any Editor.js blocks inside grid columns
- **Block Tunes Integration**: All controls in the Editor.js settings panel
- **Smart Column Management**: Automatically handles content when changing column count
- **Mobile Responsive**: Grid adapts to mobile devices automatically
- **Dark Mode Support**: Full dark mode compatibility

## Setup

### 1. Include Plugin Files

Include both the JavaScript and CSS files:

```html
<!-- CSS -->
<link rel="stylesheet" href="./plugins/grid/grid.css" />

<!-- JavaScript -->
<script src="./plugins/grid/grid.js"></script>
```

### 2. Configure the Plugin

Add the plugin to your Editor.js configuration:

```javascript
const editor = new EditorJS({
  holder: "editorjs",
  tools: {
    grid: {
      class: GridTool,
      shortcut: "CMD+SHIFT+G",
    },
    // ... other tools
  },
});
```

## Usage

### Creating a Grid

1. Click the Grid tool in the toolbar or use the keyboard shortcut `CMD+SHIFT+G`
2. A 2-column grid is created by default
3. Click the settings icon (tune button) to change column count
4. Start adding content to each column by clicking inside them

### Grid Controls (Block Tunes)

**Column Count**

- 1-4 columns available in the settings panel
- Content is automatically redistributed when changing column count
- Excess content moves to the last column when reducing columns

### Adding Content

Each grid column can contain any Editor.js block:

- Text paragraphs
- Headers
- Images (both Cloudinary and Simple Image)
- Lists
- Quotes
- Code blocks
- Checklists
- And any other installed Editor.js tools

### Responsive Behavior

The grid automatically adapts to different screen sizes:

- **Desktop**: Full column layout as configured
- **Tablet** (768px and below): 3-4 columns become 2 columns
- **Mobile** (480px and below): All layouts become single column

## Data Structure

The grid saves data in the following format:

```javascript
{
  columns: 2,              // Number of columns
  items: [                 // Array of column data
    {
      blocks: [            // Editor.js blocks for this column
        {
          type: "paragraph",
          data: { text: "Content in column 1" }
        }
      ]
    },
    {
      blocks: [
        {
          type: "header",
          data: { text: "Header in column 2", level: 2 }
        }
      ]
    }
  ]
}
```

## Design Philosophy

This grid plugin follows a minimal design approach:

- **No Visual Clutter**: Clean interface with no borders or backgrounds
- **Content First**: Focus entirely on the content within the grid
- **Editor.js Native**: Uses standard Editor.js patterns and UI elements
- **Settings Panel**: All controls are in the Block Tunes (settings) to keep the main view clean

## CSS Classes

- `.grid-tool`: Main container
- `.grid-container`: Grid layout container
- `.grid-item`: Individual grid column
- `.grid-item-content`: Content area within each column
- `.grid-settings`: Settings panel styles

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Tips

1. **Clean Layout**: The minimal design keeps focus on your content
2. **Responsive Design**: Grid automatically stacks on mobile devices
3. **Content Balance**: Try to balance content length across columns for best visual appeal
4. **Settings Access**: Use the tune button (settings icon) to change column count

## Troubleshooting

**Grid content not saving**: Ensure all nested editors have finished loading before saving the main document.

**Mobile layout**: The grid automatically becomes single-column on mobile. This is intentional for better readability.

**Column Changes**: When reducing columns, content from removed columns automatically moves to the last remaining column.
