/**
 * Simple utility to send emails via Brevo (formerly Sendinblue) REST API.
 */
export async function sendEmail({
  to,
  subject,
  htmlContent,
}: {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("BREVO_API_KEY is not defined. Email will not be sent.");
    return;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.EMAIL_SENDER_NAME || "Rose and Co. HIS",
          email: process.env.EMAIL_SENDER_EMAIL || "no-reply@roseandco.com",
        },
        to,
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Brevo API error:", error);
      throw new Error("Failed to send email via Brevo");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
