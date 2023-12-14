import OpenFin from '@openfin/core';
import { randomUUID } from '../../utils/data';
import { TokenManager } from '../../utils/token-manager';

export abstract class BaseWindow {
  private defaultWindowOptions: Partial<OpenFin.WindowCreationOptions> = {
    autoShow: false,
    defaultCentered: true,
    defaultHeight: 500,
    defaultWidth: 600,
    frame: true,
    alwaysOnTop: false,
    resizable: true,
  };

  get windowCreationOptions(): OpenFin.WindowCreationOptions {
    return {
      name: randomUUID(),
      customData: {
        token: TokenManager.instance.token
      },
      ...this.defaultWindowOptions
    };
  }
}