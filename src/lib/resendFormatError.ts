/** Resend SDK returns `{ name, message }` or similar — normalize for logs and UI. */
export function formatResendSendError(error: unknown): string {
  if (error == null) return "Unknown error";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const o = error as { name?: string; message?: string };
    const name = typeof o.name === "string" ? o.name : "";
    const message = typeof o.message === "string" ? o.message : "";
    const joined = [name, message].filter(Boolean).join(": ");
    if (joined) return joined;
    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown error";
    }
  }
  return String(error);
}
