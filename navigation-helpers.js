const fs = require('fs');
const path = require('path');

class NavigationHelper {
  constructor(configPath = './navigation-config.json') {
    this.configPath = configPath;
    this.config = this.loadConfig();
    this.navigationCount = 0;
  }

  loadConfig() {
    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      return config;
    } catch (error) {
      console.error('Failed to load navigation config:', error);
      return { navigation_abilities: false };
    }
  }

  isNavigationEnabled() {
    return this.config.navigation_abilities === true;
  }

  checkSafetyLimits() {
    if (!this.isNavigationEnabled()) {
      throw new Error('Navigation abilities are disabled. Set navigation_abilities: true in config.');
    }

    if (this.navigationCount >= this.config.safety_settings.max_navigation_actions_per_session) {
      throw new Error('Maximum navigation actions exceeded for this session.');
    }
  }

  isDomainAllowed(url) {
    const hostname = new URL(url).hostname;
    
    // Check blocked domains
    for (const blocked of this.config.safety_settings.blocked_domains) {
      if (blocked.includes('*')) {
        const pattern = blocked.replace(/\*/g, '.*');
        if (new RegExp(pattern).test(hostname)) {
          return false;
        }
      } else if (hostname.includes(blocked)) {
        return false;
      }
    }

    // Check allowed domains (if specified)
    if (this.config.safety_settings.allowed_domains.length > 0) {
      return this.config.safety_settings.allowed_domains.some(allowed => 
        hostname.includes(allowed)
      );
    }

    return true;
  }

  validateNavigationRequest(action, params) {
    this.checkSafetyLimits();

    switch (action) {
      case 'navigate_to_url':
        if (!this.config.safety_settings.enable_url_navigation) {
          throw new Error('URL navigation is disabled in safety settings.');
        }
        if (!this.isDomainAllowed(params.url)) {
          throw new Error(`Domain not allowed: ${new URL(params.url).hostname}`);
        }
        break;

      case 'click_element':
        if (!this.config.safety_settings.enable_clicking) {
          throw new Error('Element clicking is disabled in safety settings.');
        }
        break;

      case 'fill_form':
        if (!this.config.safety_settings.enable_form_filling) {
          throw new Error('Form filling is disabled in safety settings.');
        }
        break;
    }

    this.navigationCount++;
  }

  logAction(action, params, result) {
    if (this.config.logging.log_navigation_actions) {
      console.log(`[NAVIGATION] ${action}:`, {
        params,
        result: result ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
        sessionCount: this.navigationCount
      });
    }
  }

  // New navigation methods that would be called by the MCP server
  async navigateToUrl(url) {
    this.validateNavigationRequest('navigate_to_url', { url });

    try {
      // Send navigation request to middleware server
      const response = await fetch('http://localhost:3025/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const result = await response.json();
      this.logAction('navigate_to_url', { url }, response.ok);
      return result;
    } catch (error) {
      this.logAction('navigate_to_url', { url }, false);
      throw error;
    }
  }

  async clickElement(selector) {
    this.validateNavigationRequest('click_element', { selector });

    try {
      const response = await fetch('http://localhost:3025/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selector })
      });

      const result = await response.json();
      this.logAction('click_element', { selector }, response.ok);
      return result;
    } catch (error) {
      this.logAction('click_element', { selector }, false);
      throw error;
    }
  }

  async fillForm(selector, value) {
    this.validateNavigationRequest('fill_form', { selector, value });

    try {
      const response = await fetch('http://localhost:3025/fill-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selector, value })
      });

      const result = await response.json();
      this.logAction('fill_form', { selector, value: '[HIDDEN]' }, response.ok);
      return result;
    } catch (error) {
      this.logAction('fill_form', { selector, value: '[HIDDEN]' }, false);
      throw error;
    }
  }

  async scrollTo(x, y) {
    this.validateNavigationRequest('scroll_to', { x, y });

    try {
      const response = await fetch('http://localhost:3025/scroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y })
      });

      const result = await response.json();
      this.logAction('scroll_to', { x, y }, response.ok);
      return result;
    } catch (error) {
      this.logAction('scroll_to', { x, y }, false);
      throw error;
    }
  }

  async waitForElement(selector, timeout = 5000) {
    this.validateNavigationRequest('wait_for_element', { selector, timeout });

    try {
      const response = await fetch('http://localhost:3025/wait-for-element', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selector, timeout })
      });

      const result = await response.json();
      this.logAction('wait_for_element', { selector, timeout }, response.ok);
      return result;
    } catch (error) {
      this.logAction('wait_for_element', { selector, timeout }, false);
      throw error;
    }
  }
}

module.exports = NavigationHelper; 