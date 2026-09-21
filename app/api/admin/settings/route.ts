import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const SETTING_KEYS = [
  "store_name",
  "support_email",
  "support_phone",
  "bank_name",
  "account_name",
  "account_number",
  "delivery_partner",
] as const;

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: {
        id: user.id,
      },
      select: {
        role: true,
      },
    });

    if (!profile || profile.role !== "ADMIN") {
      return Response.json(
        {
          success: false,
          message: "Forbidden.",
        },
        { status: 403 }
      );
    }

    const settings = await prisma.storeSetting.findMany({
      where: {
        key: {
          in: [...SETTING_KEYS],
        },
      },
      orderBy: {
        key: "asc",
      },
    });

    const values = Object.fromEntries(
      SETTING_KEYS.map((key) => [
        key,
        settings.find((setting) => setting.key === key)?.value ?? "",
      ])
    );

    return Response.json({
      success: true,
      settings: values,
    });
  } catch (error) {
    console.error(
      "Admin settings fetch failed:",
      error
    );

    return Response.json(
  {
    success: false,
    message: "Unable to load store settings.",
  },
  { status: 500 }
);
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: {
        id: user.id,
      },
      select: {
        role: true,
      },
    });

    if (!profile || profile.role !== "ADMIN") {
      return Response.json(
        {
          success: false,
          message: "Forbidden.",
        },
        { status: 403 }
      );
    }

    let body: Record<string, unknown>;

try {
  body = await request.json();
} catch {
  return Response.json(
    {
      success: false,
      message: "Invalid request body.",
    },
    { status: 400 }
  );
}

    if (!body || typeof body !== "object") {
      return Response.json(
        {
          success: false,
          message: "Invalid request.",
        },
        { status: 400 }
      );
    }

    for (const key of SETTING_KEYS) {
  if (key in body && typeof body[key] !== "string") {
    return Response.json(
      {
        success: false,
        message: `Setting "${key}" must be a string.`,
      },
      { status: 400 }
    );
  }
}

    const settingMaxLengths: Record<
  (typeof SETTING_KEYS)[number],
  number
> = {
  store_name: 100,
  support_email: 254,
  support_phone: 30,
  bank_name: 100,
  account_name: 150,
  account_number: 30,
  delivery_partner: 100,
};

for (const key of SETTING_KEYS) {
  if (
    key in body &&
    typeof body[key] === "string" &&
    body[key].trim().length > settingMaxLengths[key]
  ) {
    return Response.json(
      {
        success: false,
        message: `Setting "${key}" is too long.`,
      },
      { status: 400 }
    );
  }
}

    const updates = SETTING_KEYS
      .filter((key) => key in body)
      .map((key) => {
        const value =
          typeof body[key] === "string"
            ? body[key].trim()
            : "";

        return prisma.storeSetting.upsert({
          where: {
            key,
          },
          update: {
            value,
          },
          create: {
            key,
            value,
          },
        });
      });

    await prisma.$transaction(updates);

    return Response.json({
      success: true,
      message: "Store settings updated successfully.",
    });
  } catch (error) {
    console.error(
      "Admin settings update failed:",
      error
    );

    return Response.json(
  {
    success: false,
    message: "Unable to update store settings.",
  },
  { status: 500 }
);
  }
}