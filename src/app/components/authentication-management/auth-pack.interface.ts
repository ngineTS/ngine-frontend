export interface AuthPack {
    id: string;
    navigationId: string;
    name: string;
    description: string;
    order: number;
    price: number;
    currency: string;
    roleId: string;
    stripePriceId: string;
    isRecurringPayment: boolean;
    interval: string;
    isFree: boolean;
}