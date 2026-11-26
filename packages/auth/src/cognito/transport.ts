/**
 * The Cognito calls the sign-in page makes, as one small interface: the state machine depends on
 * this, not on the AWS SDK, so it is tested against a fake pool (src/testing/fake-cognito.ts).
 * All are unauthenticated public-client calls; no AWS credentials exist in the browser.
 */

export type CognitoOperation =
  | "InitiateAuth"
  | "RespondToAuthChallenge"
  | "AssociateSoftwareToken"
  | "VerifySoftwareToken"
  | "ForgotPassword"
  | "ConfirmForgotPassword";

export interface CognitoTransport {
  send(operation: CognitoOperation, input: Record<string, unknown>): Promise<Record<string, unknown>>;
}
