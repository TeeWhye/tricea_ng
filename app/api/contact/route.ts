import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string" ? body.email.trim() : "";

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!name || !email || !subject || !message) {
      return Response.json(
        {
          success: false,
          message: "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    if (
  name.length > 100 ||
  email.length > 254 ||
  subject.length > 150 ||
  message.length > 5000
) {
  return Response.json(
    {
      success: false,
      message: "One or more fields are too long.",
    },
    { status: 400 }
  );
}

    const emailSetting = await prisma.storeSetting.findUnique({
      where: {
        key: "support_email",
      },
      select: {
        value: true,
      },
    });

    const supportEmail = emailSetting?.value.trim();

    if (!supportEmail) {
      return Response.json(
        {
          success: false,
          message:
            "The store support email has not been configured.",
        },
        { status: 500 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return Response.json(
        {
          success: false,
          message: "Email service is not configured.",
        },
        { status: 500 }
      );
    }

    const { error } = await resend.emails.send({
      from: "Tricea NG <onboarding@resend.dev>",
      to: supportEmail,
      replyTo: email,
      subject: `Tricea NG Contact: ${subject}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    if (error) {
      console.error("Contact email failed:", error);

      return Response.json(
        {
          success: false,
          message: "Unable to send your message.",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Contact form failed:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to process your message.",
      },
      { status: 500 }
    );
  }
}