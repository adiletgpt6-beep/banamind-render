import { handleSubmitUpload } from "@/lib/handlers";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleSubmitUpload(request, id);
}
