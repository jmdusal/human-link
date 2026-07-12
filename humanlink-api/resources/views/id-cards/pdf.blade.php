<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Employee ID Card</title>
    <style>
        @page {
            margin: 12px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #0f172a;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        .id-wrap {
            width: 420px;
            margin: 0;
        }

        .id-card {
            width: 420px;
            border: 1px solid #93c5fd;
            border-collapse: collapse;
        }

        .id-card td {
            vertical-align: top;
        }

        .id-band {
            background: #2563eb;
            color: #ffffff;
            padding: 14px 16px;
        }

        .id-band-table {
            width: 100%;
            border-collapse: collapse;
        }

        .id-band-table td {
            vertical-align: middle;
            padding: 0;
            color: #ffffff;
        }

        .id-company {
            font-size: 13px;
            font-weight: bold;
            letter-spacing: 0.14em;
            text-transform: uppercase;
        }

        .id-badge-label {
            text-align: right;
            font-size: 9px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #dbeafe;
        }

        .id-body {
            padding: 16px;
            background: #ffffff;
        }

        .id-body-table {
            width: 100%;
            border-collapse: collapse;
        }

        .id-photo {
            width: 88px;
            height: 110px;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            text-align: center;
            vertical-align: middle;
            color: #1d4ed8;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 0.04em;
        }

        .id-info {
            padding-left: 14px;
            vertical-align: top;
        }

        .id-name {
            font-size: 16px;
            font-weight: bold;
            color: #1e3a8a;
            margin: 0 0 3px;
            line-height: 1.25;
        }

        .id-email {
            font-size: 10px;
            color: #64748b;
            margin: 0 0 12px;
        }

        .id-meta {
            width: 100%;
            border-collapse: collapse;
        }

        .id-meta th {
            text-align: left;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #3b82f6;
            font-weight: bold;
            padding: 0 8px 2px 0;
            width: 50%;
            border: none;
        }

        .id-meta td {
            text-align: left;
            font-size: 11px;
            color: #0f172a;
            font-weight: bold;
            padding: 0 8px 10px 0;
            width: 50%;
            border: none;
            vertical-align: top;
        }

        .id-footer {
            background: #eff6ff;
            border-top: 1px solid #bfdbfe;
            padding: 10px 16px;
            font-size: 9px;
            color: #64748b;
        }

        .id-footer strong {
            color: #1d4ed8;
            font-weight: bold;
        }
    </style>
</head>
<body>
    {!! $body !!}
</body>
</html>
