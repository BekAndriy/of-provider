import { Tray } from "../application/tray";
import { NotificationsProvider } from "../notifications/notifications-provider";
import { PlatformProvider } from "./platform-provider";
import { WindowsManager } from "../windows-management";
import { AuthManager } from "../windows-management/auth-window";
import { RecentManager } from "../windows-management/recent-window";
import { RecentPayload } from "../windows-management/recent-window/recent-bus";
import { TokenManager } from "../utils/token-manager";

export class PlatformBootstrapped {
  constructor() {
    this.initDOMListener()
  }

  initDOMListener() {
    window.addEventListener("DOMContentLoaded", async () => {
      // When the platform api is ready we bootstrap the platform.
      const platform = fin.Platform.getCurrentSync();
      await platform.once("platform-api-ready", this.initializeWorkspaceComponents.bind(this));

      // The DOM is ready so initialize the platform
      await this.initializeWorkspacePlatform();

      // Initialize Notifications center
      await NotificationsProvider.instance.init();

      // Initialize the application
      await this.initializeApplication();
    });
  }

  private async quitPlatform() {
    await fin.Platform.getCurrentSync().quit()
  }

  /**
 * Bring the platform to life.
 */
  private async initializeWorkspaceComponents(): Promise<void> {
    const providerWindow = fin.Window.getCurrentSync();
    await providerWindow.once("close-requested", this.quitPlatform.bind(this));
  }

  /**
   * Initialize the workspace platform.
   */
  private async initializeWorkspacePlatform(): Promise<void> {
    WindowsManager.instance.initCustomActions();

    console.log("Initializing workspace platform");
    await PlatformProvider.instance.init();
  }

  private async initializeApplication(): Promise<void> {
    try {
      await AuthManager.instance.initializeAuthentication();
      const openPayload = await RecentManager.instance.showWindowOnce()
      Tray.instance.initTray();
      await WindowsManager.instance.initializeWorkspace(openPayload)
    } catch (error) {
      await this.quitPlatform()
    }
  }
}