import * as Notifications from "@openfin/workspace/notifications";
import { PLATFORM_ICON } from "../constants/urls";

export class NotificationsProvider {
  private static _instance: NotificationsProvider;

  // singleton
  private constructor() {

  }

  static get instance() {
    NotificationsProvider.initInstance();
    return NotificationsProvider._instance;
  }

  private static initInstance() {
    if (!NotificationsProvider._instance) {
      NotificationsProvider._instance = new NotificationsProvider()
    }
  }

  async init() {
    await Notifications.register({
      notificationsPlatformOptions: {
        id: 'provider-notification-001',
        icon: PLATFORM_ICON,
        title: 'Notifications Center'
      }
    })
  }
}