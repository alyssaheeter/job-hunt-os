import { google } from 'googleapis';

export async function createGmailDraft(subject: string, bodyText: string, toAddress: string): Promise<string> {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/gmail.compose']
  });

  const gmail = google.gmail({ version: 'v1', auth });

  // DRAFT_ONLY enforcement
  const DRAFT_ONLY = true;

  const emailLines = [];
  emailLines.push(`To: ${toAddress}`);
  emailLines.push('Content-Type: text/plain; charset="UTF-8"');
  emailLines.push('MIME-Version: 1.0');
  emailLines.push(`Subject: ${subject}`);
  emailLines.push('');
  emailLines.push(bodyText);

  const emailRaw = emailLines.join('\r\n');
  const encodedEmail = Buffer.from(emailRaw).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  console.log(`Generating DRAFT_ONLY email to ${toAddress}...`);

  try {
    const res = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedEmail
        }
      }
    });

    return res.data.id || 'unknown_draft_id';
  } catch (err) {
    console.error('Failed to create Gmail Draft:', err);
    throw err;
  }
}
