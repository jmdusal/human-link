
export const toCamel = (str: string): string => {
    return str.replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
    );
};

export const camelizeKeys = (obj: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    
    Object.keys(obj).forEach((key) => {
        result[toCamel(key)] = obj[key];
    });
    
    return result;
};