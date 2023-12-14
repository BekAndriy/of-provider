import { BusProvider } from '../base-window/bus-provider'

interface CreatePagePayload {
  action: 'create-page'
  filePath: string
}

interface OpenPayload {
  action: 'workspaces-open' | 'pages-open'
  fileName: string
}

export type RecentPayload = CreatePagePayload | OpenPayload;


export class RecentBus extends BusProvider<RecentPayload> {
  protected channelName: string = 'apps/recent';
}