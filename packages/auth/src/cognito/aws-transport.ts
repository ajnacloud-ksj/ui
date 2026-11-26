/**
 * The CognitoTransport over the AWS SDK v3 Cognito client (owner decision O2: @aws-sdk + our own
 * SRP). These operations are unauthenticated public-client calls, so the client gets no
 * credentials. Spike S3 proves the browser path (CORS, CSP) against the dev pools.
 */
import {
  AssociateSoftwareTokenCommand,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  VerifySoftwareTokenCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import type { CognitoOperation, CognitoTransport } from "./transport";

const REGION = /^[a-z]{2}(?:-[a-z]+)+-\d$/;

/** The one method of the SDK client this transport uses; injectable for tests. */
export interface SdkClient {
  send(command: unknown): Promise<Record<string, unknown>>;
}

// The SDK's input types are stricter than the transport's Record; the machine builds each input to
// the Cognito API shape, and the tests pin those shapes.
type AnyInput = never;
const COMMANDS: Readonly<
  Record<CognitoOperation, new (input: AnyInput) => unknown>
> = {
  InitiateAuth: InitiateAuthCommand,
  RespondToAuthChallenge: RespondToAuthChallengeCommand,
  AssociateSoftwareToken: AssociateSoftwareTokenCommand,
  VerifySoftwareToken: VerifySoftwareTokenCommand,
  ForgotPassword: ForgotPasswordCommand,
  ConfirmForgotPassword: ConfirmForgotPasswordCommand,
};

export function awsTransport(
  region: string,
  client?: SdkClient,
): CognitoTransport {
  if (!REGION.test(region))
    throw new Error("awsTransport: not an AWS region name");
  const sdk: SdkClient =
    client ??
    (new CognitoIdentityProviderClient({ region }) as unknown as SdkClient);
  return {
    async send(operation, input) {
      const Command = COMMANDS[operation];
      const output = await sdk.send(new Command(input as AnyInput));
      // Drop the SDK's request metadata; the machine reads only Cognito's own fields.
      return Object.fromEntries(
        Object.entries(output).filter(([key]) => key !== "$metadata"),
      );
    },
  };
}
