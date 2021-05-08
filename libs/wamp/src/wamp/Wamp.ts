import { w3cwebsocket } from 'websocket';
import { ConfigService } from '@nestjs/config';

import WampyClient, {
  Wampy,
  Payload,
  Callback,
  ErrorArgs,
  WampyOptions,
  SuccessCallback,
  CallCallbacksHash,
  CallAdvancedOptions,
} from 'wampy';

export class Wamp {
  session: Wampy;

  connected = false;
  lastConnected: Date;
  connectedSince: Date;

  constructor(private config: ConfigService) {}

  get status() {
    return this.session.getOpStatus().description;
  }

  async connect(options: WampyOptions) {
    if (this.connected) {
      console.log('WAMP is connected already');

      return false;
    }

    const url = this.config.get('CROSSBAR_URI');

    try {
      const wampSession = new WampyClient(url, {
        ws: w3cwebsocket,
        maxRetries: 999,
        reconnectInterval: 1000,
        onConnect() {
          console.log(`Connect to WAMP router at: ${url}`);
        },
        onClose() {
          console.log(`Successfully disconnected from router: ${url}`);
        },
        onError: <Callback>function (err: ErrorArgs) {
          console.log(
            `Something when wrong while connections to router: ${url}`
          );
          console.log('ERROR: ', err);
        },
        onReconnect() {
          console.log(`Reconnecting to router: ${url} ...`);
        },
        onReconnectSuccess() {
          console.log(`Successfully reconected to router: ${url}`);
        },
        ...options,
      });

      this.session = wampSession;

      if (this.status !== 'Success!') {
        throw new Error(this.status);
      }

      this.connected = true;
      this.connectedSince = new Date();
    } catch (error) {
      console.log(
        'There was an error connecting to the WAMP router. => ERROR: ',
        error
      );
    }
  }

  async disconnect() {
    if (!this.connected) {
      console.log('WAMP is not connected');

      return false;
    }
    try {
      await this.session.disconnect();

      this.lastConnected = this.connectedSince;

      this.session = null;
      this.connected = null;
      this.connectedSince = null;
    } catch (error) {
      console.log(
        'There was an error disconnecting from the WAMP router. => ERROR: ',
        error
      );
    }
  }

  async call(
    topicURI: string,
    payload?: Payload,
    callbacks?: SuccessCallback | CallCallbacksHash,
    advancedOptions?: CallAdvancedOptions
  ) {
    return this.session.call(topicURI, payload, callbacks, advancedOptions);
  }

  async publish(
    topicURI: string,
    payload?: WampyClient.Payload,
    callbacks?: WampyClient.PublishCallbacksHash,
    advancedOptions?: WampyClient.PublishAdvancedOptions
  ) {
    return this.session.publish(topicURI, payload, callbacks, advancedOptions);
  }

  async subscribe(
    topicURI: string,
    callbacks: WampyClient.EventCallback | WampyClient.SubscribeCallbacksHash,
    advancedOptions?: WampyClient.SubscribeAdvancedOptions
  ) {
    return this.session.subscribe(topicURI, callbacks, advancedOptions);
  }

  async register(
    topicURI: string,
    callbacks: WampyClient.RPCCallback | WampyClient.RegisterCallbacksHash,
    avdancedOptions?: WampyClient.RegisterAdvancedOptions
  ) {
    return this.session.register(topicURI, callbacks, avdancedOptions);
  }
}
