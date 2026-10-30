export type Language = 'uz' | 'ru';

export type NavTab = 
  | 'dashboard'
  | 'chat'
  | 'tariff'
  | 'calculator'
  | 'business'
  | 'complaint'
  | 'fraud'
  | 'sources';

export type LoanType = 'annuity' | 'differential';

export interface LoanInput {
  amount: number;
  annualRate: number;
  termMonths: number;
  type: LoanType;
  oneTimeFee: number; // e.g. bank commission
  monthlyInsuranceRate: number; // e.g. 0.1% of principal or flat
}

export interface AmortizationScheduleItem {
  month: number;
  monthlyPayment: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
}

export interface LoanResult {
  monthlyPayment: number; // First month or fixed annuity
  lastMonthlyPayment?: number; // For differential
  totalPayment: number;
  totalInterest: number;
  totalExtraFees: number;
  grandTotal: number;
  effectiveRate: number;
  schedule: AmortizationScheduleItem[];
  formulaExplanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
  isDemo?: boolean;
}

export interface TariffAnalysisResult {
  summary: string;
  commissionsAndFees: string[];
  interestAndPenalties: string[];
  attentionRisks: string[];
  glossary: { term: string; definition: string }[];
  disclaimer: string;
  isDemo?: boolean;
}

export interface FraudAnalysisResult {
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number;
  detectedFlags: string[];
  explanation: string;
  safetySteps: string[];
  officialDisclaimer: string;
  isDemo?: boolean;
}

export interface ComplaintResult {
  letterText: string;
  checklist: string[];
  officialChannels: { name: string; contact: string }[];
  notice: string;
  isDemo?: boolean;
}

export interface OfficialSource {
  id: string;
  name: string;
  shortDescription: string;
  url: string;
  category: string;
  verified: boolean;
  lastVerifiedAt: string;
}

export interface FeedbackSubmission {
  id?: string;
  category: string;
  message: string;
  rating: number;
  createdAt?: string;
}
