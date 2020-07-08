import * as aws from 'aws-sdk';
import * as nodemailer from 'nodemailer';
import * as pug from 'pug';

import environment from '@environment';

import { ErrorLogger } from '@utilities/logging/error-logger.utility';

interface EmailConfig {
  html: string;
  from: string;
  replyTo: string;
  subject: string;
  text: string;
  to: string;
}

interface MailerConfig {
  from?: string;
  reply?: string;
  subject: string;
  template: string;
  templateVariables: object;
  to: string;
}

export class EmailUtility {
  emailFromFallback: string = `${environment.application_name} Admin`;
  emailTemplatesPath: string = `${__dirname}/../../email-templates`;
  errorLogger: ErrorLogger = new ErrorLogger('EmailUtility');
  mailTransport;

  constructor() {
    if (environment.node_env === 'development') {
      aws.config.update({
        accessKeyId: process.env.AWS_SES_USER_ACCESSID,
        region: environment.aws_region,
        secretAccessKey: process.env.AWS_SES_USER_SECRETKEY
      });
    } else {
      aws.config.update({
        region: environment.aws_region
      });
    }

    this.mailTransport = nodemailer.createTransport({
      SES: new aws.SES({
        apiVersion: '2010-12-01'
      })
    });
  }

  async sendSingleEmail(mailerConfig: MailerConfig) {
    const { from, reply, subject, to, template, templateVariables } = mailerConfig;

    try {
      const emailConfig: EmailConfig = {
        html: pug.compileFile(`${this.emailTemplatesPath}/${template}.pug`)(templateVariables),
        from: (from ? `"${from}"` : this.emailFromFallback) + ` <System@${environment.email_domain}>`,
        replyTo: reply || `no-reply@${environment.email_domain}`,
        subject,
        text: pug.compileFile(`${this.emailTemplatesPath}/${template}.text.pug`)(templateVariables),
        to
      };

      await this.mailTransport.sendMail(emailConfig);
    } catch (error) {
      this.errorLogger.log({
        error,
        level: error,
        message: `Email delivery failure. Email For: ${to}, Subject: ${subject}, Template: ${template}`
      });

      throw error;
    }
  }

}