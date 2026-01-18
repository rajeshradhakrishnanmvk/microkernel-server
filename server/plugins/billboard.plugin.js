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
