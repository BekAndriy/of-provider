import OpenFin from '@openfin/core';
import { APPS_URLS } from '../../constants/urls';
import { BaseWindow } from '../base-window/base-window'
import { randomUUID } from '../../utils/data';

export class RecentWindow extends BaseWindow {
  private static _instance: RecentWindow;

  // singleton
  private constructor() {
    super();
  }

  static get instance() {
    RecentWindow.initInstance();
    return RecentWindow._instance;
  }

  private static initInstance() {
    if (!RecentWindow._instance) {
      RecentWindow._instance = new RecentWindow()
    }
  }

  get windowCreationOptions(): OpenFin.WindowCreationOptions {
    return {
      ...super.windowCreationOptions,
      name: `recent-window-${randomUUID}`,
      url: APPS_URLS.recent
    }
  }
}