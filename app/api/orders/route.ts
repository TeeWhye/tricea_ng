import { prisma } from "@/lib/prisma";
import { getDeliveryFee } from "@/lib/delivery";
import { createClient } from "@/lib/supabase/server";

type OrderItemInput = {
  productId: string;
  variantId: string;
  size: string;
  quantity: number;
};

type OrderRequest = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes?: string;
  items: OrderItemInput[];
};

function generateOrderNumber() {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const random = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase();

  return `TRC-${date}-${random}`;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

const {
  data: { user },
} = await supabase.auth.getUser();

let profileId: string | null = null;

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
    let body: OrderRequest;

try {
  body = (await request.json()) as OrderRequest;
} catch {
  return Response.json(
    {
      success: false,
      message: "Invalid request body.",
    },
    { status: 400 }
  );
}

    if (
  !body.fullName ||
  !body.email ||
  !body.phone ||
  !body.address ||
  !body.city ||
  !body.state
) {
  return Response.json(
    {
      success: false,
      message: "Please provide all required customer information.",
    },
    { status: 400 }
  );
}

const fullName = body.fullName.trim();
const email = body.email.trim();
const phone = body.phone.trim();
const address = body.address.trim();
const city = body.city.trim();
const state = body.state.trim();
const notes =
  typeof body.notes === "string"
    ? body.notes.trim()
    : "";

if (!fullName || !email || !phone || !address || !city || !state) {
  return Response.json(
    {
      success: false,
      message: "Please provide all required customer information.",
    },
    { status: 400 }
  );
}

if (fullName.length > 100) {
  return Response.json(
    { success: false, message: "Full name is too long." },
    { status: 400 }
  );
}

if (email.length > 254) {
  return Response.json(
    { success: false, message: "Email address is too long." },
    { status: 400 }
  );
}

if (phone.length > 30) {
  return Response.json(
    { success: false, message: "Phone number is too long." },
    { status: 400 }
  );
}

if (address.length > 250) {
  return Response.json(
    { success: false, message: "Address is too long." },
    { status: 400 }
  );
}

if (city.length > 100) {
  return Response.json(
    { success: false, message: "City name is too long." },
    { status: 400 }
  );
}

if (state.length > 100) {
  return Response.json(
    { success: false, message: "State name is too long." },
    { status: 400 }
  );
}

if (notes.length > 500) {
  return Response.json(
    { success: false, message: "Order notes are too long." },
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

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        { status: 400 }
      );
    }

    if (body.items.length > 50) {
  return Response.json(
    {
      success: false,
      message: "Too many items in your cart.",
    },
    { status: 400 }
  );
}

const itemKeys = new Set(
  body.items.map(
    (item) => `${item.productId}:${item.variantId}`
  )
);

if (itemKeys.size !== body.items.length) {
  return Response.json(
    {
      success: false,
      message: "Duplicate cart items are not allowed.",
    },
    { status: 400 }
  );
}

    for (const item of body.items) {
      if (
  !item.productId ||
  !item.variantId ||
  !item.size ||
  !Number.isInteger(item.quantity) ||
item.quantity < 1 ||
item.quantity > 100
) {
        return Response.json(
          {
            success: false,
            message: "Invalid cart item or quantity.",
          },
          { status: 400 }
        );
      }
    }

    const deliveryFee = getDeliveryFee(state);

    const bankSettings = await prisma.storeSetting.findMany({
  where: {
    key: {
      in: [
        "bank_name",
        "account_name",
        "account_number",
      ],
    },
  },
});

const bankDetails = {
  bank_name:
    bankSettings.find(
      (setting) => setting.key === "bank_name"
    )?.value ?? "",

  account_name:
    bankSettings.find(
      (setting) => setting.key === "account_name"
    )?.value ?? "",

  account_number:
    bankSettings.find(
      (setting) => setting.key === "account_number"
    )?.value ?? "",
};

    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;

      const orderItems = [];

      for (const item of body.items) {
        const product = await tx.product.findFirst({
  where: {
    id: item.productId,
    isActive: true,
  },
  include: {
    variants: {
      where: {
        id: item.variantId,
      },
    },
  },
});

        if (!product) {
          throw new Error(
            `Product ${item.productId} is no longer available.`
          );
        }

        const variant = product.variants[0];

if (!variant) {
  throw new Error(
    `${product.name} is not available in the selected variant.`
  );
}

if (variant.size !== item.size) {
  throw new Error(
    `${product.name} has an invalid variant selection.`
  );
}

        if (variant.stock < item.quantity) {
  throw new Error(
    `${product.name} in ${variant.colour}, size ${variant.size} only has ${variant.stock} available.`
  );
}

const updatedVariant = await tx.productVariant.updateMany({
  where: {
    id: variant.id,
    stock: {
      gte: item.quantity,
    },
  },
  data: {
    stock: {
      decrement: item.quantity,
    },
  },
});

if (updatedVariant.count !== 1) {
  throw new Error(
    `${product.name} in ${variant.colour}, size ${variant.size} is no longer available in the requested quantity.`
  );
}

const unitPrice = variant.price ?? product.price;
        const itemTotal = unitPrice * item.quantity;

        subtotal += itemTotal;

        orderItems.push({
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          sku: variant.sku,
          size: variant.size,
          colour: variant.colour,
          quantity: item.quantity,
          unitPrice,
          total: itemTotal,
        });
      }

      const total = subtotal + deliveryFee;

      const createdOrder = await tx.order.create({
  data: {
    profileId,
    orderNumber: generateOrderNumber(),
          status: "PENDING",

          subtotal,
          deliveryFee,
          total,

          fullName,
email,
phone,
address,
city,
state,
notes: notes || null,
          paymentBankName: bankDetails.bank_name,
paymentAccountName: bankDetails.account_name,
paymentAccountNumber: bankDetails.account_number,

          items: {
            create: orderItems,
          },

          payment: {
            create: {
              method: "BANK_TRANSFER",
              status: "PENDING",
              amount: total,
            },
          },
        },
        include: {
          items: true,
          payment: true,
        },
      });

      await tx.notification.create({
        data: {
          type: "NEW_ORDER",
          title: "New Order Received",
          message: `Order ${createdOrder.orderNumber} has been placed by ${createdOrder.fullName}.`,
          orderId: createdOrder.id,
        },
      });

      return createdOrder;
    });

    return Response.json(
      {
        success: true,
        message: "Order created successfully.",
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          total: order.total,
          status: order.status,
          paymentStatus: order.payment?.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation failed:", error);

    return Response.json(
  {
    success: false,
    message: "Something went wrong while creating your order.",
  },
  { status: 500 }
);
  }
}