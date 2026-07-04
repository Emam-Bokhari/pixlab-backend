export interface ISendEmail {
  from?: string | undefined;
  to: string | string[];
  subject: string;
  html?: string | undefined;
  replyTo?: string | string[] | undefined;
}
