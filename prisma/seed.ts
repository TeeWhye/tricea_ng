import "dotenv/config";

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Starting Tricea seed...");

  // ─────────────────────────────────────────────
  // CATEGORIES
  // ─────────────────────────────────────────────

  const premiumPalmSlides = await prisma.category.upsert({
  where: {
    slug: "premium-palm-slides",
  },
  update: {
    name: "Premium Palm Slides",
  },
  create: {
    name: "Premium Palm Slides",
    slug: "premium-palm-slides",
  },
});

  const sandals = await prisma.category.upsert({
    where: {
      slug: "sandals",
    },
    update: {},
    create: {
      name: "Sandals",
      slug: "sandals",
    },
  });

  const handmadeShoes = await prisma.category.upsert({
    where: {
      slug: "handmade-shoes",
    },
    update: {},
    create: {
      name: "Handmade Shoes",
      slug: "handmade-shoes",
    },
  });

  console.log("Categories created:");
  console.log(premiumPalmSlides.name);
  console.log(sandals.name);
  console.log(handmadeShoes.name);

  // ─────────────────────────────────────────────
  // PRODUCTS
  // ─────────────────────────────────────────────

  const blackCrossSlide = await prisma.product.upsert({
    where: {
      sku: "TRC-BCS-001",
    },
    update: {},
    create: {
      name: "Black Cross Slide",
      slug: "black-cross-slide",
      description:
        "A refined everyday slide combining comfort, character, and effortless style.",
      sku: "TRC-BCS-001",
      price: 35000,
      categoryId: premiumPalmSlides.id,
      isActive: true,
    },
  });

  console.log("Product created:");
  console.log(blackCrossSlide.name);

  const greenBotanicalSlide = await prisma.product.upsert({
    where: {
      sku: "TRC-GBS-001",
    },
    update: {},
    create: {
      name: "Green Botanical Slide",
      slug: "green-botanical-slide",
      description:
        "A distinctive botanical-inspired slide designed for effortless everyday wear.",
      sku: "TRC-GBS-001",
      price: 45000,
      categoryId: premiumPalmSlides.id,
      isActive: true,
    },
  });

  console.log("Product created:");
  console.log(greenBotanicalSlide.name);

  const olivePlatformSlide = await prisma.product.upsert({
    where: {
      sku: "TRC-OPS-001",
    },
    update: {},
    create: {
      name: "Olive Platform Slide",
      slug: "olive-platform-slide",
      description:
        "A modern platform slide combining sculptural design, comfort, and everyday versatility.",
      sku: "TRC-OPS-001",
      price: 40000,
      categoryId: premiumPalmSlides.id,
      isActive: true,
    },
  });

  console.log("Product created:");
  console.log(olivePlatformSlide.name);

  // ─────────────────────────────────────────────
  // BLACK CROSS SLIDE VARIANTS
  // ─────────────────────────────────────────────

  const blackCrossSlideSizes = ["40", "41", "42", "43", "44", "45"];

  for (const size of blackCrossSlideSizes) {
    await prisma.productVariant.upsert({
      where: {
        sku: `TRC-BCS-${size}`,
      },
      update: {},
      create: {
        productId: blackCrossSlide.id,
        size,
        colour: "Black",
        sku: `TRC-BCS-${size}`,
        stock: 5,
      },
    });
  }

  console.log("Black Cross Slide variants created:");
  console.log(blackCrossSlideSizes.join(", "));

  // ─────────────────────────────────────────────
  // GREEN BOTANICAL SLIDE VARIANTS
  // ─────────────────────────────────────────────

  const greenBotanicalSlideSizes = [
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
  ];

  for (const size of greenBotanicalSlideSizes) {
    await prisma.productVariant.upsert({
      where: {
        sku: `TRC-GBS-${size}`,
      },
      update: {},
      create: {
        productId: greenBotanicalSlide.id,
        size,
        colour: "Green",
        sku: `TRC-GBS-${size}`,
        stock: 5,
      },
    });
  }

  console.log("Green Botanical Slide variants created:");
  console.log(greenBotanicalSlideSizes.join(", "));

  // ─────────────────────────────────────────────
  // OLIVE PLATFORM SLIDE VARIANTS
  // ─────────────────────────────────────────────

  const olivePlatformSlideSizes = [
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
  ];

  for (const size of olivePlatformSlideSizes) {
    await prisma.productVariant.upsert({
      where: {
        sku: `TRC-OPS-${size}`,
      },
      update: {},
      create: {
        productId: olivePlatformSlide.id,
        size,
        colour: "Olive",
        sku: `TRC-OPS-${size}`,
        stock: 5,
      },
    });
  }

  console.log("Olive Platform Slide variants created:");
  console.log(olivePlatformSlideSizes.join(", "));

  // ─────────────────────────────────────────────
  // PRODUCT IMAGES
  // ─────────────────────────────────────────────

  await prisma.productImage.upsert({
    where: {
      id: "7b3f1a91-3b0c-4b7f-9f8c-1d4a6e2c5b70",
    },
    update: {},
    create: {
      id: "7b3f1a91-3b0c-4b7f-9f8c-1d4a6e2c5b70",
      productId: blackCrossSlide.id,
      url: "/images/products/classic-palm.jpg",
      altText: "Black Cross Slide",
      sortOrder: 0,
      isPrimary: true,
    },
  });

  console.log("Black Cross Slide image created.");

  await prisma.productImage.upsert({
    where: {
      id: "b2d7e4f1-6a93-4c58-8b21-5f0d3a7e9c42",
    },
    update: {},
    create: {
      id: "b2d7e4f1-6a93-4c58-8b21-5f0d3a7e9c42",
      productId: greenBotanicalSlide.id,
      url: "/images/products/heritage-sandal.jpg",
      altText: "Green Botanical Slide",
      sortOrder: 0,
      isPrimary: true,
    },
  });

  console.log("Green Botanical Slide image created.");

  await prisma.productImage.upsert({
    where: {
      id: "c8f1a5d6-2e74-4b39-9a61-7d0f3c5e8b27",
    },
    update: {},
    create: {
      id: "c8f1a5d6-2e74-4b39-9a61-7d0f3c5e8b27",
      productId: olivePlatformSlide.id,
      url: "/images/products/signature-handmade.jpg",
      altText: "Olive Platform Slide",
      sortOrder: 0,
      isPrimary: true,
    },
  });

  console.log("Olive Platform Slide image created.");

  // ─────────────────────────────────────────────
  // DELIVERY ZONES
  // ─────────────────────────────────────────────

  const deliveryZones = [
    {
      name: "Ogun",
      fee: 3500,
      states: ["Ogun"],
    },
    {
      name: "Lagos",
      fee: 4000,
      states: ["Lagos"],
    },
    {
      name: "Southwest",
      fee: 4000,
      states: ["Oyo", "Osun", "Ondo", "Ekiti"],
    },
    {
      name: "South South",
      fee: 4500,
      states: [
        "Edo",
        "Delta",
        "Rivers",
        "Bayelsa",
        "Cross River",
        "Akwa Ibom",
      ],
    },
    {
      name: "Southeast",
      fee: 4500,
      states: [
        "Anambra",
        "Enugu",
        "Imo",
        "Abia",
        "Ebonyi",
      ],
    },
    {
      name: "Abuja / North Central",
      fee: 5000,
      states: [
        "Federal Capital Territory",
        "Benue",
        "Kogi",
        "Kwara",
        "Nasarawa",
        "Niger",
        "Plateau",
      ],
    },
    {
      name: "Northern Nigeria",
      fee: 5000,
      states: [
        "Adamawa",
        "Bauchi",
        "Borno",
        "Gombe",
        "Jigawa",
        "Kaduna",
        "Kano",
        "Katsina",
        "Kebbi",
        "Sokoto",
        "Taraba",
        "Yobe",
        "Zamfara",
      ],
    },
  ];

  for (const zone of deliveryZones) {
    const deliveryZone = await prisma.deliveryZone.upsert({
      where: {
        name: zone.name,
      },
      update: {
        fee: zone.fee,
      },
      create: {
        name: zone.name,
        fee: zone.fee,
      },
    });

    for (const state of zone.states) {
      await prisma.deliveryZoneState.upsert({
        where: {
          state,
        },
        update: {
          deliveryZoneId: deliveryZone.id,
        },
        create: {
          state,
          deliveryZoneId: deliveryZone.id,
        },
      });
    }
  }

  console.log("Delivery zones created.");

  // ─────────────────────────────────────────────
  // STORE SETTINGS
  // ─────────────────────────────────────────────

  const storeSettings = [
    {
      key: "store_name",
      value: "Tricea NG",
    },
    {
      key: "support_email",
      value: "support@tricea.ng",
    },
    {
      key: "support_phone",
      value: "",
    },
    {
      key: "bank_name",
      value: "",
    },
    {
      key: "account_name",
      value: "",
    },
    {
      key: "account_number",
      value: "",
    },
    {
      key: "delivery_partner",
      value: "",
    },
  ];

  for (const setting of storeSettings) {
    await prisma.storeSetting.upsert({
      where: {
        key: setting.key,
      },
      update: {
        value: setting.value,
      },
      create: {
        key: setting.key,
        value: setting.value,
      },
    });
  }

  console.log("Store settings created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });