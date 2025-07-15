const NavigationHelper = require('./navigation-helpers');

// This would be added to the existing MCP server implementation
class EnhancedMCPTools {
  constructor() {
    this.navigationHelper = new NavigationHelper();
  }

  // These would be added to the existing tools array
  getNavigationTools() {
    return [
      {
        name: 'mcp_navigateToUrl',
        description: 'Navigate to a specific URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to navigate to'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'mcp_clickElement',
        description: 'Click on an element using CSS selector',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector for the element to click'
            }
          },
          required: ['selector']
        }
      },
      {
        name: 'mcp_fillForm',
        description: 'Fill a form field with a value',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector for the form field'
            },
            value: {
              type: 'string',
              description: 'Value to fill in the form field'
            }
          },
          required: ['selector', 'value']
        }
      },
      {
        name: 'mcp_scrollTo',
        description: 'Scroll to a specific position on the page',
        inputSchema: {
          type: 'object',
          properties: {
            x: {
              type: 'number',
              description: 'X coordinate to scroll to'
            },
            y: {
              type: 'number',
              description: 'Y coordinate to scroll to'
            }
          },
          required: ['x', 'y']
        }
      },
      {
        name: 'mcp_waitForElement',
        description: 'Wait for an element to appear on the page',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector for the element to wait for'
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconds (default: 5000)',
              default: 5000
            }
          },
          required: ['selector']
        }
      },
      {
        name: 'mcp_checkNavigationStatus',
        description: 'Check if navigation abilities are enabled and current limits',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'mcp_enableNavigation',
        description: 'Enable navigation abilities (requires manual config change)',
        inputSchema: {
          type: 'object',
          properties: {
            enable_url_navigation: {
              type: 'boolean',
              description: 'Enable URL navigation'
            },
            enable_clicking: {
              type: 'boolean',
              description: 'Enable element clicking'
            },
            enable_form_filling: {
              type: 'boolean',
              description: 'Enable form filling'
            }
          }
        }
      }
    ];
  }

  // These would be added to the existing tool handlers
  async handleNavigationTool(name, args) {
    try {
      switch (name) {
        case 'mcp_navigateToUrl':
          if (!this.navigationHelper.isNavigationEnabled()) {
            return {
              content: [{
                type: 'text',
                text: 'Navigation is disabled. Please enable navigation_abilities in the config file.'
              }]
            };
          }
          const navResult = await this.navigationHelper.navigateToUrl(args.url);
          return {
            content: [{
              type: 'text',
              text: `Successfully navigated to ${args.url}. Page loaded: ${navResult.success}`
            }]
          };

        case 'mcp_clickElement':
          if (!this.navigationHelper.isNavigationEnabled()) {
            return {
              content: [{
                type: 'text',
                text: 'Navigation is disabled. Please enable navigation_abilities in the config file.'
              }]
            };
          }
          const clickResult = await this.navigationHelper.clickElement(args.selector);
          return {
            content: [{
              type: 'text',
              text: `Clicked element: ${args.selector}. Success: ${clickResult.success}`
            }]
          };

        case 'mcp_fillForm':
          if (!this.navigationHelper.isNavigationEnabled()) {
            return {
              content: [{
                type: 'text',
                text: 'Navigation is disabled. Please enable navigation_abilities in the config file.'
              }]
            };
          }
          const fillResult = await this.navigationHelper.fillForm(args.selector, args.value);
          return {
            content: [{
              type: 'text',
              text: `Filled form field: ${args.selector}. Success: ${fillResult.success}`
            }]
          };

        case 'mcp_scrollTo':
          if (!this.navigationHelper.isNavigationEnabled()) {
            return {
              content: [{
                type: 'text',
                text: 'Navigation is disabled. Please enable navigation_abilities in the config file.'
              }]
            };
          }
          const scrollResult = await this.navigationHelper.scrollTo(args.x, args.y);
          return {
            content: [{
              type: 'text',
              text: `Scrolled to position (${args.x}, ${args.y}). Success: ${scrollResult.success}`
            }]
          };

        case 'mcp_waitForElement':
          if (!this.navigationHelper.isNavigationEnabled()) {
            return {
              content: [{
                type: 'text',
                text: 'Navigation is disabled. Please enable navigation_abilities in the config file.'
              }]
            };
          }
          const waitResult = await this.navigationHelper.waitForElement(args.selector, args.timeout);
          return {
            content: [{
              type: 'text',
              text: `Waited for element: ${args.selector}. Found: ${waitResult.success}`
            }]
          };

        case 'mcp_checkNavigationStatus':
          const config = this.navigationHelper.config;
          return {
            content: [{
              type: 'text',
              text: `Navigation Status:
- Navigation Abilities: ${config.navigation_abilities ? 'ENABLED' : 'DISABLED'}
- URL Navigation: ${config.safety_settings?.enable_url_navigation ? 'ENABLED' : 'DISABLED'}
- Element Clicking: ${config.safety_settings?.enable_clicking ? 'ENABLED' : 'DISABLED'}
- Form Filling: ${config.safety_settings?.enable_form_filling ? 'ENABLED' : 'DISABLED'}
- Actions Used This Session: ${this.navigationHelper.navigationCount}
- Max Actions Per Session: ${config.safety_settings?.max_navigation_actions_per_session || 'Not set'}
- Blocked Domains: ${config.safety_settings?.blocked_domains?.join(', ') || 'None'}`
            }]
          };

        case 'mcp_enableNavigation':
          return {
            content: [{
              type: 'text',
              text: `To enable navigation abilities, please manually edit the navigation-config.json file and set:
- navigation_abilities: true
- enable_url_navigation: ${args.enable_url_navigation || false}
- enable_clicking: ${args.enable_clicking || false}
- enable_form_filling: ${args.enable_form_filling || false}

This manual step is required for security reasons.`
            }]
          };

        default:
          return {
            content: [{
              type: 'text',
              text: `Unknown navigation tool: ${name}`
            }]
          };
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error executing ${name}: ${error.message}`
        }]
      };
    }
  }
}

// Example of how to integrate with existing MCP server
function enhanceExistingMCPServer(existingServer) {
  const enhancedTools = new EnhancedMCPTools();
  
  // Add navigation tools to existing tools
  const navigationTools = enhancedTools.getNavigationTools();
  existingServer.tools = [...existingServer.tools, ...navigationTools];
  
  // Add navigation handler to existing handlers
  const originalHandleTool = existingServer.handleTool;
  existingServer.handleTool = async function(name, args) {
    // Check if it's a navigation tool
    if (name.startsWith('mcp_navigate') || name.startsWith('mcp_click') || 
        name.startsWith('mcp_fill') || name.startsWith('mcp_scroll') || 
        name.startsWith('mcp_wait') || name.startsWith('mcp_check') || 
        name.startsWith('mcp_enable')) {
      return await enhancedTools.handleNavigationTool(name, args);
    }
    
    // Otherwise, use the original handler
    return await originalHandleTool.call(this, name, args);
  };
  
  return existingServer;
}

module.exports = { EnhancedMCPTools, enhanceExistingMCPServer }; 