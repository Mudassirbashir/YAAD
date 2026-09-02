import React from 'react';
import {
  Salad,
  Apple,
  Milk,
  Wheat,
  Fish,
  Croissant,
  Coffee,
  Cookie,
  Snowflake,
  Home,
  Sparkles,
  Bath,
  Baby,
  Pill,
  FileText,
  Smartphone,
  Shirt,
  Tag,
  LucideIcon,
} from 'lucide-react';
import { CategoryId } from '../types';

const ICON_MAP: Record<CategoryId, LucideIcon> = {
  vegetables: Salad,
  fruits: Apple,
  dairy: Milk,
  grains_staples: Wheat,
  meat: Fish,
  bakery: Croissant,
  beverages: Coffee,
  snacks: Cookie,
  frozen: Snowflake,
  household: Home,
  cleaning: Sparkles,
  personal_care: Bath,
  baby_care: Baby,
  medicines: Pill,
  stationery: FileText,
  electronics: Smartphone,
  clothing: Shirt,
  other: Tag,
};

interface CategoryIconProps {
  categoryId: CategoryId | string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  categoryId,
  className = 'w-4 h-4',
}) => {
  const IconComponent = ICON_MAP[categoryId as CategoryId] || Tag;
  return <IconComponent className={className} />;
};
