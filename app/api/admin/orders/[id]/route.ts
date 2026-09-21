import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const PAYMENT_STATUSES = [
  "PENDING",
  "SUCCESSFUL",
  "FAILED",
  "REFUNDED",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];
type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

type UpdateOrderRequest = {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const body =
      (await request.json()) as UpdateOrderRequest;

    const hasOrderStatus = body.orderStatus !== undefined;
    const hasPaymentStatus =
      body.paymentStatus !== undefined;

    if (!hasOrderStatus && !hasPaymentStatus) {
      return Response.json(
        {
          success: false,
          message: "No update was provided.",
        },
        { status: 400 }
      );
    }

    if (
      hasOrderStatus &&
      !ORDER_STATUSES.includes(body.orderStatus!)
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid order status.",
        },
        { status: 400 }
      );
    }

    if (
      hasPaymentStatus &&
      !PAYMENT_STATUSES.includes(body.paymentStatus!)
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid payment status.",
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      return Response.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    const previousOrderStatus = order.status;
    const newOrderStatus = body.orderStatus;
    const newPaymentStatus = body.paymentStatus;

    const updatedOrder = await prisma.$transaction(
      async (tx) => {
        /*
         * If an order is being cancelled for the first time,
         * return its reserved stock to inventory.
         */
        if (
          newOrderStatus === "CANCELLED" &&
          previousOrderStatus !== "CANCELLED"
        ) {
          for (const item of order.items) {
            if (!item.variantId) {
              continue;
            }

            await tx.productVariant.update({
              where: {
                id: item.variantId,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }

        /*
         * If a cancelled order is reopened,
         * reserve the stock again.
         */
        if (
          newOrderStatus &&
          previousOrderStatus === "CANCELLED" &&
          newOrderStatus !== "CANCELLED"
        ) {
          for (const item of order.items) {
            if (!item.variantId) {
              continue;
            }

            const updatedVariant =
              await tx.productVariant.updateMany({
                where: {
                  id: item.variantId,
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
                `Not enough stock to reopen ${item.productName}.`
              );
            }
          }
        }

        const updated = await tx.order.update({
          where: {
            id,
          },
          data: {
            ...(newOrderStatus
              ? {
                  status: newOrderStatus,
                }
              : {}),
            ...(newPaymentStatus && order.payment
              ? {
                  payment: {
                    update: {
                      status: newPaymentStatus,
                      ...(newPaymentStatus === "SUCCESSFUL"
                        ? {
                            paidAt:
                              order.payment.paidAt ??
                              new Date(),
                          }
                        : {}),
                    },
                  },
                }
              : {}),
          },
          include: {
            payment: true,
          },
        });

        if (
          newOrderStatus &&
          newOrderStatus !== previousOrderStatus
        ) {
          await tx.notification.create({
  data: {
    type: "ORDER_STATUS_UPDATE",
    title: "Order Status Updated",
    message: `Order ${order.orderNumber} is now ${newOrderStatus}.`,
    profileId: order.profileId,
    orderId: order.id,
  },
});
        }

        if (
          newPaymentStatus &&
          order.payment &&
          newPaymentStatus !== order.payment.status
        ) {
          await tx.notification.create({
  data: {
    type: "PAYMENT_CONFIRMED",
    title: "Payment Status Updated",
    message: `Payment for order ${order.orderNumber} is now ${newPaymentStatus}.`,
    profileId: order.profileId,
    orderId: order.id,
  },
});
        }

        return updated;
      }
    );

    return Response.json({
      success: true,
      message: "Order updated successfully.",
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        paymentStatus:
          updatedOrder.payment?.status ?? null,
      },
    });
  } catch (error) {
    console.error(
      "Admin order update failed:",
      error
    );

    return Response.json(
  {
    success: false,
    message: "Unable to update order.",
  },
  { status: 500 }
);
  }
}