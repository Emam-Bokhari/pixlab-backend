import config from '../config';
import { TSupport } from '../modules/support/support.interface';
import { ISendEmail } from '../types/email';

const supportFormTemplate = (values: TSupport): ISendEmail => {
  return {
    from: config.email.from,
    to: config.support_email!,
    subject: values.subject?.trim()
      ? `Support: ${values.subject.trim()}`
      : `New Support Request from ${values.name}`,
    html: `
<body style="font-family: Arial, sans-serif; background:#f9f9f9; padding:30px;">
  <div style="max-width:650px; margin:auto; background:#fff; padding:20px; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.08);">
    <h2 style="color:#333;">New Support Request</h2>
    <div style="margin-top:15px; font-size:15px; line-height:1.6;">
      <p><strong>Name:</strong> ${values.name}</p>
      <p><strong>Email:</strong> ${values.email}</p>
      <hr style="margin:15px 0;" />
      <p><strong>Message:</strong></p>
      <div style="background:#f1f1f1; padding:12px; border-radius:6px;">
        ${values.message}
      </div>
    </div>
  </div>
</body>
    `,
  };
};

export const emailTemplate = {
  supportFormTemplate,
};
