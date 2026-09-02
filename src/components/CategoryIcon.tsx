import React from 'react';
import {
  Salad,
  Apple,
  Milk,
  Egg,
  Fish,
  Drumstick,
  Croissant,
  Coffee,
  Wheat,
  Flame,
  Leaf,
  Sparkles,
  Snowflake,
  Cookie,
  Home,
  Bath,
  Pill,
  Baby,
  FileText,
  Smartphone,
  Shirt,
  Tag,
  Package,
  LucideIcon,
} from 'lucide-react';
import { CategoryId } from '../types';

const ICON_MAP: Record<CategoryId, LucideIcon> = {
  fruits: Apple,
  vegetables: Salad,
  dairy: Milk,
  meat: Drumstick,
  seafood: Fish,
  eggs: Egg,
  bakery: Croissant,
  beverages: Coffee,
  grocery: Wheat,
  spices: Flame,
  herbs: Leaf,
  dry_fruits: Package,
  frozen: Snowflake,
  snacks: Cookie,
  household: Home,
  cleaning: Sparkles,
  personal_care: Bath,
  health: Pill,
  baby: Baby,
  stationery: FileText,
  electronics: Smartphone,
  clothing: Shirt,
  other: Tag,
  // Backward compatibility
  grains_staples: Wheat,
  baby_care: Baby,
  medicines: Pill,
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
