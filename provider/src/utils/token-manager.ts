export class TokenManager {
  private static _instance: TokenManager;
  private readonly _tokenStorageKey = 'auth_token';
  private _preserveSession = false;

  // singleton
  private constructor() {

  }

  static get instance() {
    TokenManager.initInstance();
    return TokenManager._instance;
  }

  private static initInstance() {
    if (!TokenManager._instance) {
      TokenManager._instance = new TokenManager()
    }
  }


  get token() {
    return this.getTokenFromStore(sessionStorage) ?? this.getTokenFromStore(localStorage) ?? '';
  }

  set token(token: string) {
    this.cleanTokens();
    this.getStore().setItem(this._tokenStorageKey, token);

  }

  set preserveSession(preserve: boolean) {
    this._preserveSession = preserve;
  }

  get preserveSession() {
    return this._preserveSession;
  }

  hasToken() {
    return !!this.token;
  }

  validateToken() {
    // some custom token validation
    return this.hasToken();
  }

  cleanTokens() {
    localStorage.removeItem(this._tokenStorageKey);
    sessionStorage.removeItem(this._tokenStorageKey);
  }

  private getStore() {
    return this._preserveSession ? window.localStorage : window.sessionStorage;
  }

  private getTokenFromStore(store: Storage) {
    return store.getItem(this._tokenStorageKey);
  }
}



