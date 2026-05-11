export async function sendEmail({ to, subject, text, html }: { to: string, subject: string, text: string, html?: string }) {
  // Mock email service
  // Replace this with Resend, SendGrid, or Nodemailer when credentials are provided
  console.log('================ EMAIL SENT ================');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${text}`);
  console.log('============================================');
  return { success: true };
}
