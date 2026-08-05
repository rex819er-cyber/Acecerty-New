export type CourseType = 'bootcamp' | 'online';
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseCategory =
  | 'Cybersecurity'
  | 'Networking'
  | 'Cloud'
  | 'Management'
  | 'Project Management'
  | 'Development'
  | 'Audit & Compliance';

export interface Course {
  id: string;
  title: string;
  shortTitle: string;
  category: CourseCategory;
  type: CourseType;
  duration: string;
  delivery: string;
  price: number;
  originalPrice?: number;
  /* ISO 4217 code `price` is denominated in. Defaults to NGN at the call site
     for cart lines built before a currency was known. */
  currency?: string;
  image?: string;
  gradient?: string;
  bgColor?: string;
  description: string;
  level: CourseLevel;
  videos?: number;
  questions?: number;
  nextDate?: string;
  isFeatured?: boolean;
  /* Which backend catalog `id` belongs to. Courses omit it and default to
     'course'; the vouchers and practice-exam pages set it explicitly so the
     order builder can address the right table. */
  itemType?: 'course' | 'exam_product' | 'exam_voucher';
}
