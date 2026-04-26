import { NextResponse, type NextRequest } from "next/server";

function parseLang(value: string | null) {
  if (value === "pl" || value === "es" || value === "en") return value;
  return "en";
}

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "x-cosmotips-lang",
    parseLang(request.nextUrl.searchParams.get("lang")),
  );
  requestHeaders.set("x-cosmotips-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
