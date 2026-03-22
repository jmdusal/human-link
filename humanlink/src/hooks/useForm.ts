import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { camelizeKeys } from '@/utils/formatUtils';

export function useForm<T>(initialState: T) {
// export function useForm<T>(initialState: T, submitService?: (data: T) => Promise<any>) {
    const [formData, setFormData] = useState<T>(initialState);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (
        e: React.FormEvent, 
        submitAction: () => Promise<any>,
        onSuccess: (data: any) => void,
        moduleName: string,
        isUpdate: boolean
    ) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        
        try {
            const result = await submitAction();
            toast.success(`${moduleName} ${isUpdate ? 'updated' : 'created'} successfully!`);
            onSuccess(result);
        } catch (err: any) {
            handleAPIError(err);
            console.error(`${moduleName} Error:`, err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // const {
    //     formData, setFormData, errors,
    //     isSubmitting, setIsSubmitting,
    //     handleChange, handleAPIError
    // } = useForm<PermissionFormData>(INITIAL_PERMISSION_FORM_STATE);
    
    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setIsSubmitting(true);
        
    //     try {
    //         const savedPermission = await PermissionService.savePermission(formData as PermissionFormData, selectedPermission?.id);

    //         toast.success(`Permission ${selectedPermission ? 'updated' : 'created'} successfully!`);
    //         onSuccess(savedPermission);
    //         onClose();
    //     } catch (err: any) {
    //         handleAPIError(err);
    //         onError(err);
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };


    const handleChange = useCallback((field: keyof T, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        setErrors(prev => {
            if (prev[field as string]) {
                const { [field as string]: _, ...rest } = prev;
                return rest;
            }
            return prev;
        });
    }, []);
    
    const handleAPIError = useCallback((err: any) => {
        if (err.response?.status === 422) {
            setErrors(camelizeKeys(err.response.data.errors));
            // console.log("error Object:", err.response.data.errors);
        }
    }, []);
    
    return { 
        formData, setFormData,
        errors, setErrors,
        isSubmitting, setIsSubmitting,
        handleChange, handleAPIError,
        handleSubmit
    };
}