import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Missing id parameter", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { fotoProfil: true },
    });

    if (!user || !user.fotoProfil) {
      return new Response("Not Found", { status: 404 });
    }

    // Parse base64 data url (e.g. data:image/png;base64,iVBORw0KGgo...)
    const match = user.fotoProfil.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      const contentType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");

      return new Response(buffer, {
        headers: {
          "Content-Type": contentType,
          // Let browser cache it but allow cache-busting via version parameter
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return new Response("Invalid image format", { status: 400 });
  } catch (error) {
    console.error("Error serving profile picture:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
