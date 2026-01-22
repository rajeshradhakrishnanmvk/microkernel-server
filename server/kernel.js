export class AIMicrokernel {
  constructor() {
    this.plugins = {};
    this.status = {};
    this.eventLog = []; // System event log
    this.maxLogSize = 1000; // Keep last 1000 events
  }

  log(level, pluginName, message, data = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      level, // 'INFO', 'WARN', 'ERROR', 'DEBUG'
      plugin: pluginName || 'KERNEL',
      message,
      data
    };
    
    this.eventLog.push(event);
    
    // Trim log if it exceeds max size
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }
    
    // Also log to console for debugging
    console.log(`[${event.level}] [${event.plugin}] ${event.message}`, data);
    
    return event;
  }

  getLog(filter = {}) {
    let logs = [...this.eventLog];
    
    // Filter by level
    if (filter.level) {
      logs = logs.filter(log => log.level === filter.level);
    }
    
    // Filter by plugin
    if (filter.plugin) {
      logs = logs.filter(log => log.plugin === filter.plugin);
    }
    
    // Limit number of results
    if (filter.limit) {
      logs = logs.slice(-filter.limit);
    }
    
    return logs;
  }

  clearLog() {
    const count = this.eventLog.length;
    this.eventLog = [];
    this.log('INFO', 'KERNEL', `Cleared ${count} log entries`);
  }

  register(name, plugin) {
    this.plugins[name] = plugin;
    this.status[name] = "REGISTERED";
    this.log('INFO', 'KERNEL', `Plugin registered: ${name}`);
  }

  unregister(name) {
    delete this.plugins[name];
    delete this.status[name];
    this.log('INFO', 'KERNEL', `Plugin unregistered: ${name}`);
  }

  async boot() {
    this.log('INFO', 'KERNEL', 'System boot initiated');
    for (const name in this.plugins) {
      try {
        this.log('DEBUG', name, 'Initializing plugin');
        if (this.plugins[name].init) {
          await this.plugins[name].init();
        }
        this.status[name] = "ACTIVE";
        this.log('INFO', name, 'Plugin activated successfully');
      } catch (error) {
        this.status[name] = "CRASHED_ON_LOAD";
        this.log('ERROR', name, 'Plugin failed to initialize', { error: error.message });
      }
    }
    this.log('INFO', 'KERNEL', 'System boot completed');
  }

  async run(name, payload) {
    if (this.status[name] !== "ACTIVE") {
      this.log('WARN', name, 'Attempted to run inactive plugin', { status: this.status[name] });
      return { error: `Plugin ${name} not active` };
    }

    try {
      this.log('DEBUG', name, 'Executing plugin', { action: payload.action });
      
      // Pass kernel instance to plugins that need it (for AI generation, etc.)
      const enhancedPayload = { ...payload, kernel: this };
      
      const result = await this.plugins[name].execute(enhancedPayload);
      this.log('DEBUG', name, 'Plugin execution successful', { action: payload.action });
      return { result };
    } catch (e) {
      this.status[name] = "CRASHED_RUNTIME";
      this.log('ERROR', name, 'Plugin runtime error', { error: e.message, stack: e.stack });
      return { error: e.message };
    }
  }

  report() {
    return this.status;
  }
}
