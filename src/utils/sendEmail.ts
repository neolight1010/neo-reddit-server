import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export default async function sendEmail(mailOptions: Mail.Options) {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport(
    {
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    },
    {
      from: "NeoReddit Support <support@neoreddit.com>",
    }
  );

  const info = await transporter.sendMail(mailOptions);

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
