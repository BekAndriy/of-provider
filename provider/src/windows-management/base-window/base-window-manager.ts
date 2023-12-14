import { BusProvider } from "./bus-provider";
import { QuitPlatformException } from "../../services/exceptions";
import OpenFin from "@openfin/core";

export abstract class BaseWindowManager<T> {
  protected abstract busProvider: BusProvider<any>;

  protected abstract defaultWindowOptions: OpenFin.WindowCreationOptions

  async showWindowOnce() {
    return new Promise<T>((resolve, reject) => {
      const Inter = this.busProvider;

      const handleCloseRequest = () => {
        Inter.destroy();
        reject(new QuitPlatformException())
      }

      // If this code for the provider is executing then the web server
      // must have served the real provider.html which loads this code
      // and not the login page, so we can create a real app
      fin.Window.create({
        ...this.defaultWindowOptions
      })
        .then((authFinWindow) => {
          // User successfully signed in
          Inter.subscribe((payload) => {
            // Destroy IAB Auth Provider
            Inter.destroy();
            authFinWindow.removeListener('close-requested', handleCloseRequest);
            authFinWindow.close();
            resolve(payload)
          })
          authFinWindow.addListener('close-requested', handleCloseRequest)
        });
    })
  }
}