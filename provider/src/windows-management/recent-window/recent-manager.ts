import { BaseWindowManager } from '../base-window/base-window-manager'
import { RecentBus, RecentPayload } from './recent-bus'
import { WindowCreationOptions } from "@openfin/core/src/OpenFin";
import { RecentWindow } from './recent-window'

export class RecentManager extends BaseWindowManager<RecentPayload> {
  protected get busProvider() {
    return new RecentBus();
  };

  protected defaultWindowOptions: WindowCreationOptions = RecentWindow.instance.windowCreationOptions;

  private static _instance: RecentManager;

  // singleton
  private constructor() {
    super();
  }

  static get instance() {
    RecentManager.initInstance();
    return RecentManager._instance;
  }

  private static initInstance() {
    if (!RecentManager._instance) {
      RecentManager._instance = new RecentManager()
    }
  }
}