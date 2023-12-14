import OpenFin from '@openfin/core'
import { randomUUID } from '../utils/data';
import { CustomActionsIds, PlatformCustomActions } from '../platform/platform-custom-actions';
import { WindowsManager } from '../windows-management';
import { PlatformDock } from '../platform/platform-dock';
import { TrayIconClickedEvent } from '@openfin/core/src/api/events/application';
import { APPS_URLS, PLATFORM_ICON } from '../constants/urls';

export type PopupMenuEntry<T = unknown> = Omit<OpenFin.MenuItemTemplate, "data"> & { data?: T };

export class Tray {
  private static _instance: Tray;

  // singleton
  private constructor() {
    this.onTrayIconClicked = this.onTrayIconClicked.bind(this);
  }

  static get instance() {
    Tray.initInstance();
    return Tray._instance;
  }

  private static initInstance() {
    if (!Tray._instance) {
      Tray._instance = new Tray()
    }
  }

  async initTray() {
    const app = fin.Application.getCurrentSync();
    const manifest = await app.getManifest();
    const icon = manifest.platform?.icon ?? PLATFORM_ICON;
    await app.setTrayIcon(icon);
    this.initTrayListeners(app);
  }

  async destroy() {
    const app = fin.Application.getCurrentSync();
    await app.removeTrayIcon();
    this.removeTrayListeners(app);
  }

  private initTrayListeners(app: OpenFin.Application) {
    app.addListener("tray-icon-clicked", this.onTrayIconClicked)
  }

  private removeTrayListeners(app: OpenFin.Application) {
    app.removeListener("tray-icon-clicked", this.onTrayIconClicked)
  }

  private async onTrayIconClicked(trayInfo: TrayIconClickedEvent) {
    let win: OpenFin.Window | null = null;
    try {
      // This approach with custom window will be more flexible
      win = await this.createTrayWindow();
      const position = await this.getTrayMenuPosition(0, trayInfo.bounds.height);
      // TODO: OpenFin parentWindow.showPopupMenu has issues with layers and positioning so it is better to create a custom window for menus
      const action = await this.showMenu(position);
      action.id === CustomActionsIds.Quit && fin.Platform.getCurrentSync().quit()
      action.id === CustomActionsIds.OpenNewWindow && WindowsManager.instance.createBrowserWindowWithPage();
      action.id === CustomActionsIds.OpenDock && PlatformDock.instance.show();
    } catch (error) {

    } finally {
      if (win) {
        await win.close();
      }
    }
  }

  private async getTrayMenuPosition(offsetLeft = 0, offsetTop = 0) {
    const { left, top } = await fin.System.getMousePosition()
    return { x: left - (window.screenLeft + offsetLeft), y: top - window.screenTop }
  }

  private async createTrayWindow() {
    const winOption = this.getTrayWindowOptions();
    const win = await fin.Window.create(winOption);
    // Setting the focus to the invisible window makes sure that
    // the context menu is dismissed when clicked away from
    win.focus();
    return win;
  }

  private getTrayWindowOptions() {
    // Create a dummy invisible always on top window that we can use
    // to show the popup menu, this way the menu will always appear
    // on top of other windows
    const winOption: OpenFin.WindowCreationOptions = {
      name: randomUUID(),
      includeInSnapshots: false,
      showTaskbarIcon: false,
      saveWindowState: false,
      defaultWidth: 0,
      defaultHeight: 0,
      url: "about:blank",
      frame: false,
      alwaysOnTop: true,
      smallWindow: true,
      opacity: 0
    };
    return winOption
  }

  private buildMenuTemplate(): PopupMenuEntry[] {
    // const platform = getCurrentSync();
    const menuItems: PopupMenuEntry[] = [
      PlatformCustomActions.instance.getCustomActionConfig('Open New Window', CustomActionsIds.OpenNewWindow, {}),
      PlatformCustomActions.instance.getCustomActionConfig('Open Dock', CustomActionsIds.OpenDock, {}),
      PlatformCustomActions.instance.getCustomActionConfig('Quit', CustomActionsIds.Quit, {}),
    ];
    return menuItems
  }

  private async showMenu(position: { x: number, y: number }) {
    const parentWindow = fin.Window.wrapSync(fin.me.identity);
    const entries = this.buildMenuTemplate();
    const result = await parentWindow.showPopupMenu({
      template: entries,
      x: position.x,
      y: position.y
    })
    if (result.result === "clicked") {
      return result.data.action;
    }
  }
}