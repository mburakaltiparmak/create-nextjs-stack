import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

// Validate environment variable
if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set in environment variables');
}

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Validation schema
const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

// Email template
const createEmailHtml = (data: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">
          EURODECO PANEL SYSTEMS
        </h1>
        <p style="color: #a0a0a0; margin: 10px 0 0; font-size: 14px;">
          New Contact Form Submission
        </p>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1a1a1a; margin: 0 0 24px; font-size: 20px; font-weight: 600;">
          Contact Details
        </h2>
        
        <!-- Contact Info -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
              <strong style="color: #666666; display: inline-block; width: 100px; font-size: 14px;">Name:</strong>
              <span style="color: #1a1a1a; font-size: 14px;">${data.firstName} ${data.lastName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
              <strong style="color: #666666; display: inline-block; width: 100px; font-size: 14px;">Email:</strong>
              <a href="mailto:${data.email}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">${data.email}</a>
            </td>
          </tr>
        </table>
        
        <!-- Message -->
        <h3 style="color: #1a1a1a; margin: 0 0 16px; font-size: 16px; font-weight: 600;">Message:</h3>
        <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 4px;">
          <p style="color: #4b5563; margin: 0; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">${data.message}</p>
        </div>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
          This email was sent from the Eurodeco contact form
        </p>
        <p style="color: #9ca3af; margin: 8px 0 0; font-size: 12px;">
          Received on ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Plain text version
const createEmailText = (data: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}) => `
EURODECO PANEL SYSTEMS - New Contact Form Submission

Contact Details:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}

Message:
${data.message}

---
This email was sent from the Eurodeco contact form
Received on ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}
`;

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = contactFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.CONTACT_EMAIL || 'info@eurodecopanel.de',
      replyTo: data.email,
      subject: `New Contact Form Submission from ${data.firstName} ${data.lastName}`,
      html: createEmailHtml(data),
      text: createEmailText(data),
    });

    console.log('Email sent successfully:', emailResponse);

    // Check for errors in Resend response
    if (emailResponse.error) {
      console.error('Resend API Error:', emailResponse.error);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'Email sent successfully',
        id: emailResponse.data?.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
