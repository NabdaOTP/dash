export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export interface Invoice {
  id: string;
  totalAmountUsd?: string;
  amount?: number;
  currency: string;
  status?: string;       
  paidAt?: string;       
  createdAt: string;
  invoicePdf?: string;
  pdfUrl?: string;
  hostedInvoiceUrl?: string;
  periodStart?: string;
  periodEnd?: string;
  metadata?: {
    planId?: string;
    planCode?: string;
    interval?: string;   
    instanceId?: string;
    userId?: string;
  };
}

export interface CurrentSubscription {
  plan: Plan;
  status?: string;
  trialEnd?: string;
  endDate?: string;
  autoRenew?: boolean;
}