/**
 * Billboard Plugin
 * 
 * Manages digital billboards with AI-powered content generation.
 * Features: Bold fonts, high-contrast colors, minimal text, dynamic rotation.
 */

export class BillboardPlugin {
  async init() {
    this.billboards = new Map();
    this.templates = this.getDefaultTemplates();
    this.nextId = 1;
  }

  async execute({ action, ...params }) {
    switch (action) {
      case 'create':
        return this.createBillboard(params);
      case 'update':
        return this.updateBillboard(params);
      case 'get':
        return this.getBillboard(params.id);
      case 'list':
        return this.listBillboards();
      case 'delete':
        return this.deleteBillboard(params.id);
      case 'generateMessage':
        return this.generateMessage(params);
      case 'getTemplates':
        return this.templates;
      case 'renderCard':
        return this.renderBillboardCard(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  getDefaultTemplates() {
    return [
      {
        id: 'sale',
        name: 'Sale/Promotion',
        bgColor: '#FF0000',
        textColor: '#FFFFFF',
        fontSize: '72px',
        rules: ['Include discount %', 'Add urgency', 'Call to action']
      },
      {
        id: 'announcement',
        name: 'Announcement',
        bgColor: '#0066FF',
        textColor: '#FFFF00',
        fontSize: '64px',
        rules: ['Clear headline', 'Key date/time', 'Contact info']
      },
      {
        id: 'brand',
        name: 'Brand Awareness',
        bgColor: '#000000',
        textColor: '#00FF00',
        fontSize: '56px',
        rules: ['Bold tagline', 'Logo prominent', 'Memorable phrase']
      },
      {
        id: 'event',
        name: 'Event Promotion',
        bgColor: '#8B00FF',
        textColor: '#FFFFFF',
        fontSize: '68px',
        rules: ['Event name', 'Date & location', 'Exciting hook']
      }
    ];
  }

  createBillboard({ 
    text = '', 
    imageUrl = '', 
    imageData = '',
    bgColor = '#000000', 
    textColor = '#FFFFFF', 
    fontSize = '64px',
    template = 'custom',
    rotation = 5000,
    personalization = {}
  }) {
    const id = this.nextId++;
    const billboard = {
      id,
      text: this.validateText(text),
      imageUrl,
      imageData, // Base64 image data
      bgColor,
      textColor,
      fontSize,
      template,
      rotation,
      personalization,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true
    };
    
    this.billboards.set(id, billboard);
    return billboard;
  }

  /**
   * Renders billboard content with strict 3x5 readability rules
   * 
   * @param {Object} config - Billboard configuration
   * @param {string} config.headline - Headline text (max 7 words, read in <3 seconds)
   * @param {string} config.content - Main content (3x5 or 5x3 format)
   * @param {number} config.cardWidth - Card width in pixels
   * @param {number} config.cardHeight - Card height in pixels
   * @param {string} config.layoutMode - 'auto', '3x5', or '5x3'
   * @returns {Object} Rendered card with validated content and layout
   */
  renderBillboardCard({
    headline = '',
    content = '',
    cardWidth = 800,
    cardHeight = 600,
    layoutMode = 'auto'
  }) {
    // Step 1: Validate and truncate headline (max 7 words)
    const validatedHeadline = this.validateHeadline(headline);
    
    // Step 2: Enforce 3x5 Rule on content
    const validatedContent = this.enforce3x5Rule(content, layoutMode);
    
    // Step 3: Calculate text ratio (target 40% of card space)
    const layout = this.calculateTextLayout({
      headline: validatedHeadline,
      content: validatedContent,
      cardWidth,
      cardHeight
    });
    
    return {
      headline: validatedHeadline.text,
      headlineWordCount: validatedHeadline.wordCount,
      content: validatedContent.lines,
      contentFormat: validatedContent.format,
      layout: layout,
      isValid: validatedHeadline.isValid && validatedContent.isValid,
      warnings: [...validatedHeadline.warnings, ...validatedContent.warnings]
    };
  }

  /**
   * Validates headline follows the 7-word maximum rule
   * (Ensures readability in under 3 seconds)
   */
  validateHeadline(headline) {
    const words = headline.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const isValid = wordCount <= 7;
    
    return {
      text: words.slice(0, 7).join(' '),
      wordCount: Math.min(wordCount, 7),
      isValid,
      warnings: isValid ? [] : ['Headline truncated to 7 words for readability']
    };
  }

  /**
   * Enforces the 3x5 Rule:
   * - Either 3 lines with 5 words each (3x5)
   * - Or 5 lines with 3 words each (5x3)
   */
  enforce3x5Rule(content, layoutMode = 'auto') {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const warnings = [];
    let format = layoutMode;
    let validatedLines = [];
    
    // Determine format if auto
    if (layoutMode === 'auto') {
      // Calculate which format fits better
      const totalWords = lines.join(' ').split(/\s+/).filter(w => w.length > 0);
      
      if (totalWords.length <= 15) {
        // 3x5 format (3 lines, 5 words each)
        format = '3x5';
      } else if (totalWords.length <= 15) {
        // 5x3 format (5 lines, 3 words each)
        format = '5x3';
      } else {
        // Default to 3x5 and truncate
        format = '3x5';
        warnings.push('Content truncated to fit 3x5 format');
      }
    }
    
    // Process content based on format
    if (format === '3x5') {
      validatedLines = this.format3x5(content);
    } else if (format === '5x3') {
      validatedLines = this.format5x3(content);
    }
    
    const isValid = this.validate3x5Format(validatedLines, format);
    
    if (!isValid) {
      warnings.push(`Content does not strictly follow ${format} format`);
    }
    
    return {
      lines: validatedLines,
      format,
      isValid,
      warnings
    };
  }

  /**
   * Format content as 3 lines with 5 words each
   */
  format3x5(content) {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const lines = [];
    
    for (let i = 0; i < 3; i++) {
      const lineWords = words.slice(i * 5, (i + 1) * 5);
      if (lineWords.length > 0) {
        lines.push(lineWords.join(' '));
      }
    }
    
    return lines;
  }

  /**
   * Format content as 5 lines with 3 words each
   */
  format5x3(content) {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const lines = [];
    
    for (let i = 0; i < 5; i++) {
      const lineWords = words.slice(i * 3, (i + 1) * 3);
      if (lineWords.length > 0) {
        lines.push(lineWords.join(' '));
      }
    }
    
    return lines;
  }

  /**
   * Validate that lines conform to the specified format
   */
  validate3x5Format(lines, format) {
    if (format === '3x5') {
      // Should have exactly 3 lines, each with up to 5 words
      if (lines.length > 3) return false;
      return lines.every(line => {
        const wordCount = line.split(/\s+/).length;
        return wordCount <= 5;
      });
    } else if (format === '5x3') {
      // Should have exactly 5 lines, each with up to 3 words
      if (lines.length > 5) return false;
      return lines.every(line => {
        const wordCount = line.split(/\s+/).length;
        return wordCount <= 3;
      });
    }
    return false;
  }

  /**
   * Calculate text layout to occupy ~40% of card space
   * This ensures proper white space for readability
   */
  calculateTextLayout({ headline, content, cardWidth, cardHeight }) {
    const cardArea = cardWidth * cardHeight;
    const targetTextArea = cardArea * 0.40; // 40% of card
    
    // Estimate character count
    const headlineChars = headline.text.length;
    const contentChars = content.lines.join('').length;
    const totalChars = headlineChars + contentChars;
    
    // Calculate font sizes based on target area
    // Rough estimation: each character occupies fontSize * 0.6 width and fontSize height
    const estimatedCharArea = (fontSize) => {
      const charWidth = fontSize * 0.6;
      const charHeight = fontSize;
      return totalChars * charWidth * charHeight;
    };
    
    // Binary search for optimal font size
    let minFontSize = 24;
    let maxFontSize = 120;
    let optimalFontSize = 64;
    
    while (maxFontSize - minFontSize > 2) {
      const midSize = Math.floor((minFontSize + maxFontSize) / 2);
      const estimatedArea = estimatedCharArea(midSize);
      
      if (estimatedArea < targetTextArea) {
        minFontSize = midSize;
      } else {
        maxFontSize = midSize;
      }
    }
    
    optimalFontSize = minFontSize;
    
    // Calculate line height (typically 1.2-1.5 of font size)
    const lineHeight = optimalFontSize * 1.3;
    
    // Calculate padding to center text
    const headlineHeight = lineHeight;
    const contentHeight = content.lines.length * lineHeight;
    const totalTextHeight = headlineHeight + contentHeight + (lineHeight * 0.5); // gap between headline and content
    
    const verticalPadding = Math.max(0, (cardHeight - totalTextHeight) / 2);
    const horizontalPadding = cardWidth * 0.1; // 10% padding on sides
    
    // Calculate actual text area percentage
    const actualTextArea = totalTextHeight * (cardWidth - 2 * horizontalPadding);
    const textRatio = actualTextArea / cardArea;
    
    return {
      fontSize: optimalFontSize,
      lineHeight: lineHeight,
      headlineFontSize: Math.floor(optimalFontSize * 1.3), // Headline 30% larger
      contentFontSize: optimalFontSize,
      padding: {
        top: verticalPadding,
        right: horizontalPadding,
        bottom: verticalPadding,
        left: horizontalPadding
      },
      textRatio: Math.round(textRatio * 100), // Percentage
      targetRatio: 40, // Target 40%
      whiteSpaceRatio: Math.round((1 - textRatio) * 100) // Remaining white space
    };
  }

  validateText(text) {
    // Ensure text follows digital billboard rules
    const lines = text.split('\n');
    const validatedLines = lines.map(line => {
      const words = line.split(' ');
      if (words.length > 7) {
        return words.slice(0, 7).join(' ');
      }
      return line;
    });
    
    return validatedLines.slice(0, 3).join('\n'); // Max 3 lines
  }

  updateBillboard({ id, ...updates }) {
    const billboard = this.billboards.get(id);
    if (!billboard) {
      throw new Error(`Billboard ${id} not found`);
    }
    
    if (updates.text !== undefined) {
      updates.text = this.validateText(updates.text);
    }
    
    Object.assign(billboard, updates);
    billboard.updatedAt = new Date().toISOString();
    
    return billboard;
  }

  getBillboard(id) {
    const billboard = this.billboards.get(id);
    if (!billboard) {
      throw new Error(`Billboard ${id} not found`);
    }
    billboard.views++;
    return billboard;
  }

  listBillboards() {
    return Array.from(this.billboards.values())
      .filter(b => b.active)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  deleteBillboard(id) {
    const billboard = this.billboards.get(id);
    if (!billboard) {
      throw new Error(`Billboard ${id} not found`);
    }
    billboard.active = false;
    billboard.updatedAt = new Date().toISOString();
    return { success: true, id };
  }

  generateMessage({ topic, template = 'sale' }) {
    // Simple rule-based message generation for billboards
    const messages = {
      sale: [
        `${topic.toUpperCase()}\nSAVE 50% NOW\nLIMITED TIME`,
        `HUGE SALE\n${topic}\nTODAY ONLY`,
        `DON'T MISS OUT\n${topic} DEALS\nSHOP NOW`
      ],
      announcement: [
        `BIG NEWS\n${topic}\nLEARN MORE`,
        `ANNOUNCING\n${topic}\nCOMING SOON`,
        `${topic.toUpperCase()}\nSTAY TUNED\nEXCITING UPDATES`
      ],
      brand: [
        `${topic}\nYOUR CHOICE\nOUR PASSION`,
        `EXPERIENCE\n${topic}\nLIKE NEVER BEFORE`,
        `${topic.toUpperCase()}\nQUALITY FIRST`
      ],
      event: [
        `JOIN US\n${topic}\nREGISTER NOW`,
        `${topic.toUpperCase()}\nDON'T MISS IT\nBOOK TODAY`,
        `EXCLUSIVE EVENT\n${topic}\nLIMITED SEATS`
      ]
    };

    const options = messages[template] || messages.sale;
    const selected = options[Math.floor(Math.random() * options.length)];
    
    return {
      text: selected,
      template,
      topic,
      generatedAt: new Date().toISOString()
    };
  }
}
