export const localConfig = {
  DEBUG_MODE: JSON.parse(process.env.DEBUG_MODE ?? "false"),
  JWT_SECRET: process.env.JWT_SECRET ?? "jwt-default",
};

export function logDebug(...msg: any[]) {
  if (localConfig.DEBUG_MODE) console.debug(...msg);
}
