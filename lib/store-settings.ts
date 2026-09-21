import { prisma } from "@/lib/prisma";

export async function getStoreSettings() {
  const settings = await prisma.storeSetting.findMany({
    where: {
      key: {
        in: [
          "store_name",
          "support_email",
          "support_phone",
          "delivery_partner",
        ],
      },
    },
  });

  return {
    storeName:
      settings.find(
        (setting) => setting.key === "store_name"
      )?.value || "Tricea NG",

    supportEmail:
      settings.find(
        (setting) => setting.key === "support_email"
      )?.value || "",

    supportPhone:
      settings.find(
        (setting) => setting.key === "support_phone"
      )?.value || "",

    deliveryPartner:
      settings.find(
        (setting) => setting.key === "delivery_partner"
      )?.value || "",
  };
}