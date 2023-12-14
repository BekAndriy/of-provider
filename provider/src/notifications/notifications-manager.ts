import * as Notifications from "@openfin/workspace/notifications";
import { randomUUID } from "../utils/data";

type AnyListener = (event: any) => unknown;
type ButtonClickCallback = (event: Notifications.NotificationActionEvent) => unknown;
type NotificationOptions = Notifications.NotificationOptions & {
  onButtonClick?: ButtonClickCallback
}

export class NotificationsManager {
  private static _instance: NotificationsManager;
  private readonly _notificationsMap = new Map<string, Notifications.Notification>();
  private _eventsListeners: Record<string, AnyListener>;
  private _customButtonsHandlers = new Map<string, ButtonClickCallback>();

  // singleton
  private constructor() {
    this._eventsListeners = {
      "notification-created": this.onNotificationCreated.bind(this),
      "notification-closed": this.onNotificationClosed.bind(this),
      "notification-action": this.onNotificationAction.bind(this),
      "notification-toast-dismissed": this.onNotificationToastDismissed.bind(this),
      "notification-form-submitted": this.onNotificationFormSubmitted.bind(this),
      "notifications-count-changed": this.onNotificationsCountChanged.bind(this),
    }

    this.addListeners();
  }

  static get instance() {
    NotificationsManager.initInstance();
    return NotificationsManager._instance;
  }

  private static initInstance() {
    if (!NotificationsManager._instance) {
      NotificationsManager._instance = new NotificationsManager()
    }
  }

  private addListeners() {
    if (this._notificationsMap.size) return
    Object.entries(this._eventsListeners)
      .map((event) => this.addListener.apply(this, event))
  }

  private addListener(event: string, listener: AnyListener) {
    Notifications.addEventListener(event as any, listener)
  }

  private onNotificationCreated(event: Notifications.NotificationCreatedEvent) {
    this._notificationsMap.set(event.notification.id, event.notification);
  }

  private onNotificationClosed(event: Notifications.NotificationClosedEvent) {
    const { id } = event.notification
    this._notificationsMap.delete(id);
    this._customButtonsHandlers.delete(id);
  }

  private onNotificationAction(event: Notifications.NotificationActionEvent) {
    const customButtonClick = this._customButtonsHandlers.get(event.notification.id);
    if (customButtonClick) {
      customButtonClick(event);
    }
  }

  private onNotificationToastDismissed(event: Notifications.NotificationToastDismissedEvent) {

  }

  private onNotificationFormSubmitted(event: Notifications.NotificationFormSubmittedEvent) {

  }

  private onNotificationsCountChanged(event: Notifications.NotificationsCountChanged) {

  }

  private setCustomButtonCallback(notificationId: string, callback?: ButtonClickCallback) {
    if (notificationId && callback) {
      this._customButtonsHandlers.set(notificationId, callback);
    }
  }

  private getNotificationOptions(options: Notifications.NotificationOptions): Notifications.NotificationOptions {
    return {
      toast: "transient",
      category: "default",
      template: "markdown",
      allowReminder: false,
      id: randomUUID(),
      platform: fin.Platform.me.uuid,
      expires: this.generateExpirationDate(30_000),
      ...options
    }
  }

  generateExpirationDate(milliseconds: number): Date {
    const currentTimestamp = Date.now();
    const futureTimestamp = currentTimestamp + milliseconds;
    const futureDate = new Date(futureTimestamp);
    return futureDate;
  }

  async create(options: NotificationOptions) {
    const { onButtonClick, ...rest } = options;
    const notificationOptions = this.getNotificationOptions(rest as Notifications.NotificationOptions);
    const notification = await Notifications.create(notificationOptions);
    this.setCustomButtonCallback(notification.id, onButtonClick);
  }
}