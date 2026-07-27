function sendVerificationEmail(email, code) {
  console.log(`[email:mock] To: ${email} | Subject: Verify your email | Code: ${code}`);
}

module.exports = { sendVerificationEmail };
