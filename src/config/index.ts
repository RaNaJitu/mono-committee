if (!process.env.NODE_ENV) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const dotenv = require("dotenv");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  dotenv.config();
}

import Formatter from "../utils/formatter";
import Config from "./config";
import { validateAndThrow } from "./env.validation";

// Validate environment variables before creating config
// This will throw if critical variables are missing
try {
  validateAndThrow(process.env);
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("❌ Environment validation failed:");
  console.error(errorMessage);
  console.error("\nPlease check your .env file and ensure all required variables are set.");
  process.exit(1);
}

const config = new Config(process.env);
const fmt = new Formatter();

export { config, fmt };
