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
  Dog,
  Wrench,
  Soup,
  Droplets,
  Archive,
  LucideIcon,
} from 'lucide-react';
import { CategoryId } from '../types';

const ICON_MAP: Record<CategoryId, LucideIcon> = {
  vegetables: Salad,
  fruits: Apple,
  dairy: Milk,
  meat: Drumstick,
  poultry: Egg,
  seafood: Fish,
  bakery: Croissant,
  grains: Wheat,
  rice: Wheat,
  pulses: Soup,
  spices: Flame,
  herbs: Leaf,
  dry_fruits: Package,
  beverages: Coffee,
  snacks: Cookie,
  frozen: Snowflake,
  sauces_condiments: Droplets,
  cooking_essentials: Archive,
  household: Home,
  kitchen: Home,
  cleaning: Sparkles,
  personal_care: Bath,
  baby_care: Baby,
  health: Pill,
  stationery: FileText,
  electronics: Smartphone,
  uncategorized: Tag,
  other: Tag,
  // Backward compatibility
  eggs: Egg,
  grocery: Archive,
  herbal: Leaf,
  baby: Baby,
  pet_supplies: Dog,
  home: Home,
  hardware: Wrench,
  clothing: Shirt,
  canned_food: Archive,
  grains_staples: Wheat,
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
