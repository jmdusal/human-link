<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body style="background-color: #f1f5f9; font-family: Georgia, 'Times New Roman', serif; margin: 0; padding: 0; width: 100%;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="padding: 48px 16px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 36px 40px; text-align: center;">
                            <p style="color: #bfdbfe; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; margin: 0 0 12px; text-transform: uppercase;">
                                {{ ! empty($companyName) ? $companyName : 'HumanLink' }}
                            </p>
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: 400; letter-spacing: -0.02em; margin: 0; line-height: 1.25;">
                                {{ $title }}
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #334155; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                                Hi <strong style="color: #0f172a;">{{ $userName }}</strong>,
                            </p>
                            <p style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
                                {!! $body !!}
                            </p>

                            <div style="text-align: center; margin: 0 0 32px;">
                                <div style="display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 28px;">
                                    <p style="color: #0f172a; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 700; letter-spacing: 0.35em; margin: 0;">
                                        {{ $code }}
                                    </p>
                                </div>
                            </div>

                            <p style="color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                                {!! $footer !!}
                            </p>
                        </td>
                    </tr>
                </table>
                <p style="color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; margin-top: 24px; text-align: center;">
                    &copy; {{ date('Y') }} {{ ! empty($companyName) ? $companyName : 'HumanLink' }}
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
