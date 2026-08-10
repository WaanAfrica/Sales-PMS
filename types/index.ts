export type UserRole = 'ADMIN' | 'SALES';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface DailySalesRecord {
  id: string;
  userId: string;
  date: string | Date;
  salesRevenue: number;
  repeatCustomers: number;
  newCustomers: number;
  walkIns: number;
  dailyAcquisition: number;
  newQuotations: number;
  closedQuotations: number;
  quotationAge: number;
  hotQuotationValue: number;
  salesPipelineValue: number;
  accountsReceivable: number;
  opportunities?: string | null;
  challenges?: string | null;
  status: "PENDING" | "DRAFT" | "SUBMITTED";
  submittedAt: Date | null;
  updatedAt: Date;
}

export interface MonthlyTargetRecord {
  id: string;
  userId: string;
  month: number;
  year: number;
  salesRevenueTarget: number;
  repeatCustomerTarget: number;
  newCustomerTarget: number;
  walkInTarget: number;
  quotationTarget: number;
  pipelineTarget: number;
}
