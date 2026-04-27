import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Star, ShoppingCart, Utensils } from "lucide-react";

export interface FoodItemProps {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  priceDisplay?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  isPopular?: boolean;
  totalLike?: number;
  shop?: {
    id: string;
    name: string;
    rating?: number | null;
  } | null;
  category?: {
    id: string;
    name: string;
  } | null;
}

export function FoodCard({ food }: { food: FoodItemProps }) {
  // Format price if priceDisplay is missing or messy
  const formattedPrice =
    food.priceDisplay ||
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(food.price);

  return (
    <Card className="group overflow-hidden rounded-2xl border-none bg-white shadow-sm transition-all hover:shadow-xl dark:bg-zinc-900/50 flex flex-col h-full">
      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={
            food.imageUrl ||
            food.thumbnailUrl ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop"
          }
          alt={food.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {food.isPopular && (
          <div className="absolute left-3 top-3">
            <Badge className="bg-orange-500 font-semibold text-white hover:bg-orange-600 shadow-md">
              <Star className="mr-1 h-3 w-3 fill-current" /> Phổ biến
            </Badge>
          </div>
        )}
        {food.category && (
          <div className="absolute right-3 top-3">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-zinc-800 font-medium">
              <Utensils className="mr-1 h-3 w-3" /> {food.category.name}
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-4 flex-grow flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 text-zinc-900 dark:text-zinc-100">
            {food.name}
          </h3>
        </div>
        
        {food.description && (
          <p className="text-sm text-zinc-500 line-clamp-2 dark:text-zinc-400">
            {food.description}
          </p>
        )}

        <div className="mt-auto pt-2 flex flex-col gap-1.5">
          {food.shop && (
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span className="truncate max-w-[70%] font-medium">{food.shop.name}</span>
              {food.shop.rating ? (
                <span className="flex items-center gap-1 font-semibold text-amber-500">
                  <Star className="h-3 w-3 fill-current" /> {food.shop.rating.toFixed(1)}
                </span>
              ) : null}
            </div>
          )}
          {food.totalLike != null && food.totalLike > 0 && (
            <div className="text-xs text-rose-500 font-medium">
              ❤️ {food.totalLike} lượt thích
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer / Actions */}
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {formattedPrice}
          </span>
          <Button 
            size="sm" 
            className="rounded-full bg-orange-500 hover:bg-orange-600 shadow-md transition-transform active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
