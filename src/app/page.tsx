'use client';

import { useState, useEffect } from 'react';
import { Camera, TrendingUp, Flame, Apple } from 'lucide-react';
import { supabase, type Meal } from '@/lib/supabase';
import { MealCard } from './components/MealCard';
import { StatsCard } from './components/StatsCard';
import { UploadModal } from './components/UploadModal';

export default function Home() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = 'demo-user'; // Em produção, usar autenticação real

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeals(data || []);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayMeals = meals.filter(
    (meal) =>
      new Date(meal.created_at).toDateString() === new Date().toDateString()
  );

  const todayStats = todayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.total_calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const weeklyCalories = meals
    .filter((meal) => {
      const mealDate = new Date(meal.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return mealDate >= weekAgo;
    })
    .reduce((acc, meal) => acc + meal.total_calories, 0);

  const avgDailyCalories = Math.round(weeklyCalories / 7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Apple className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  NutriTracker
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Seu assistente nutricional
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl sm:rounded-2xl font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300"
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nova Refeição</span>
              <span className="sm:hidden">Adicionar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <StatsCard
            title="Calorias Hoje"
            value={todayStats.calories}
            unit="kcal"
            icon={Flame}
            gradient="from-orange-500 to-red-500"
            target={2000}
          />
          <StatsCard
            title="Proteínas"
            value={todayStats.protein}
            unit="g"
            icon={TrendingUp}
            gradient="from-blue-500 to-cyan-500"
            target={150}
          />
          <StatsCard
            title="Carboidratos"
            value={todayStats.carbs}
            unit="g"
            icon={TrendingUp}
            gradient="from-purple-500 to-pink-500"
            target={250}
          />
          <StatsCard
            title="Gorduras"
            value={todayStats.fat}
            unit="g"
            icon={TrendingUp}
            gradient="from-amber-500 to-orange-500"
            target={70}
          />
        </div>

        {/* Weekly Average */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 border border-slate-200/50 mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Média Semanal
            </h2>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs sm:text-sm font-medium">
              Últimos 7 dias
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {avgDailyCalories}
            </span>
            <span className="text-base sm:text-lg text-slate-500">
              kcal/dia
            </span>
          </div>
        </div>

        {/* Meals History */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
            Histórico de Refeições
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 border border-slate-200/50 animate-pulse"
                >
                  <div className="h-48 bg-slate-200 rounded-xl sm:rounded-2xl mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded-lg mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded-lg w-2/3"></div>
                </div>
              ))}
            </div>
          ) : meals.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-12 sm:p-16 shadow-lg shadow-slate-200/50 border border-slate-200/50 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                Nenhuma refeição registrada
              </h3>
              <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8">
                Comece fotografando sua primeira refeição
              </p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl sm:rounded-2xl font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300"
              >
                Adicionar Primeira Refeição
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          )}
        </div>
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={loadMeals}
        userId={userId}
      />
    </div>
  );
}
