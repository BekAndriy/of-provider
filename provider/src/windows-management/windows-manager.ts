import { IdentityEvent } from '@openfin/core/src/api/events/base';
import OpenFin from '@openfin/core';
import { Workspace } from '@openfin/workspace-platform';
import { randomUUID } from '../utils/data';
import { BrowserCreateWindowRequest, BrowserWindowModule, CustomActionPayload, CustomButtonActionPayload, Page, PageLayout, PageLayoutDetails, WorkspacePlatformModule, getCurrentSync } from '@openfin/workspace-platform';
import { BrowserWorkspacePlatformWindowOptions, PageWithUpdatableRuntimeAttribs } from '@openfin/workspace/client-api-platform/src/shapes';
import { CustomActionsIds, PlatformCustomActions } from '../platform/platform-custom-actions';
import { NotificationsManager } from '../notifications/notifications-manager';
import * as api from '../api'
import { TokenManager } from '../utils/token-manager';
import { RecentPayload } from './recent-window/recent-bus';
import { Tray } from '../application/tray';
import { AuthManager } from './auth-window';
import { RecentManager } from './recent-window';
import { APPS_URLS } from '../constants/urls';
import { AboutManager } from './about-window';


const OPEN_WINDOW_EVENT_ID = 'open-window';

export class WindowsManager {
  private static _instance: WindowsManager;

  private constructor() {
    this.onWindowClosed = this.onWindowClosed.bind(this)
  }

  static get instance() {
    WindowsManager.initInstance();
    return WindowsManager._instance;
  }

  private static initInstance() {
    if (!WindowsManager._instance) {
      WindowsManager._instance = new WindowsManager()
    }
  }

  async loadWorkspace(workspaceName: string) {
    try {
      const workspace: Workspace = await api.store.workspaces.get(workspaceName);
      const platform = getCurrentSync();
      await platform.applyWorkspace(workspace, { skipPrompt: true });
    } catch (error) {
      NotificationsManager.instance.create({
        title: "Failed to load Workspace",
        body: "Something unexpected happened during opening Workspace."
      })
    }
  }

  async loadPage(pageName: string) {
    try {
      const page: Page = await api.store.pages.get(pageName);
      await this.createBrowserWindow({ pages: [page] });
    } catch (error) {
      NotificationsManager.instance.create({
        title: "Failed to load Workspace",
        body: "Something unexpected happened during opening Workspace."
      })
    }
  }

  async createBrowserWindowWithPage(hasUnsavedChanges = true) {
    const page: Page = await this.createPageWithLayout(
      "Untitled Page",
      this.createDefaultPageLayout(),
      hasUnsavedChanges
    );
    const pages: Page[] = [page];
    const createdBrowserWin: BrowserWindowModule = await this.createBrowserWindow({ pages });;

    return createdBrowserWin;
  }

  async initializeWorkspace(recentPayload: RecentPayload) {
    if (recentPayload.action === 'workspaces-open') {
      await this.loadWorkspace(recentPayload.fileName);
    } else if (recentPayload.action === 'pages-open') {
      await this.loadPage(recentPayload.fileName);
    } else {
      // default window
      await this.createBrowserWindowWithPage()
    }
    this.addListeners();
  }

  private addListeners() {
    fin.Platform.getCurrentSync().addListener('window-closed', this.onWindowClosed)
  }

  private removeListeners() {
    fin.Platform.getCurrentSync().removeListener('window-closed', this.onWindowClosed)
  }

  private onWindowClosed(event: IdentityEvent) {
    fin.Platform.getCurrentSync().Application.getChildWindows()
      .then((windows) => {
        if (!windows.length) {
          this.removeListeners();
          this.showActiveWorkspaceNotification()
        }
      })
  }

  private async createBrowserWindow(platformOptions?: Partial<BrowserWorkspacePlatformWindowOptions>) {
    const { pages } = platformOptions || {};
    const windowOptions: BrowserCreateWindowRequest = {
      // all windows are opening in the same way
      // so to depreciate them we need to add some additional field "type" 
      customData: { type: "browser-window" },
      workspacePlatform: {
        pages: pages || [],
        disableMultiplePages: false,
        newTabUrl: APPS_URLS.launcher,
        newPageUrl: APPS_URLS.launcher
      }
    };

    const platform = getCurrentSync();
    const createdBrowserWin: BrowserWindowModule = await platform.Browser.createWindow(windowOptions);

    return createdBrowserWin;
  }

  private showActiveWorkspaceNotification() {
    NotificationsManager.instance.create({
      title: "Workspace is launching on background",
      body: "You can continue to work with the workspace by Tray Menu or you can open a new Browser window now.",
      onButtonClick: (event) => {
        event.result?.id === OPEN_WINDOW_EVENT_ID && this.createBrowserWindowWithPage()
      },
      buttons: [
        {
          title: 'Open Window',
          type: "button",
          cta: true,
          onClick: {
            id: OPEN_WINDOW_EVENT_ID
          }
        }
      ]
    })
  }

  /**
   * @description add event listeners for custom actions in the global menus
   */
  initCustomActions() {
    PlatformCustomActions.instance.setActionHandler(CustomActionsIds.OpenNewWindow, this.openNewWindowHandler.bind(this));
    PlatformCustomActions.instance.setActionHandler(CustomActionsIds.OpenPage, this.openPageHandler.bind(this));
    PlatformCustomActions.instance.setActionHandler(CustomActionsIds.SignOut, this.signOut.bind(this));
    PlatformCustomActions.instance.setActionHandler(CustomActionsIds.About, this.openAboutWindow.bind(this));
  }

  private openNewWindowHandler(payload: CustomActionPayload) {
    this.createBrowserWindowWithPage();
  }

  /**
   * @description Opens page in the active Browser window
   */
  private async openPageHandler(payload: CustomActionPayload) {
    const { windowIdentity, customData } = payload as CustomButtonActionPayload;
    const { name } = customData;
    const platform: WorkspacePlatformModule = getCurrentSync();
    const targetWindow = platform.Browser.wrapSync(windowIdentity);
    const page = await api.store.pages.get<PageWithUpdatableRuntimeAttribs>(name).catch(() => null)
    if (page) {
      await targetWindow.addPage(page);
      await targetWindow.setActivePage(page.pageId);
    }
  }

  private async signOut() {
    try {
      // destroy all launched windows
      const allWindows = await getCurrentSync().Application.getChildWindows()
      const closePromises = allWindows.map((finWindow) => finWindow.close());
      this.removeListeners();
      await Promise.all(closePromises);
      Tray.instance.destroy();
      TokenManager.instance.cleanTokens();

      await AuthManager.instance.initializeAuthentication();
      const openPayload = await RecentManager.instance.showWindowOnce()
      Tray.instance.initTray();
      await WindowsManager.instance.initializeWorkspace(openPayload)
    } catch {
      fin.Platform.getCurrentSync().quit();
    }
  }

  private async openAboutWindow() {
    try {
      await AboutManager.instance.showWindowOnce();
    } catch {
    }
  }

  private async createPageWithLayout(
    title: string,
    layout: PageLayout,
    hasUnsavedChanges = false
  ): Promise<PageWithUpdatableRuntimeAttribs> {
    return {
      pageId: randomUUID(),
      title,
      layout: {
        ...layout,
        layoutDetails: { layoutId: `layout-${randomUUID()}` } as unknown as PageLayoutDetails
      },
      isReadOnly: false,
      hasUnsavedChanges
    };
  }

  private createDefaultPageLayout(): PageLayout {
    return {
      content: [
        {
          type: "stack",
          content: [
            {
              type: "component",
              componentName: "view",
              componentState: {
                uuid: fin.me.uuid,
                name: `${randomUUID()}-v1`,
                customData: JSON.stringify({
                  token: TokenManager.instance.token
                }),
                url: APPS_URLS.launcher
              } as Partial<OpenFin.ViewOptions>,
            }
          ]
        }
      ]
    };
  }
}