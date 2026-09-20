export const BRIDGE_VERSION = 1 as const;

export type Capability =
  | "app.getCapabilities"
  | "app.getVersions"
  | "app.openNativeSettings"
  | "conversation.list"
  | "conversation.create"
  | "conversation.get"
  | "conversation.delete"
  | "message.list"
  | "draft.get"
  | "draft.save"
  | "draft.delete"
  | "ai.prepareRequest"
  | "ai.requestSend"
  | "ai.cancel"
  | "health.requestAuthorization"
  | "health.querySteps"
  | "health.queryHeartRate"
  | "health.querySleep"
  | "health.clearCache"
  | "camera.capture"
  | "media.list"
  | "media.delete"
  | "media.getDisplayResource"
  | "ocr.recognize"
  | "settings.get"
  | "settings.update"
  | "updates.getStatus"
  | "updates.check"
  | "updates.reportEditingState"
  | "updates.requestApply"
  | "updates.requestRollback"
  | "privacy.requestEraseAll";

export interface BridgeRequest {
  id: string;
  bridgeVersion: typeof BRIDGE_VERSION;
  method: Capability;
  params: Record<string, unknown>;
}

export interface BridgeError {
  code: string;
  message: string;
}

export type BridgeResponse<T> =
  | { id: string; ok: true; data: T }
  | { id: string; ok: false; error: BridgeError };

export interface CapabilitiesResult {
  bridgeVersion: number;
  nativeVersion: string;
  capabilities: Capability[];
}

export interface VersionsResult {
  nativeVersion: string;
  webVersion: string;
  bridgeVersion: number;
}

export interface UpdateStatus {
  state: "disabled" | "idle" | "checking" | "downloading" | "pending" | "failed";
  activeWebVersion: string;
  message?: string;
}

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        nativeBridge?: { postMessage: (request: BridgeRequest) => Promise<BridgeResponse<unknown>> };
      };
    };
  }
}
