import { type Meal } from '@/lib/supabase';
import { Clock } from 'lucide-react';

interface MealCardProps {
  meal: Meal;
}

export function MealCard({ meal }: MealCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem às ${date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 border border-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300">
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-slate-100 to-slate-200">
        {meal.image_url && (
          <img
            src={meal.image_url}
            alt="Refeição"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 backdrop-blur-sm rounded-xl flex items-center gap-1.5 sm:gap-2 shadow-lg">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
          <span className="text-xs sm:text-sm font-medium text-slate-700">
            {formatDate(meal.created_at)}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Total Calories */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {meal.total_calories}
            </span>
            <span className="text-sm sm:text-base text-slate-500">kcal</span>
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-blue-600">
              {meal.protein}g
            </div>
            <div className="text-xs sm:text-sm text-slate-500">Proteína</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-purple-600">
              {meal.carbs}g
            </div>
            <div className="text-xs sm:text-sm text-slate-500">Carbos</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-amber-600">
              {meal.fat}g
            </div>
            <div className="text-xs sm:text-sm text-slate-500">Gordura</div>
          </div>
        </div>

        {/* Foods List */}
        <div className="space-y-2">
          {meal.foods.map((food, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-xl"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                  {food.name}
                </div>
                <div className="text-xs text-slate-500">{food.quantity}</div>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-700 ml-2">
                {food.calories} kcal
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
