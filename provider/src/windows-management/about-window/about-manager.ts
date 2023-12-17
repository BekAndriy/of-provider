import { WindowCreationOptions } from "@openfin/core/src/OpenFin";
import { AboutWindow } from "./about-window";
import { BaseWindowManager } from "../base-window";
import { AboutBusProvider } from "./about-bus";

export class AboutManager extends BaseWindowManager<void> {
  private static _instance: AboutManager;

  protected defaultWindowOptions: WindowCreationOptions = AboutWindow.instance.windowCreationOptions;

  protected get busProvider() {
    return new AboutBusProvider();
  };
  // singleton
  private constructor() {
    super();
  }

  static get instance() {
    AboutManager.initInstance();
    return AboutManager._instance;
  }

  private static initInstance() {
    if (!AboutManager._instance) {
      AboutManager._instance = new AboutManager()
    }
  }

  async showWindowOnce(): Promise<void> {
    try {
      await super.showWindowOnce();
    } catch {

    }
  }
}