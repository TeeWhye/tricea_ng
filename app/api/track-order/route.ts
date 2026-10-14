import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { orderTrackingRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getClientIp(request: Request): string | null {
  const vercelIp = request.headers.get("x-vercel-forwarded-for");

  if (vercelIp) {
    const clientIp = vercelIp.split(",")[0].trim();

    if (clientIp) {
      return clientIp;
    }
  }

  // Use a fixed identifier only during local development.
  // All local requests share the same rate-limit allowance.
  if (process.env.NODE_ENV === "development") {
    return "local-development";
  }

  return null;
}

export async function POST(request: Request) {
  try {

    const clientIp = getClientIp(request);

if (!clientIp) {
  return NextResponse.json(
    {
      error: "Order tracking is temporarily unavailable. Please try again later.",
    },
    { status: 503 },
  );
}

let rateLimitResult;

try {
  rateLimitResult = await orderTrackingRateLimit.limit(clientIp);
} catch (error) {
  console.error("Order tracking rate-limit check failed:", error);

  return NextResponse.json(
    {
      error: "Order tracking is temporarily unavailable. Please try again later.",
    },
    { status: 503 },
  );
}

    const rateLimitHeaders = {
      "X-RateLimit-Limit": String(rateLimitResult.limit),
      "X-RateLimit-Remaining": String(rateLimitResult.remaining),
      "X-RateLimit-Reset": String(rateLimitResult.reset),
    };

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many tracking attempts. Please wait 15 minutes and try again." },
        {
          status: 429,
          headers: {
            ...rateLimitHeaders,
            "Retry-After": String(
              Math.max(
                1,
                Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
              ),
            ),
          },
        },
      );
    }

let body: unknown;

try {
  body = await request.json();
} catch {
  return NextResponse.json(
    { error: "Invalid request body." },
    { status: 400, headers: rateLimitHeaders },
  );
}

if (
  typeof body !== "object" ||
  body === null ||
  Array.isArray(body)
) {
  return NextResponse.json(
    { error: "Invalid request body." },
    { status: 400, headers: rateLimitHeaders },
  );
}

const requestBody = body as Record<string, unknown>;

const orderNumber =
  typeof requestBody.orderNumber === "string"
    ? requestBody.orderNumber.trim()
    : "";

const trackingToken =
  typeof requestBody.trackingToken === "string"
    ? requestBody.trackingToken.trim()
    : "";

    if (!orderNumber || !trackingToken) {
      return NextResponse.json(
        { error: "Enter your order reference and tracking token." },
        { status: 400, headers: rateLimitHeaders },
      );
    }

    if (
      orderNumber.length > 100 ||
      trackingToken.length !== 64 ||
      !/^[a-f0-9]{64}$/i.test(trackingToken)
    ) {
      return NextResponse.json(
        { error: "Invalid order reference or tracking token." },
        { status: 400, headers: rateLimitHeaders },
      );
    }

    const trackingTokenHash = createHash("sha256")
      .update(trackingToken)
      .digest("hex");

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        trackingTokenHash,
      },
      select: {
        orderNumber: true,
        status: true,
        payment: {
          select: {
            status: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "We couldn't find an order with those details." },
        { status: 404, headers: rateLimitHeaders },
      );
    }

    return NextResponse.json(
      {
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.payment?.status ?? null,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: order.items.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
          })),
        },
      },
      { headers: rateLimitHeaders },
    );
  } catch (error) {
    console.error("Guest order tracking failed:", error);

    return NextResponse.json(
      {
        error: "Unable to track your order right now. Please try again later.",
      },
      { status: 500 },
    );
  }
}