import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt-node"

// Update the matcher to exclude the bootstrap page
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|bootstrap).*)"],
}

// Then in the middleware function, add a check for the register page
export async function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get("auth_token")?.value

  // Get the pathname
  const { pathname } = request.nextUrl

  // Check if the path is protected
  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/overview") ||
    pathname.startsWith("/report")

  // Allow access to register page with valid parameters
  if (pathname === "/register") {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const code = searchParams.get("code")

    if (email && code) {
      return NextResponse.next()
    }

    // If missing parameters, redirect to login
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }

  // Redirect to login if accessing protected route without valid token
  if (isProtectedRoute) {
    if (!token) {
      const url = new URL("/login", request.url)
      return NextResponse.redirect(url)
    }

    const payload = await verifyToken(token)
    if (!payload) {
      const url = new URL("/login", request.url)
      return NextResponse.redirect(url)
    }

    // Check role-based access
    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      const url = new URL("/", request.url)
      return NextResponse.redirect(url)
    }
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (pathname === "/login" && token) {
    const payload = await verifyToken(token)
    if (payload) {
      const url = new URL(payload.role === "admin" ? "/admin" : "/", request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

