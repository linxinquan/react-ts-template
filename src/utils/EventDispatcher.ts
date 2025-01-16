export interface Event {
  target?: any;
  type: string;
  [attachment: string]: any;
}

export type EventsMap = Record<string, any>;

export type DefaultEventsMap = Record<string, Event>;

export type EventNames<Map extends EventsMap> = keyof Map & (string | symbol);

export type EventListener<Map extends EventsMap, Ev extends EventNames<Map>> = (
  event: Ev extends EventNames<Map> ? Map[Ev] : Event,
) => void;

type EventListenerType = (event: any) => void;

export default class EventDispatcher<DispatchEvents extends EventsMap = DefaultEventsMap> {
  private listeners: Map<EventNames<DispatchEvents>, EventListenerType[]>;

  private tracedTypeSet: Set<EventNames<DispatchEvents>>;

  constructor() {
    this.listeners = new Map();
    this.tracedTypeSet = new Set();
  }

  addEventListener<Ev extends EventNames<DispatchEvents>>(
    type: Ev,
    listener: EventListener<DispatchEvents, Ev>,
  ) {
    let handlers = this.listeners.get(type);
    if (!handlers) {
      handlers = [];
      this.listeners.set(type, handlers);
    }
    if (!handlers.includes(listener)) {
      handlers.push(listener);
    }
  }

  removeEventListener<Ev extends EventNames<DispatchEvents>>(
    type: Ev,
    listener: EventListener<DispatchEvents, Ev>,
  ) {
    const handlers = this.listeners.get(type);
    if (handlers) {
      const index = handlers.indexOf(listener);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  hasEventListener<Ev extends EventNames<DispatchEvents>>(
    type: Ev,
    listener: EventListener<DispatchEvents, Ev>,
  ) {
    const handlers = this.listeners.get(type);
    if (!handlers) {
      return false;
    }

    return handlers.includes(listener);
  }

  getEventListeners<Ev extends EventNames<DispatchEvents>>(type: Ev) {
    return this.listeners.get(type);
  }

  dispatchEvent<Ev extends EventNames<DispatchEvents>>(event: DispatchEvents[Ev]) {
    const handlers = this.listeners.get(event.type);
    if (handlers !== undefined) {
      event.target = this;

      // Make a copy, in case listeners are removed while iterating.
      const array = handlers.slice(0);

      for (let i = 0, l = array.length; i < l; i += 1) {
        array[i].call(this, event);
      }

      event.target = null;
    }
    this.log(event);
  }

  /**
   * @description 方便调试时查看事件调用情况
   * @param types 关心的事件调用情况
   */
  trace<Ev extends EventNames<DispatchEvents>>(types: Ev[] = []) {
    types.forEach((item) => this.tracedTypeSet.add(item));
  }

  private log<Ev extends EventNames<DispatchEvents>>(ev: DispatchEvents[Ev]) {
    if (this.tracedTypeSet.has(ev.type)) {
      const listeners = this.getEventListeners(ev.type) || [];
      // eslint-disable-next-line no-console
      console.log(`${ev.type} event executed ${listeners.length} listeners`);
      // eslint-disable-next-line no-console
      console.log(listeners);
    }
  }
}
