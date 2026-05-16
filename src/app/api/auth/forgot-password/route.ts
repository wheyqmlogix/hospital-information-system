import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = ForgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security reasons, don't reveal if user exists or not
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour validity

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password/${token}`;

    try {
      await sendEmail({
        to: [{ email: user.email, name: user.name }],
        subject: "Password Reset Request - Rose and Co. HIS",
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a; text-transform: uppercase; letter-spacing: 0.1em;">Password Reset Request</h2>
            <p style="color: #475569; line-height: 1.6;">Hello ${user.name},</p>
            <p style="color: #475569; line-height: 1.6;">We received a request to reset your password for the <strong>Rose and Co. Hospital Information System</strong>.</p>
            <p style="color: #475569; line-height: 1.6;">If you didn't make this request, you can safely ignore this email.</p>
            <p style="color: #475569; line-height: 1.6;">Otherwise, you can reset your password using the link below:</p>
            <div style="margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 0.1em;">Reset My Password</a>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
              This link is valid for <strong>1 hour</strong>.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send reset password email:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to process forgot password request" },
      { status: 500 }
    );
  }
}
