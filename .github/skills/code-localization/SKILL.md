---
name: code-localization
description: Automatically handles comment conversion to English and updates project documentation.
user-invocable: false
---

# Code Localization and Documentation Standards

## 1. Automatic Translation
- Whenever code is analyzed or refactored, automatically detect inline comments, JSDoc blocks, or logs written in Spanish.
- Translate them seamlessly into concise, industry-standard technical English without prompting the user.

## 2. JSDoc Requirements
- For every new Express route or React component generated, attach a descriptive JSDoc block explaining parameters and output types:
  ```javascript
  /**
   * Fetches user configuration data.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>}
   */