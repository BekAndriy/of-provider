import { BusProvider } from '../base-window/bus-provider'

export class AboutBusProvider extends BusProvider<{}> {
  protected channelName: string = 'apps/about'
}