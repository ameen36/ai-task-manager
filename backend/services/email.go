package services

import (
	"fmt"
	"net/smtp"
	"os"
)

func SendPasswordResetEmail(toEmail string, resetToken string) error {

	senderEmail := os.Getenv("SMTP_EMAIL")
	appPassword := os.Getenv("SMTP_PASSWORD")
	frontendURL := os.Getenv("FRONTEND_URL")

	if senderEmail == "" || appPassword == "" || frontendURL == "" {
		fmt.Println("❌ EMAIL ERROR: Environment variables are missing")
		return fmt.Errorf("email environment variables are not configured")
	}

	resetLink := fmt.Sprintf(
		"%s/reset-password?token=%s",
		frontendURL,
		resetToken,
	)

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	auth := smtp.PlainAuth(
		"",
		senderEmail,
		appPassword,
		smtpHost,
	)

	subject := "Subject: Reset your AI Task Manager password\r\n"

	mime := "MIME-Version: 1.0\r\n" +
		"Content-Type: text/plain; charset=\"UTF-8\"\r\n"

	body := fmt.Sprintf(
		"Hello,\r\n\r\n"+
			"We received a request to reset your AI Task Manager password.\r\n\r\n"+
			"Open this link to reset your password:\r\n%s\r\n\r\n"+
			"This link expires in 15 minutes.\r\n\r\n"+
			"If you did not request a password reset, you can ignore this email.\r\n",
		resetLink,
	)

	message := []byte(
		"From: " + senderEmail + "\r\n" +
			"To: " + toEmail + "\r\n" +
			subject +
			mime +
			"\r\n" +
			body,
	)

	fmt.Println("📧 Attempting to send reset email to:", toEmail)

	err := smtp.SendMail(
		smtpHost+":"+smtpPort,
		auth,
		senderEmail,
		[]string{toEmail},
		message,
	)

	if err != nil {
		fmt.Println("❌ EMAIL ERROR:", err)
		return err
	}

	fmt.Println("✅ Reset email sent successfully to:", toEmail)

	return nil
}