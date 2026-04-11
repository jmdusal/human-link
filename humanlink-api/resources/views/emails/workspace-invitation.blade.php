<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body style="background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; width: 100%;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);">
                    <tr>
                        <td style="padding: 48px 40px;">
                            <div style="margin-bottom: 32px; text-align: center;">
                                <div style="display: inline-block; width: 56px; height: 56px; background-color: #2563eb; border-radius: 16px; color: #ffffff; font-size: 24px; font-weight: 800; line-height: 56px; text-align: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                                    {{ substr($workspace->name, 0, 1) }}
                                </div>
                            </div>

                            <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; margin: 0 0 16px; text-align: center;">
                                You've been Invited!
                            </h1>

                            <p style="color: #64748b; font-size: 15px; line-height: 24px; margin: 0 0 24px; text-align: center;">
                                Hi <strong>{{ $user->name }}</strong>, you've been added as a member to the <span style="color: #0f172a; font-weight: 600;">{{ $workspace->name }}</span> workspace on HumanLink.
                            </p>

                            <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
                                <a href="{{ config('app.frontend_url') }}" style="background-color: #2563eb; border-radius: 12px; color: #ffffff; display: inline-block; font-size: 13px; font-weight: 700; letter-spacing: 0.05em; padding: 14px 28px; text-decoration: none; text-transform: uppercase;">
                                    Enter Workspace
                                </a>
                            </div>

                            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;">

                            <p style="color: #94a3b8; font-size: 12px; line-height: 20px; margin: 0; text-align: center;">
                                This invitation was intended for <span style="color: #475569;">{{ $user->email }}</span>.<br>
                                If you weren't expecting this, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>

                <p style="color: #cbd5e1; font-size: 11px; margin-top: 24px; text-align: center; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;">
                    &copy; 2026 HumanLink • Built for Scale
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
