import type { LeavePolicy, LeavePolicyFormData } from "@/types";

export const INITIAL_LEAVE_POLICY_FORM_STATE: LeavePolicyFormData = {
    name: '',
    slug: '',
    defaultCredits: '',
    isActive: true,
    isPaid: true,
    isCashable: true,
    allowCarryOver: true,
    maxCarryOver: '',
    requiresAttachment: true,
};

export const formatLeavePolicyFormData = (policy: LeavePolicy): LeavePolicyFormData => ({
    name: policy.name || '',
    slug: policy.slug,
    defaultCredits: Number(policy.defaultCredits || 0).toFixed(2),
    isActive: !!policy.isActive,
    isPaid: !!policy.isPaid,
    isCashable: !!policy.isCashable,
    allowCarryOver: !!policy.allowCarryOver,
    maxCarryOver: Number(policy.maxCarryOver || 0).toFixed(2),
    requiresAttachment: !!policy.requiresAttachment
});

// export const formatLeavePolicyFormData = (policy: LeavePolicy): LeavePolicyFormData => {
//     return {
//         name: policy.name || '',
//         slug: policy.slug,
//         defaultCredits: Number(policy.defaultCredits || 0).toFixed(2),
//         isActive: !!policy.isActive,
//         isPaid: !!policy.isPaid,
//         isCashable: !!policy.isCashable,
//         allowCarryOver: !!policy.allowCarryOver,
//         maxCarryOver: Number(policy.maxCarryOver || 0).toFixed(2),
//         requiresAttachment: !!policy.requiresAttachment
//     };
// };