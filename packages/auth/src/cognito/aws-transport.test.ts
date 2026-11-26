import { describe, expect, it, vi } from "vitest";

import { awsTransport } from "./aws-transport";

describe("awsTransport", () => {
  it.each([
    ["InitiateAuth", "InitiateAuthCommand"],
    ["RespondToAuthChallenge", "RespondToAuthChallengeCommand"],
    ["AssociateSoftwareToken", "AssociateSoftwareTokenCommand"],
    ["VerifySoftwareToken", "VerifySoftwareTokenCommand"],
    ["ForgotPassword", "ForgotPasswordCommand"],
    ["ConfirmForgotPassword", "ConfirmForgotPasswordCommand"],
  ] as const)("sends %s as %s with the input unchanged", async (operation, command) => {
    const send = vi.fn(async (_command: unknown) => ({ ok: true, $metadata: { httpStatusCode: 200 } }));
    const transport = awsTransport("ap-south-1", { send });
    const input = { ClientId: "c", Session: "s" };
    await expect(transport.send(operation, input)).resolves.toEqual({ ok: true });
    const sent = send.mock.calls[0]![0] as unknown as { constructor: { name: string }; input: unknown };
    expect(sent.constructor.name).toBe(command);
    expect(sent.input).toEqual(input);
  });

  it("keeps the Cognito error name, so the error map can read it", async () => {
    const err = Object.assign(new Error("Incorrect username or password."), { name: "NotAuthorizedException" });
    const transport = awsTransport("ap-south-1", { send: async () => Promise.reject(err) });
    await expect(transport.send("InitiateAuth", {})).rejects.toMatchObject({ name: "NotAuthorizedException" });
  });

  it("refuses a region that is not an AWS region name", () => {
    expect(() => awsTransport("evil.test/x")).toThrow();
  });
});
