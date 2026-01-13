import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const portString = this.configService.get<string>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');

    if (!host) {
      console.error(`[FATAL] MAIL_HOST IS EMPTY! Check your .env file location.`);
    }

    const port = Number(portString) || 587;
    const isSecure = port === 465;

    this.transporter = nodemailer.createTransport({
      host: host,
      port: port,
      ignoreTLS: false,
      secure: isSecure,
      auth: {
        user: user,
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  async sendOtp(email: string, otp: string) {
    const from = this.configService.get<string>('MAIL_FROM') || '"No Reply" <noreply@example.com>';

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'Kode Verifikasi OTP Anda - Keepify',
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0ea5e9;">Verifikasi Email Anda</h2>
          <p>Halo,</p>
          <p>Gunakan kode OTP berikut untuk menyelesaikan proses registrasi Anda:</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0f172a; margin: 20px 0;">
            ${otp}
          </div>
          <p>Kode ini hanya berlaku selama 5 menit.</p>
          <p>Jika Anda tidak merasa mendaftar di Keepify, abaikan email ini.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Keepify App</p>
        </div>
      `,
      });
      console.log(`[MAIL] OTP Sent to ${email}`);
    } catch (e) {
      console.error(`[MAIL ERROR] Failed to send to ${email}:`, e.message);
    }
  }
}
