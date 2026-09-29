import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
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

    const result = await prisma.$transaction(async (tx) => {
      const orders = await tx.order.findMany({
        select: {
          id: true,
          status: true,
          items: {
            select: {
              variantId: true,
              quantity: true,
            },
          },
        },
      });

      if (orders.length === 0) {
        return {
          deletedOrders: 0,
        };
      }

      /*
       * Restore stock for orders that were not cancelled.
       *
       * Cancelled orders have already had their stock
       * returned by the existing order-status logic, so
       * restoring them again would incorrectly increase stock.
       */
      for (const order of orders) {
        if (order.status === "CANCELLED") {
          continue;
        }

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
       * Order has Cascade deletes for:
       * - OrderItem
       * - Payment
       * - Notification
       *
       * So deleting the orders also removes their
       * associated transactional records.
       */
      await tx.order.deleteMany();

      return {
        deletedOrders: orders.length,
      };
    });

    return Response.json({
      success: true,
      message: `${result.deletedOrders} ${
        result.deletedOrders === 1 ? "order" : "orders"
      } cleared successfully.`,
      deletedOrders: result.deletedOrders,
    });
  } catch (error) {
    console.error(
      "Clear order history failed:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to clear order history.",
      },
      { status: 500 }
    );
  }
}