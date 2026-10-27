import { handleLogin } from "@/lib/handlers";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleLogin(request);
}
