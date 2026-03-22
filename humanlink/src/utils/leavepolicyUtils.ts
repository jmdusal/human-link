import type { LeavePolicy, LeavePolicyFormData } from "@/types/models";

export const INITIAL_LEAVE_POLICY_FORM_STATE: LeavePolicyFormData = {
    name: '',
    slug: '',
    defaultCredits: '',
    isActive: true,
    isPaid: true,
};

export const formatLeavePolicyFormData = (policy: LeavePolicy): LeavePolicyFormData => {
    return {
        name: policy.name || '',
        slug: policy.slug,
        // defaultCredits: policy.defaultCredits.toString(),
        defaultCredits: Number(policy.defaultCredits || 0).toFixed(2),
        isActive: !!policy.isActive,
        isPaid: !!policy.isPaid,
    };
};