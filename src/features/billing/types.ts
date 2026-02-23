export interface Plan {
  id: string;
  name: string;
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

