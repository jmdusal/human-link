// currency (e.g., 1000 -> 1,000.00)
export const formatCurrency = (amount: number | string): string => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(value)) return '0.00';
    
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

export const toCamel = (str: string): string => {
    return str.replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
    );
};

export const camelizeKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => camelizeKeys(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [toCamel(key)]: camelizeKeys(obj[key]),
            }),
            {},
        );
    }
    return obj;
};

// PH phone numbers (e.g., 09171234567 -> 0917 123 4567)
export const formatPhoneNumber = (phone: string): string => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{4})(\d{3})(\d{4})$/);
    if (match) {
        return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return phone;
};

// converts "JOHN DOE" or "john doe" to "John Doe"
export const formatTitleCase = (str: string): string => {
    return str.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

export const formatSlug = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
};

export const capitalize = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
};