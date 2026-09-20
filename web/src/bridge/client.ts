import {
  BRIDGE_VERSION,
  type BridgeRequest,
  type BridgeResponse,
  type CapabilitiesResult,
  type Capability,
  type UpdateStatus,
  type VersionsResult,
} from "./types";
import { mockCall } from "../mocks/native";

export class NativeBridgeError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "NativeBridgeError";
  }
}

type EventHandler = (data: unknown) => void;

export class NativeClient {
  private readonly eventHandlers = new Map<string, Set<EventHandler>>();

  async call<T>(method: Capability, params: Record<string, unknown> = {}): Promise<T> {
    const request: BridgeRequest = {
      id: crypto.randomUUID(),
      bridgeVersion: BRIDGE_VERSION,
      method,
      params,
    };

    const handler = typeof window === "undefined"
      ? undefined
      : window.webkit?.messageHandlers?.nativeBridge;
    const response = handler
      ? ((await handler.postMessage(request)) as BridgeResponse<T>)
      : await mockCall<T>(request);

    if (!response.ok) {
      throw new NativeBridgeError(response.error.code, response.error.message);
    }
    return response.data;
  }

  getCapabilities() {
    return this.call<CapabilitiesResult>("app.getCapabilities");
  }

  getVersions() {
    return this.call<VersionsResult>("app.getVersions");
  }

  getUpdateStatus() {
    return this.call<UpdateStatus>("updates.getStatus");
  }

  subscribe(event: string, handler: EventHandler): () => void {
    const handlers = this.eventHandlers.get(event) ?? new Set<EventHandler>();
    handlers.add(handler);
    this.eventHandlers.set(event, handlers);
    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) this.eventHandlers.delete(event);
    };
  }

  dispatch(event: string, data: unknown) {
    this.eventHandlers.get(event)?.forEach((handler) => handler(data));
  }
}

export const nativeClient = new NativeClient();
