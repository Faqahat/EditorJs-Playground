# Cloudinary Image Plugin for Editor.js

A powerful image upload plugin for Editor.js that integrates with Cloudinary for seamless image hosting and optimization.

## Features

- **Direct Cloudinary Upload**: Upload images directly to your Cloudinary account
- **Drag & Drop Support**: Intuitive drag and drop interface
- **Upload Progress**: Real-time upload progress indicator
- **Image Styling Options**: Border, background, and stretch options
- **Caption Support**: Add captions with inline formatting
- **Responsive Design**: Works great on desktop and mobile
- **Dark Mode Support**: Automatic dark mode compatibility
- **Error Handling**: Comprehensive error handling and user feedback

## Setup

### 1. Cloudinary Account Setup

1. Sign up for a free [Cloudinary account](https://cloudinary.com/)
2. Go to your Cloudinary Dashboard
3. Note your **Cloud Name** (found in the dashboard)
4. Create an **Upload Preset**:
   - Go to Settings → Upload
   - Scroll down to "Upload presets"
   - Click "Add upload preset"
   - Set signing mode to "Unsigned"
   - Configure any transformations you want
   - Save the preset name

### 2. Plugin Configuration

Update your Editor.js configuration with your Cloudinary credentials:

```javascript
cloudinaryImage: {
  class: CloudinaryImage,
  config: {
    cloudName: "your-cloud-name",        // Your Cloudinary cloud name
    uploadPreset: "your-upload-preset",  // Your unsigned upload preset
    shortcut: "CMD+SHIFT+I",            // Optional keyboard shortcut
  },
},
```

### 3. Include Plugin Files

Make sure to include both the JavaScript and CSS files:

```html
<!-- CSS -->
<link rel="stylesheet" href="./plugins/cloudinary-image/cloudinary-image.css" />

<!-- JavaScript -->
<script src="./plugins/cloudinary-image/cloudinary-image.js"></script>
```

## Usage

### Basic Usage

1. Click the "Cloudinary Image" tool in the Editor.js toolbar
2. Click the upload area or drag and drop an image
3. Wait for the upload to complete
4. Add a caption if desired
5. Use the settings panel to apply styling options

### Styling Options

- **Border**: Adds a decorative border around the image
- **Background**: Adds a subtle background behind the image
- **Stretch**: Makes the image fill the full width

### Keyboard Shortcuts

- `CMD+SHIFT+I` (or `CTRL+SHIFT+I` on Windows): Insert Cloudinary image

## Data Structure

The plugin saves data in the following format:

```javascript
{
  url: "https://res.cloudinary.com/...",     // Cloudinary image URL
  caption: "Image caption with <b>formatting</b>", // HTML caption
  withBorder: false,                         // Border styling
  withBackground: false,                     // Background styling
  stretched: false,                          // Stretch to full width
  publicId: "cloudinary-public-id",          // Cloudinary public ID
  width: 1920,                              // Original image width
  height: 1080                              // Original image height
}
```

## Security Notes

- The plugin uses unsigned upload presets for simplicity
- For production use, consider implementing signed uploads for better security
- Configure upload restrictions in your Cloudinary preset (file size, format, etc.)
- Consider adding client-side validation for additional security

## Troubleshooting

### Common Issues

1. **Upload fails**: Check your cloud name and upload preset configuration
2. **CORS errors**: Ensure your upload preset allows uploads from your domain
3. **File size issues**: Configure file size limits in your Cloudinary preset

### Error Messages

- "Cloudinary configuration missing": Check your cloud name and upload preset
- "Upload failed": Network issue or Cloudinary configuration problem
- "Failed to load image": Image URL is invalid or inaccessible

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

This plugin is part of the Editor.js project and follows the same licensing terms.
