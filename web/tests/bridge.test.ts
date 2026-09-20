import { describe, expect, it } from "vitest";
import { NativeClient, NativeBridgeError } from "../src/bridge/client";

describe("NativeClient browser fallback", () => {
  it("returns the bridge handshake", async () => {
    const result = await new NativeClient().getCapabilities();
    expect(result.bridgeVersion).toBe(1);
    expect(result.capabilities).toContain("app.getCapabilities");
  });

  it("uses a structured error for unavailable skeleton methods", async () => {
    await expect(new NativeClient().call("conversation.create")).rejects.toEqual(
      expect.objectContaining<Partial<NativeBridgeError>>({ code: "CAPABILITY_UNAVAILABLE" }),
    );
  });
});
