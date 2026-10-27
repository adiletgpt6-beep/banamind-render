import { handleLogout } from "@/lib/handlers";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleLogout(request);
}
