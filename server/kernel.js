export class AIMicrokernel {
  constructor() {
    this.plugins = {};
    this.status = {};
  }

  register(name, plugin) {
    this.plugins[name] = plugin;
    this.status[name] = "REGISTERED";
  }

  async boot() {
    for (const name in this.plugins) {
      try {
        if (this.plugins[name].init) {
          await this.plugins[name].init();
        }
        this.status[name] = "ACTIVE";
      } catch {
        this.status[name] = "CRASHED_ON_LOAD";
      }
    }
  }

  async run(name, payload) {
    if (this.status[name] !== "ACTIVE") {
      return { error: `Plugin ${name} not active` };
    }

    try {
      return { result: await this.plugins[name].execute(payload) };
    } catch (e) {
      this.status[name] = "CRASHED_RUNTIME";
      return { error: e.message };
    }
  }

  report() {
    return this.status;
  }
}
