import { NextResponse } from "next/server";
import { liveblocks, getUserColor } from "@/lib/liveblocks";
import { checkProjectAccess } from "@/lib/project-access";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { room } = await request.json();
    if (!room) {
      return new NextResponse("Missing room", { status: 400 });
    }

    const access = await checkProjectAccess(room);
    if (!access.hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    try {
      await liveblocks.getRoom(room);
    } catch (e: any) {
      // Room does not exist, create it
      await liveblocks.createRoom(room, {
        defaultAccesses: [],
      });
    }

    const name =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.emailAddresses[0]?.emailAddress || "Anonymous";

    const session = liveblocks.prepareSession(user.id, {
      userInfo: {
        name,
        avatar: user.imageUrl,
        color: getUserColor(user.id),
      },
    });

    session.allow(room, session.FULL_ACCESS);

    const { status, body } = await session.authorize();
    
    return new Response(body, { status });
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
