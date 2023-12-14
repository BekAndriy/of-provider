import OpenFin from '@openfin/core';
import { APPS_URLS } from '../../constants/urls';
import { BaseWindow } from '../base-window';
import { randomUUID } from '../../utils/data';

export class AuthWindow extends BaseWindow {
  private static _instance: AuthWindow;

  // singleton
  private constructor() {
    super()
  }

  static get instance() {
    AuthWindow.initInstance();
    return AuthWindow._instance;
  }

  private static initInstance() {
    if (!AuthWindow._instance) {
      AuthWindow._instance = new AuthWindow()
    }
  }

  get windowCreationOptions(): OpenFin.WindowCreationOptions {
    return {
      ...super.windowCreationOptions,
      name: `authentication-window-${randomUUID()}`,
      autoShow: true,
      defaultCentered: true,
      defaultHeight: 360,
      defaultWidth: 380,
      url: APPS_URLS.auth,
      resizable: false,
      frame: false,
    }
  }
}