export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getServerEnv } = await import("@lib/env.server");
    getServerEnv();
  }
}
