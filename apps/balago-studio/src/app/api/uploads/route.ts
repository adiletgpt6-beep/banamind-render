import { handleCreateUpload } from "@/lib/handlers";

export const dynamic = "force-dynamic";

// Тело запроса — только JSON с метаданными; сам видеофайл сюда не приходит.
export function POST(request: Request) {
  return handleCreateUpload(request);
}
