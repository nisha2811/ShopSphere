package com.shopsphere.auth;

import com.shopsphere.user.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService
{
    @Autowired(required = false)
    private JavaMailSender sender;

    @Value("${app.mail.enabled:false}")
    private boolean enabled;

    @Value("${app.mail.from:}")
    private String from;

    public boolean sendVerification(User user, String link)
    {
        return send(
                user,
                "Verify your ShopSphere account",
                "Verify your email",
                link,
                "Welcome to ShopSphere. Confirm your email to start shopping our curated collection.",
                "Verify email"
        );
    }

    public boolean sendReset(User user, String link)
    {
        return send(
                user,
                "Reset your ShopSphere password",
                "Reset your password",
                link,
                "We received a request to reset your ShopSphere password. This link expires soon.",
                "Reset password"
        );
    }

    private boolean send(
            User user,
            String subject,
            String heading,
            String link,
            String copy,
            String button)
    {
        if (!enabled || sender == null)
        {
            return false;
        }

        try
        {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(user.getEmail());

            if (from != null && !from.isBlank())
            {
                helper.setFrom(from);
            }

            helper.setSubject(subject);
            helper.setText(template(heading, copy, link, button), true);
            sender.send(message);
            return true;
        }
        catch (MessagingException | RuntimeException exception)
        {
            System.err.println("Mail delivery failed: " + exception.getClass().getSimpleName());
            return false;
        }
    }

    private String template(
            String heading,
            String copy,
            String link,
            String button)
    {
        return """
                <!doctype html>
                <html>
                    <body style="margin:0;background:#f5f4ef;color:#20241f;font-family:Arial,sans-serif">
                        <div style="max-width:620px;margin:32px auto;padding:0 18px">
                            <div style="background:#20241f;color:#f5f4ef;padding:18px 24px;border-radius:12px 12px 0 0;font-size:20px;font-weight:700">
                                ShopSphere
                            </div>
                            <div style="background:#fffefa;border:1px solid #deded6;padding:36px 28px;border-radius:0 0 12px 12px">
                                <p style="margin:0 0 12px;color:#c45b3b;font-size:11px;letter-spacing:2px;font-weight:700">
                                    SHOPSPHERE ACCOUNT
                                </p>
                                <h1 style="margin:0 0 16px;font-size:28px;color:#20241f">
                                    %s
                                </h1>
                                <p style="font-size:16px;line-height:1.6;color:#6e756d">
                                    %s
                                </p>
                                <p style="margin:28px 0">
                                    <a href="%s" style="display:inline-block;background:#c45b3b;color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:700">
                                        %s
                                    </a>
                                </p>
                                <p style="font-size:13px;line-height:1.5;color:#6e756d">
                                    If the button does not work, copy this link into your browser:<br>%s
                                </p>
                            </div>
                            <p style="text-align:center;color:#6e756d;font-size:12px;padding:16px">
                                ShopSphere
                            </p>
                        </div>
                    </body>
                </html>
                """.formatted(heading, copy, link, button, link);
    }
}
