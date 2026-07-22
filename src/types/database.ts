export type UserRole = "admin" | "manager" | "sales";

export type CustomerStatus =
  | "lead"
  | "prospect"
  | "active"
  | "inactive"
  | "archived";

export type ActivityType =
  | "call"
  | "whatsapp"
  | "meeting"
  | "email"
  | "visit"
  | "demo"
  | "proposal"
  | "closing";

export type FollowUpStatus = "pending" | "done" | "cancelled";

export type PipelineStage =
  | "lead"
  | "qualified"
  | "contacted"
  | "meeting"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type QuotationStatus =
  | "draft"
  | "sent"
  | "approved"
  | "rejected"
  | "expired";

export interface User {
  id: string;
  email: string;
  fullname: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  whatsapp?: string;
  industry?: string;
  city?: string;
  address?: string;
  website?: string;
  source?: string;
  assigned_to?: string;
  status: CustomerStatus;
  deleted_at?: string;
  pipeline_stage: PipelineStage;
  created_at: string;
  updated_at: string;
  assigned_user?: User;
  activities?: Activity[];
  followups?: FollowUp[];
}

export interface Activity {
  id: string;
  customer_id: string;
  user_id: string;
  type: ActivityType;
  note: string;
  attachment_url?: string;
  created_at: string;
  user?: User;
  customer?: Customer;
}

export interface FollowUp {
  id: string;
  customer_id: string;
  assigned_to: string;
  title: string;
  due_date: string;
  reminder?: string;
  status: FollowUpStatus;
  note?: string;
  created_at: string;
  customer?: Customer;
  assigned_user?: User;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  status: "active" | "inactive";
  created_at: string;
}

export interface Quotation {
  id: string;
  customer_id: string;
  quotation_number: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: QuotationStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items?: QuotationItem[];
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string;
  qty: number;
  price: number;
  product?: Product;
}

export interface Deal {
  id: string;
  customer_id: string;
  name: string;
  value: number;
  pipeline_stage: PipelineStage;
  status: "active" | "won" | "lost";
  assigned_to: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface DashboardStats {
  totalCustomers: number;
  newCustomers: number;
  totalRevenue: number;
  dealsWon: number;
  dealsLost: number;
  followUpsToday: number;
  followUpsOverdue: number;
  pipelineValue: number;
}
