# Navigation Enhancement Guide

## Overview

This guide shows how to add navigation capabilities to your forked MCP browser tools with a safety toggle system.

## 🚨 Safety Features

- **Manual Enable Required**: Navigation must be manually enabled in config
- **Domain Filtering**: Block/allow specific domains
- **Action Limits**: Maximum actions per session
- **Granular Controls**: Enable/disable specific features (URL nav, clicking, form filling)
- **Audit Logging**: All actions are logged for security

## Step-by-Step Implementation

### 1. Fork and Clone the Repository

```bash
# Fork the repository on GitHub first
git clone https://github.com/YOUR_USERNAME/browser-tools-mcp.git
cd browser-tools-mcp
```

### 2. Add Configuration Files

Copy the `navigation-config.json` file to your repository root:

```bash
# Copy the navigation-config.json to your repo
cp navigation-config.json ./
```

### 3. Add Navigation Helper

Copy the `navigation-helpers.js` file to your `browser-tools-mcp` directory:

```bash
# Copy the navigation helper to the MCP server directory
cp navigation-helpers.js ./browser-tools-mcp/
```

### 4. Modify the MCP Server

Edit `browser-tools-mcp/src/mcp-server.js` (or equivalent main file):

```javascript
// Add at the top of the file
const { EnhancedMCPTools, enhanceExistingMCPServer } = require('./enhanced-mcp-tools');

// After your existing MCP server setup, add:
const enhancedServer = enhanceExistingMCPServer(mcpServer);
```

### 5. Add Enhanced Tools Module

Copy the `enhanced-mcp-tools.js` file to your `browser-tools-mcp` directory:

```bash
cp enhanced-mcp-tools.js ./browser-tools-mcp/
```

### 6. Modify the Browser Tools Server

Edit `browser-tools-server/src/server.js` to add navigation endpoints:

```javascript
// Add these new endpoints to your existing server

// Navigate to URL
app.post('/navigate', async (req, res) => {
  const { url } = req.body;
  try {
    // Use Puppeteer or similar to navigate
    await page.goto(url);
    res.json({ success: true, message: `Navigated to ${url}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Click element
app.post('/click', async (req, res) => {
  const { selector } = req.body;
  try {
    await page.click(selector);
    res.json({ success: true, message: `Clicked ${selector}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fill form
app.post('/fill-form', async (req, res) => {
  const { selector, value } = req.body;
  try {
    await page.type(selector, value);
    res.json({ success: true, message: `Filled ${selector}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Scroll
app.post('/scroll', async (req, res) => {
  const { x, y } = req.body;
  try {
    await page.evaluate((x, y) => {
      window.scrollTo(x, y);
    }, x, y);
    res.json({ success: true, message: `Scrolled to (${x}, ${y})` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Wait for element
app.post('/wait-for-element', async (req, res) => {
  const { selector, timeout } = req.body;
  try {
    await page.waitForSelector(selector, { timeout });
    res.json({ success: true, message: `Element ${selector} found` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 7. Update Package Dependencies

Add any missing dependencies to `package.json`:

```bash
cd browser-tools-mcp
npm install node-fetch  # If not already installed

cd ../browser-tools-server
npm install puppeteer   # If not already installed
```

### 8. Build Your Enhanced Version

```bash
# Build the MCP server
cd browser-tools-mcp
npm run build

# Build the browser tools server
cd ../browser-tools-server
npm run build
```

### 9. Test Your Implementation

```bash
# Start the browser tools server
cd browser-tools-server
npm start

# In another terminal, test the MCP server
cd browser-tools-mcp
node dist/mcp-server.js
```

## 🔧 Configuration Options

### Basic Configuration

To enable navigation, edit `navigation-config.json`:

```json
{
  "navigation_abilities": true,
  "safety_settings": {
    "enable_url_navigation": true,
    "enable_clicking": true,
    "enable_form_filling": true,
    "max_navigation_actions_per_session": 50
  }
}
```

### Advanced Safety Settings

```json
{
  "navigation_abilities": true,
  "safety_settings": {
    "require_confirmation": true,
    "allowed_domains": ["example.com", "github.com"],
    "blocked_domains": ["*.banking.com", "paypal.com"],
    "max_navigation_actions_per_session": 25,
    "enable_form_filling": false,
    "enable_clicking": true,
    "enable_url_navigation": true
  },
  "logging": {
    "log_navigation_actions": true,
    "log_level": "info"
  }
}
```

## 🛠️ New MCP Tools Available

After implementation, you'll have these new tools:

1. **`mcp_navigateToUrl`** - Navigate to a specific URL
2. **`mcp_clickElement`** - Click on elements using CSS selectors
3. **`mcp_fillForm`** - Fill form fields
4. **`mcp_scrollTo`** - Scroll to specific coordinates
5. **`mcp_waitForElement`** - Wait for elements to appear
6. **`mcp_checkNavigationStatus`** - Check current navigation settings
7. **`mcp_enableNavigation`** - Get instructions to enable navigation

## 🔒 Security Considerations

1. **Manual Activation**: Navigation must be manually enabled in config
2. **Domain Restrictions**: Use allowed/blocked domain lists
3. **Action Limits**: Set reasonable limits on actions per session
4. **Audit Trail**: All actions are logged with timestamps
5. **Granular Controls**: Enable only the features you need

## 💡 Usage Examples

### Enable Navigation (Manual Step)

```json
// Edit navigation-config.json
{
  "navigation_abilities": true,
  "safety_settings": {
    "enable_url_navigation": true,
    "enable_clicking": true,
    "enable_form_filling": false
  }
}
```

### Using Navigation Tools

```javascript
// Navigate to a page
await mcp_navigateToUrl({ url: "https://example.com" });

// Click a button
await mcp_clickElement({ selector: "#submit-button" });

// Scroll to bottom
await mcp_scrollTo({ x: 0, y: 10000 });

// Wait for content to load
await mcp_waitForElement({ selector: ".content-loaded" });

// Check current status
await mcp_checkNavigationStatus({});
```

## 🚨 Important Notes

1. **Test Thoroughly**: Test all functionality before using in production
2. **Review Logs**: Monitor navigation actions for security
3. **Update Regularly**: Keep your fork updated with upstream changes
4. **Use Responsibly**: Only enable features you actually need
5. **Report Issues**: Create issues in your fork for any problems

## 📦 Publishing Your Fork

If you want to publish your enhanced version:

```bash
# Update package.json with your own name
{
  "name": "@yourusername/browser-tools-mcp-enhanced",
  "version": "1.0.0",
  "description": "Enhanced MCP browser tools with navigation capabilities"
}

# Publish to npm
npm publish
```

## 🔄 Keeping Up with Updates

To keep your fork updated:

```bash
# Add upstream remote
git remote add upstream https://github.com/AgentDeskAI/browser-tools-mcp.git

# Fetch updates
git fetch upstream

# Merge updates (resolve conflicts as needed)
git merge upstream/main
```

## 🆘 Troubleshooting

### Common Issues

1. **"Navigation is disabled"**: Check `navigation_abilities` in config
2. **"Domain not allowed"**: Review your domain whitelist/blacklist
3. **"Connection refused"**: Ensure browser-tools-server is running
4. **"Element not found"**: Verify your CSS selectors are correct

### Debug Mode

Enable debug logging in your config:

```json
{
  "logging": {
    "log_navigation_actions": true,
    "log_level": "debug"
  }
}
```

## 🎯 Next Steps

1. **Fork the repository** on GitHub
2. **Follow this guide** to implement navigation
3. **Test thoroughly** with your use cases
4. **Configure safety settings** appropriately
5. **Start using** the enhanced navigation tools!

Remember: **With great power comes great responsibility**. Use these navigation capabilities wisely and always prioritize security. 