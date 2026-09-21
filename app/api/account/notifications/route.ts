import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function GET() {
  const user = await getUser();

  if (!user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized.",
      },
      { status: 401 }
    );
  }

  const notifications = await prisma.notification.findMany({
    where: {
      profileId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json({
    success: true,
    notifications,
  });
}

export async function PATCH(request: Request) {
  const user = await getUser();

  if (!user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized.",
      },
      { status: 401 }
    );
  }

  let body: {
  notificationId?: unknown;
};

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

const notificationId =
  typeof body.notificationId === "string"
    ? body.notificationId.trim()
    : "";

if (!notificationId) {
  return Response.json(
    {
      success: false,
      message: "Notification ID is required.",
    },
    { status: 400 }
  );
}

  if (!body.notificationId) {
    return Response.json(
      {
        success: false,
        message: "Notification ID is required.",
      },
      { status: 400 }
    );
  }

  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      profileId: user.id,
    },
  });

  if (!notification) {
    return Response.json(
      {
        success: false,
        message: "Notification not found.",
      },
      { status: 404 }
    );
  }

  const updatedNotification =
    await prisma.notification.update({
      where: {
        id: notification.id,
      },
      data: {
        isRead: true,
      },
    });

  return Response.json({
    success: true,
    notification: updatedNotification,
  });
}