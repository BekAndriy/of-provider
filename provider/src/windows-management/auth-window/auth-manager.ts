import OpenFin from "@openfin/core";
import { AuthBus, Payload } from "./auth-bus";
import { TokenManager } from "../../utils/token-manager";
import * as api from "../../api";
import { BaseWindowManager } from "../base-window";
import { AuthWindow } from "./auth-window";

export class AuthManager extends BaseWindowManager<Payload> {
  private static _instance: AuthManager;
  protected get busProvider() {
    return new AuthBus();
  };
  protected defaultWindowOptions: OpenFin.WindowCreationOptions = AuthWindow.instance.windowCreationOptions;

  // singleton
  private constructor() {
    super();
  }

  static get instance() {
    AuthManager.initInstance();
    return AuthManager._instance;
  }

  private static initInstance() {
    if (!AuthManager._instance) {
      AuthManager._instance = new AuthManager()
    }
  }

  async verifyToken() {
    if (TokenManager.instance.hasToken()) {
      // Placeholder to validate token
      // Profile should be stored somewhere and used later
      return await api.user.getProfile()
    }
    throw new Error('Unauthorized');
  }

  async initializeAuthentication() {
    return this.verifyToken()
      .catch(() => this.showWindowOnce()
        .then((payload) => {
          TokenManager.instance.preserveSession = payload.rememberMeChecked;
          TokenManager.instance.token = payload.token;
        }))
  }
}