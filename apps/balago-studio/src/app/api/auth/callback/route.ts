import { handleCallback } from "@/lib/handlers";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleCallback(request);
}
