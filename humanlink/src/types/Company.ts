export interface Company {
    id: number;
    name: string;
    slug: string;
    legal_name?: string | null;
    address?: string | null;
    timezone?: string;
    mail_mailer?: string | null;
    mail_host?: string | null;
    mail_port?: number | null;
    mail_username?: string | null;
    mail_encryption?: string | null;
    mail_from_address?: string | null;
    mail_from_name?: string | null;
    mail_password_set?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CompanyFormData {
    name: string;
    slug: string;
    legal_name: string;
    address: string;
    timezone: string;
    mail_mailer: string;
    mail_host: string;
    mail_port: string;
    mail_username: string;
    mail_password: string;
    mail_encryption: string;
    mail_from_address: string;
    mail_from_name: string;
}
