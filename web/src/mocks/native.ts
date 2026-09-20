import type {
  BridgeRequest,
  BridgeResponse,
  CapabilitiesResult,
  Capability,
  UpdateStatus,
  VersionsResult,
} from "../bridge/types";

export const mockCapabilities: Capability[] = [
  "app.getCapabilities",
  "app.getVersions",
  "app.openNativeSettings",
  "conversation.list",
  "health.querySteps",
  "health.queryHeartRate",
  "health.querySleep",
  "camera.capture",
  "media.list",
  "updates.getStatus",
];

export async function mockCall<T>(request: BridgeRequest): Promise<BridgeResponse<T>> {
  await Promise.resolve();
  let data: unknown;
  switch (request.method) {
    case "app.getCapabilities":
      data = {
        bridgeVersion: 1,
        nativeVersion: "browser-mock",
        capabilities: mockCapabilities,
      } satisfies CapabilitiesResult;
      break;
    case "app.getVersions":
      data = { nativeVersion: "browser-mock", webVersion: "0.1.0", bridgeVersion: 1 } satisfies VersionsResult;
      break;
    case "updates.getStatus":
      data = {
        state: "disabled",
        activeWebVersion: "0.1.0",
        message: "浏览器 Mock 模式不检查远程更新",
      } satisfies UpdateStatus;
      break;
    default:
      return {
        id: request.id,
        ok: false,
        error: { code: "CAPABILITY_UNAVAILABLE", message: "此能力尚未在程序骨架中实现" },
      };
  }
  return { id: request.id, ok: true, data: data as T };
}
