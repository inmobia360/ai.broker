import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("ai_broker_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
    }

    const user = JSON.parse(sessionCookie.value);
    return NextResponse.json({ ok: true, authenticated: true, user });
  } catch {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
  }
}
