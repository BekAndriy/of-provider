import { BusProvider } from '../base-window/bus-provider';

export interface Payload {
  token: string;
  rememberMeChecked: boolean;
}

export class AuthBus extends BusProvider<Payload> {
  protected channelName: string = 'apps/auth';
}