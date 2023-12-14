import OpenFin from '@openfin/core'

type Subscriber<T> = (payload: T) => unknown

export abstract class BusProvider<T> {
  protected abstract channelName: string;

  private providerBus: OpenFin.ChannelProvider | null = null;

  async subscribe(callback: Subscriber<T>) {
    // entity creates a channel and becomes the channelProvider
    const providerBus = this.providerBus = await fin.InterApplicationBus.Channel.create(this.channelName);

    providerBus.onConnection((identity, payload) => {
      // can reject a connection here by throwing an error
      console.log('Client connection request identity: ', JSON.stringify(identity));
      console.log('Client connection request payload: ', JSON.stringify(payload));
    });

    providerBus.onDisconnection((identity) => {
      // can reject a connection here by throwing an error
      console.log('Client disconnected identity: ', JSON.stringify(identity));
    });

    providerBus.register('response', (payload, identity) => {
      // register a callback for a 'topic' to which clients can dispatch an action
      console.log('Action dispatched by client: ', JSON.stringify(identity));
      console.log('Payload sent in dispatch: ', JSON.stringify(payload));

      callback(payload as T);
    });
  }

  async destroy() {
    if (this.providerBus) {
      console.log(`Destroy Bus Provider. Channel name: ${this.channelName}`)
      await this.providerBus.destroy();
    }
  }
}