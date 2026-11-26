import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

import { resetSessionEnv } from "./src/session/testing/env";

// Every test starts from a configured app session (the app's entry point does this in real use).
beforeEach(resetSessionEnv);
afterEach(cleanup);
