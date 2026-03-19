export const useFormatDate = () => {
    const formatDate = (dateInput: string | Date | undefined | null) => {
        if (!dateInput) return 'N/A';
        
        const date = new Date(dateInput);
        
        if (isNaN(date.getTime())) return 'Invalid Date';

        // Custom format test: January, 29 2005 4:35 PM 
        return date.toLocaleString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return { formatDate };
};