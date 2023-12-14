import { CustomActionPayload, GlobalContextMenuOptionType } from "@openfin/workspace-platform";

export enum CustomActionsIds {
  OpenNewWindow = 'OpenNewWindow',
  OpenPage = 'OpenPage',
  OpenDock = 'OpenDock',
  SignOut = 'SignOut',
  Quit = 'Quit'
}

type Callback = (payload: CustomActionPayload) => unknown;

export class PlatformCustomActions {
  private static _instance: PlatformCustomActions;

  // action id
  private readonly _customActionsMap = new Map<string, Callback>();


  // singleton
  private constructor() {

  }

  static get instance() {
    PlatformCustomActions.initInstance();
    return PlatformCustomActions._instance;
  }

  private static initInstance() {
    if (!PlatformCustomActions._instance) {
      PlatformCustomActions._instance = new PlatformCustomActions()
    }
  }

  getCustomActionsMap() {
    return Object.fromEntries(this._customActionsMap)
  }

  // all actions should be initialize before platform-provider.init
  setActionHandler(actionId: CustomActionsIds, callback: Callback) {
    this._customActionsMap.set(actionId, callback);
  }

  getCustomActionConfig(label: string, actionId: CustomActionsIds, customData?: unknown) {
    return {
      label: label,
      data: {
        type: GlobalContextMenuOptionType.Custom,
        action: {
          id: actionId,
          customData
        }
      }
    }
  }
}