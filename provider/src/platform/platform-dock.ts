import { Dock } from "@openfin/workspace";
import { PLATFORM_ICON } from "../constants/urls";

export class PlatformDock {
  private static _instance: PlatformDock;
  private _isVisible = false;

  // singleton
  private constructor() {

  }

  static get instance() {
    PlatformDock.initInstance();
    return PlatformDock._instance;
  }

  private static initInstance() {
    if (!PlatformDock._instance) {
      PlatformDock._instance = new PlatformDock()
    }
  }

  private getOptions() {
    const dockProvider = {
      // This provider shows only the default Workspace components
      title: "OpenFin Dock",
      id: "workspace-dock-001",
      icon: PLATFORM_ICON
    };
    return dockProvider;
  }

  async show() {
    if (this._isVisible) return;
    const dockOptions = this.getOptions()
    await Dock.register(dockOptions);
    await Dock.show()
    this._isVisible = true;
  }

  async hide() {
    await Dock.deregister();
  }
}