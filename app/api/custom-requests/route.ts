import { createHash, randomBytes, randomUUID } from "crypto";
import {
  sendNewCustomRequestEmail,
  sendCustomRequestConfirmationEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type CustomRequestInput = {
  productId: string;
  fullName: string;
  email: string;
  phone: string;
  preferredSize: string;
  preferredColour: string;
  customSpecifications?: string;
};

function generateRequestReference() {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const random = randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase();

  return `TRC-CR-${date}-${random}`;
}

function hashAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    // Parse the request body.
    let body: CustomRequestInput;

    try {
      body = (await request.json()) as CustomRequestInput;
    } catch {
      return Response.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    // Validate required fields.
    if (
      !body.productId ||
      !body.fullName ||
      !body.email ||
      !body.phone ||
      !body.preferredSize ||
      !body.preferredColour
    ) {
      return Response.json(
        {
          success: false,
          message: "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    // Validate field types before calling string methods.
    const requiredFields = [
      body.productId,
      body.fullName,
      body.email,
      body.phone,
      body.preferredSize,
      body.preferredColour,
    ];

    if (
      requiredFields.some(
        (value) => typeof value !== "string" || !value.trim()
      )
    ) {
      return Response.json(
        {
          success: false,
          message: "Please provide valid information in all required fields.",
        },
        { status: 400 }
      );
    }

    const productId = body.productId.trim();
    const fullName = body.fullName.trim();
    const email = body.email.trim().toLowerCase();
    const phone = body.phone.trim();
    const preferredSize = body.preferredSize.trim();
    const preferredColour = body.preferredColour.trim();

    const customSpecifications =
      typeof body.customSpecifications === "string"
        ? body.customSpecifications.trim()
        : "";

    // Enforce reasonable input limits.
    if (
      productId.length > 100 ||
      fullName.length > 100 ||
      email.length > 254 ||
      phone.length > 30 ||
      preferredSize.length > 50 ||
      preferredColour.length > 100 ||
      customSpecifications.length > 1000
    ) {
      return Response.json(
        {
          success: false,
          message: "One or more fields exceed the allowed length.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    if (customSpecifications.length < 10) {
      return Response.json(
        {
          success: false,
          message:
            "Please describe your custom footwear requirements in at least 10 characters.",
        },
        { status: 400 }
      );
    }

    // Verify that the requested product exists and is active.
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "This product is currently unavailable.",
        },
        { status: 404 }
      );
    }

    // Associate the request with an existing account when available.
    // Guest customers can still submit requests.
    let profileId: string | null = null;

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(
        "Unable to verify the current session for custom request."
      );
    }

    if (user) {
      const profile = await prisma.profile.findUnique({
        where: {
          id: user.id,
        },
        select: {
          id: true,
        },
      });

      if (profile) {
        profileId = profile.id;
      }
    }

    // Generate a random guest access token.
    // Only its SHA-256 hash is stored in the database.
    const accessToken = randomBytes(32).toString("hex");
    const accessTokenHash = hashAccessToken(accessToken);

    const customRequest = await prisma.customOrderRequest.create({
      data: {
        reference: generateRequestReference(),
        profileId,
        productId: product.id,
        fullName,
        email,
        phone,
        productName: product.name,
        preferredSize,
        preferredColour,
        customSpecifications,
        accessTokenHash,
        status: "PENDING",
      },
      select: {
        id: true,
        reference: true,
        status: true,
        createdAt: true,
      },
    });

    // Prepare the email data.
const emailData = {
  reference: customRequest.reference,
  fullName,
  email,
  phone,
  productName: product.name,
  preferredSize,
  preferredColour,
  customSpecifications: customSpecifications || null,
  createdAt: customRequest.createdAt,
};

// Notify the store owner.
try {
  await sendNewCustomRequestEmail(emailData);
} catch (emailError) {
  console.error(
    "Custom request admin notification failed:",
    emailError
  );
}

// Confirm receipt to the customer.
try {
  await sendCustomRequestConfirmationEmail(emailData);
} catch (emailError) {
  console.error(
    "Custom request customer confirmation failed:",
    emailError
  );
}

    return Response.json(
      {
        success: true,
        message:
          "Your custom footwear request has been submitted successfully.",
        request: {
          reference: customRequest.reference,
          status: customRequest.status,
          createdAt: customRequest.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Custom footwear request creation failed:", error);

    return Response.json(
      {
        success: false,
        message:
          "We couldn't submit your request right now. Please try again.",
      },
      { status: 500 }
    );
  }
}