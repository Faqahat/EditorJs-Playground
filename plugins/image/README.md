# Simple Image Plugin for Editor.js

A versatile image plugin for Editor.js that supports both HTTP endpoint uploads and URL-based image insertion.

## Features

- **Two Upload Methods**: Upload files to your server or add images via URL
- **Tab Interface**: Clean tabbed interface to switch between upload and URL methods
- **Drag & Drop Support**: Intuitive drag and drop file upload
- **Progress Tracking**: Real-time upload progress with visual feedback
- **URL Validation**: Automatic validation of image URLs
- **Image Styling Options**: Border, background, stretch, and alignment options
- **Caption Support**: Add captions with inline formatting
- **Responsive Design**: Works great on desktop and mobile
- **Dark Mode Support**: Automatic dark mode compatibility
- **Error Handling**: Comprehensive error handling and user feedback

## Setup

### 1. Include Plugin Files

Make sure to include both the JavaScript and CSS files:

```html
<!-- CSS -->
<link rel="stylesheet" href="./plugins/image/image.css" />

<!-- JavaScript -->
<script src="./plugins/image/image.js"></script>
```

### 2. Configure the Plugin

Add the plugin to your Editor.js configuration:

```javascript
image: {
  class: SimpleImage,
  config: {
    uploadEndpoint: "https://your-api.com/upload",  // Your upload API endpoint
    uploadField: "image",                           // Field name for the image file
    additionalRequestData: {                        // Optional: Additional form data
      folder: "uploads",
      user_id: "123"
    },
    additionalRequestHeaders: {                     // Optional: Additional headers
      "Authorization": "Bearer your-token"
    },
    shortcut: "CMD+SHIFT+P",                       // Optional keyboard shortcut
  },
},
```

## Configuration Options

### Required Configuration

- **`uploadEndpoint`**: The HTTP endpoint where images will be uploaded (POST request)
- **`uploadField`**: The form field name for the image file (default: "image")

### Optional Configuration

- **`additionalRequestData`**: Object with additional form data to send with uploads
- **`additionalRequestHeaders`**: Object with additional headers to send with requests
- **`shortcut`**: Keyboard shortcut to insert the image tool

## API Response Format

Your upload endpoint should return a JSON response with the image URL. The plugin supports several response formats:

### Simple URL String

```json
"https://your-server.com/images/uploaded-image.jpg"
```

### Object with URL

```json
{
  "url": "https://your-server.com/images/uploaded-image.jpg"
}
```

### Nested Data Structure

```json
{
  "data": {
    "url": "https://your-server.com/images/uploaded-image.jpg"
  }
}
```

### Other Supported Formats

```json
{
  "file": { "url": "..." },
  "image": { "url": "..." },
  "link": "..."
}
```

## Usage

### Upload Method

1. Click the "Image" tool in the Editor.js toolbar
2. Make sure the "Upload" tab is selected
3. Click the upload area or drag and drop an image
4. Wait for the upload to complete
5. Add a caption if desired
6. Use the settings panel to apply styling options

### URL Method

1. Click the "Image" tool in the Editor.js toolbar
2. Click the "URL" tab
3. Paste or type an image URL
4. Press Enter or click "Add Image"
5. The image will be validated and added if successful

### Styling Options

Use the settings panel (gear icon) to apply:

- **Border**: Adds a decorative border around the image
- **Background**: Adds a subtle background behind the image
- **Stretch**: Makes the image fill the full width
- **Alignment**: Left, Center, or Right alignment

### Keyboard Shortcuts

- `CMD+SHIFT+P` (or `CTRL+SHIFT+P` on Windows): Insert simple image

## Data Structure

The plugin saves data in the following format:

```javascript
{
  url: "https://your-server.com/image.jpg",        // Image URL
  caption: "Image caption with <b>formatting</b>", // HTML caption
  withBorder: false,                               // Border styling
  withBackground: false,                           // Background styling
  stretched: false,                                // Stretch to full width
  alignment: "center"                              // left, center, right
}
```

## Example Server Implementation

Here's a simple Node.js/Express example for the upload endpoint:

```javascript
const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageUrl = `https://your-server.com/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

app.listen(3000);
```

## Error Handling

The plugin handles various error scenarios:

- **Network errors**: Connection issues during upload
- **Invalid URLs**: Non-image URLs or broken links
- **Server errors**: HTTP error responses
- **File validation**: Non-image file types
- **Missing configuration**: Upload endpoint not configured

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security Considerations

- Validate file types and sizes on your server
- Implement proper authentication for upload endpoints
- Sanitize file names to prevent directory traversal
- Consider rate limiting for upload endpoints
- Validate image URLs to prevent XSS attacks

## License

This plugin is part of the Editor.js project and follows the same licensing terms.
