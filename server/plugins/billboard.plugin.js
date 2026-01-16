/**
 * Billboard Plugin
 * 
 * Manages AI-enabled conversation billboards.
 * Each billboard is a persistent conversation thread that can be displayed.
 */

export class BillboardPlugin {
  async init() {
    this.billboards = new Map();
    this.nextId = 1;
  }

  async execute({ action, ...params }) {
    switch (action) {
      case 'create':
        return this.createBillboard(params);
      case 'addMessage':
        return this.addMessage(params);
      case 'get':
        return this.getBillboard(params.id);
      case 'list':
        return this.listBillboards();
      case 'delete':
        return this.deleteBillboard(params.id);
      case 'generateConversation':
        return this.generateConversation(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  createBillboard({ title, description, style = 'default' }) {
    const id = this.nextId++;
    const billboard = {
      id,
      title: title || `Billboard ${id}`,
      description: description || '',
      style,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true
    };
    
    this.billboards.set(id, billboard);
    return billboard;
  }

  addMessage({ id, role, content }) {
    const billboard = this.billboards.get(id);
    if (!billboard) {
      throw new Error(`Billboard ${id} not found`);
    }
    
    if (content === undefined || content === null) {
      throw new Error('Message content is required');
    }

    const message = {
      role: role || 'user',
      content,
      timestamp: new Date().toISOString()
    };

    billboard.messages.push(message);
    billboard.updatedAt = new Date().toISOString();
    
    return billboard;
  }

  getBillboard(id) {
    const billboard = this.billboards.get(id);
    if (!billboard) {
      throw new Error(`Billboard ${id} not found`);
    }
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

  generateConversation({ id, topic, turns = 3 }) {
    const billboard = this.billboards.get(id);
    if (!billboard) {
      throw new Error(`Billboard ${id} not found`);
    }

    // Store generation metadata
    billboard.generationRequest = {
      topic,
      turns,
      timestamp: new Date().toISOString()
    };
    billboard.updatedAt = new Date().toISOString();

    return {
      id,
      topic,
      turns,
      status: 'pending'
    };
  }
}
