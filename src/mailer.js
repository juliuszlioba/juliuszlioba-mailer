// Import express into our project
const express = require("express");

// Creating an instance of express function
const app = express();

// Import dotenv
require("dotenv").config();

// The port we want our project to run on
const PORT = 3000;

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Nodemailer
const nodemailer = require("nodemailer");

const createTransporter = async () => {
  // Authenticating and creating a method to send a mail
  const transporter = nodemailer.createTransport({
    pool: true,
    host: process.env.SMTP_URL,
    port: 465,
    secure: true, // use TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

// Route to handle sending mails
app.post("/send-email", async (req, res) => {
  // Pulling out the form data from the request body
  const recipientName = req.body.name;
  const recipientEmail = req.body.email;
  const mailSubject = req.body.subject;
  const mailBody = req.body.message;

  // Mail options
  let mailOptions = {
    from: `"Contact Form Message" <${process.env.SENDER_ORIGIN_EMAIL}>`,
    to: process.env.TARGET_EMAIL,
    subject: mailSubject,
    text: `From <strong> ${recipientName} <${recipientEmail}> </strong> with Message: "${mailBody}"`,
    html: `<p>From: <br/> <strong>${recipientName}</strong> ${recipientEmail}</p><p>Message:<br />"${mailBody}"</p>`,
    amp: `<!doctype html>
    <html ⚡4email>
      <head>
        <meta charset="utf-8">
        <style amp4email-boilerplate>body{visibility:hidden}</style>
        <script async src="https://cdn.ampproject.org/v0.js"></script>
      </head>
      <body>
        <p>From: <br/> <strong>${recipientName}</strong> ${recipientEmail}</p>
        <p>Message:<br />"${mailBody}"</p>
      </body>
    </html>`
  };

  try {
    // Get response from the createTransport
    let emailTransporter = await createTransporter();

    // Send email
    emailTransporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        // failed block
        console.log(error);
      } else {
        // Success block
        console.log(`Email sent by: ${recipientName} <${recipientEmail}>. Info: ${info.response}`);
        res.set({
          'Access-Control-Allow-Origin': process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.status(200)
        return res.json({ success: true });
      }
    });
  } catch (error) {
    res.status(500)
    return res.json({ success: false, error: "Email not sent" });
  }
});

// Express allows us to listen to the port and trigger a console.log() when you visit the port
app.listen(PORT, () => {
  console.log(`Mailer (${process.env.SMTP_URL}) is currently 🏃‍♂️ on port ${PORT}`);
});
