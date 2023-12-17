import OpenFin from '@openfin/core';
import { APPS_URLS } from '../../constants/urls';
import { BaseWindow } from '../base-window/base-window'

export class AboutWindow extends BaseWindow {
  private static _instance: AboutWindow;

  // singleton
  private constructor() {
    super()
  }

  static get instance() {
    AboutWindow.initInstance();
    return AboutWindow._instance;
  }

  private static initInstance() {
    if (!AboutWindow._instance) {
      AboutWindow._instance = new AboutWindow()
    }
  }

  get windowCreationOptions(): OpenFin.WindowCreationOptions {
    return {
      ...super.windowCreationOptions,
      url: APPS_URLS.about,
      autoShow: true,
    }
  }
}