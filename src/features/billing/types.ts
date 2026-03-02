export interface Plan {
  id: string;
  name: string;
  description: string;          
  priceUsd: number;            
  freeTrialDays: number;
  price: number;
  features: string[];
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  pdfUrl?: string;
}
