// eslint-disable-next-line max-classes-per-file

type Callback = (...params: any[]) => unknown
type EventsGroupObj = Record<number | string | symbol, Callback>;

export class EventHandler<H extends Callback> {
  private readonly events: Map<H, boolean>;

  constructor() {
    this.events = new Map<H, boolean>();
  }

  on(handler: H) {
    this.events.set(handler, false);
  }

  off(handler: H) {
    this.events.delete(handler);
  }

  once(handler: H) {
    this.events.set(handler, true);
  }

  invoke(...data: Parameters<H>) {
    this.events.forEach((_isOnce, handler) => {
      this.invokeHandler(handler, data);
      this.removeHandlerAfterExecution(handler);
    });
  }

  private invokeHandler(handler: Callback, data: Parameters<H>) {
    // eslint-disable-next-line prefer-spread
    handler.apply(null, data);
  }

  private removeHandlerAfterExecution(handler: H) {
    if (this.isOnceHandler(handler)) {
      this.off(handler);
    }
  }

  private isOnceHandler(handler: H) {
    return this.events.get(handler);
  }
}

export class EventsGroup<D extends object, E extends keyof D = keyof D> {
  private readonly events;

  constructor() {
    this.events = new Map();
  }

  on<U extends E>(event: U, handler: D[U]) {
    this.addEventHandler(event, handler, false);
  }

  off<U extends E>(event: U, callback: D[U]) {
    const handlers = this.getEventHandlers(event);
    this.offHandler(handlers, callback as Callback);
  }

  once<U extends E>(event: U, callback: D[U]) {
    this.addEventHandler(event, callback, true);
  }

  // to make types working properly in all places
  // @ts-ignore
  invoke<U extends E>(event: U, ...data: Parameters<D[U]>) {
    const handlers = this.getEventHandlers(event);
    this.invokeHandlers(handlers, data);
  }

  private addEventHandler(event: E, handler: D[E], once: boolean) {
    let handlers = this.getEventHandlers(event);

    if (!handlers) {
      handlers = new EventHandler();
      this.events.set(event, handlers);
    }

    if (once) {
      handlers.once(handler);
    } else {
      handlers.on(handler);
    }
  }

  private getEventHandlers(event: E) {
    return this.events.get(event);
  }

  private invokeHandlers(handlers: EventHandler<Callback>, data: unknown[]) {
    handlers?.invoke(...data)
  }

  private offHandler(handlers: EventHandler<Callback>, callback: Callback) {
    handlers?.off(callback);
  }
}
