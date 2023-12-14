import { CustomActionsMap, GlobalContextMenuOptionType, init as initPlatform } from "@openfin/workspace-platform";
import { PLATFORM_ICON } from "../constants/urls";
import { createPlatformOverride } from "./platform-override";
import { PlatformCustomActions } from "./platform-custom-actions";

export class PlatformProvider {
  private static _instance: PlatformProvider;

  // singleton
  private constructor() {

  }

  static get instance() {
    PlatformProvider.initInstance();
    return PlatformProvider._instance;
  }

  private static initInstance() {
    if (!PlatformProvider._instance) {
      PlatformProvider._instance = new PlatformProvider()
    }
  }

  init() {
    return initPlatform({
      browser: {
        defaultWindowOptions: {
          icon: PLATFORM_ICON,
          workspacePlatform: {
            pages: [],
            favicon: PLATFORM_ICON
          }
        }
      },
      overrideCallback: async (platformConstructor) =>
        createPlatformOverride(
          platformConstructor,
        ),
      customActions: this.getCustomActions(),
      theme: this.getThemesConfigs()
    })
  }

  private getThemesConfigs() {
    return [
      {
        label: "Default",
        default: "dark",
        palette: {
          brandPrimary: "#0A76D3",
          brandSecondary: "#383A40",
          backgroundPrimary: "#1E1F23"
        }
      }
    ]
  }

  private getCustomActions(): CustomActionsMap {
    return PlatformCustomActions.instance.getCustomActionsMap()
  }
}