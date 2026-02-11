const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendConfirmationEmail = async (toEmail, appointment) => {
  try {
    const mailOptions = {
      from: `"Beauty Harmony" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: '✅ Your Appointment is Confirmed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Appointment Confirmed!</h2>
          <p>Your appointment has been successfully booked.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>Appointment Details:</h3>
            <p><strong>Service:</strong> ${appointment.service.name}</p>
            <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.timeSlot}</p>
            <p><strong>Status:</strong> ${appointment.status}</p>
          </div>
          
          <p>Thank you for choosing Beauty Harmony!</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent to:', toEmail);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

module.exports = { sendConfirmationEmail };