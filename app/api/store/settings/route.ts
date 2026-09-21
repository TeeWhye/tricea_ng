import { prisma } from "@/lib/prisma";

const PUBLIC_SETTING_KEYS = [
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
    const settings = await prisma.storeSetting.findMany({
      where: {
        key: {
          in: [...PUBLIC_SETTING_KEYS],
        },
      },
    });

    const values = Object.fromEntries(
      PUBLIC_SETTING_KEYS.map((key) => [
        key,
        settings.find(
          (setting) => setting.key === key
        )?.value ?? "",
      ])
    );

    return Response.json({
      success: true,
      settings: values,
    });
  } catch (error) {
    console.error(
      "Store settings fetch failed:",
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