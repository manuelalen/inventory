import postgres from 'postgres';
import Link from 'next/link';
import { addMeal, deleteMeal, addMealIngredient, deleteIngredient } from '../../actions';

export const dynamic = 'force-dynamic';

interface Meal {
  id: number;
  day_of_week: string;
  meal_type: string;
  recipe_name: string;
  ingredients: { id: number; name: string; amount: number; unit: string }[];
}

export default async function ManageCalendarPage() {
  let meals: Meal[] = [];

  if (process.env.POSTGRES_PRISMA_URL) {
    const sql = postgres(process.env.POSTGRES_PRISMA_URL);
    try {
      meals = await sql<Meal[]>`
        SELECT 
          m.id, 
          m.day_of_week, 
          m.meal_type, 
          m.recipe_name,
          COALESCE(
            json_agg(
              json_build_object('id', i.id, 'name', i.name, 'amount', i.amount, 'unit', i.unit)
            ) FILTER (WHERE i.id IS NOT NULL), '[]'
          ) as ingredients
        FROM weekly_meals m
        LEFT JOIN ingredients i ON m.id = i.meal_id
        GROUP BY m.id, m.day_of_week, m.meal_type, m.recipe_name
        ORDER BY 
          CASE m.day_of_week 
            WHEN 'Lunes' THEN 1 WHEN 'Martes' THEN 2 WHEN 'Miércoles' THEN 3 
            WHEN 'Jueves' THEN 4 WHEN 'Viernes' THEN 5 WHEN 'Sábado' THEN 6 WHEN 'Domingo' THEN 7 
          END,
          m.meal_type DESC;
      `;
    } catch (error) {
      console.error("Error conectando a DB:", error);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">⚙️ Configurar Menú</h1>
          <Link href="/calendar" className="text-blue-600 hover:underline text-sm font-medium">
            ← Volver al Calendario
          </Link>
        </div>

        {/* 1. Formulario para dar de alta un plato nuevo */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Añadir Plato al Menú</h2>
          <form action={addMeal} className="flex flex-col md:flex-row gap-4">
            <select name="day_of_week" className="px-4 py-2 border border-gray-300 rounded-lg bg-white" required>
              <option value="">Día...</option>
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select name="meal_type" className="px-4 py-2 border border-gray-300 rounded-lg bg-white" required>
              <option value="">Tipo...</option>
              <option value="Comida">Comida</option>
              <option value="Cena">Cena</option>
            </select>
            <input
              type="text"
              name="recipe_name"
              placeholder="Ej. Salmón al horno"
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Crear Plato
            </button>
          </form>
        </div>

        {/* 2. Grid de platos existentes con sus ingredientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map(meal => (
            <div key={meal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              
              {/* Cabecera del Plato */}
              <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{meal.day_of_week} • {meal.meal_type}</span>
                  <h3 className="text-lg font-bold text-gray-800">{meal.recipe_name}</h3>
                </div>
                <form action={deleteMeal}>
                  <input type="hidden" name="id" value={meal.id} />
                  <button type="submit" className="text-red-500 hover:text-red-700 text-xl font-bold px-2" title="Borrar Comida">
                    ×
                  </button>
                </form>
              </div>

              {/* Lista de Ingredientes Actuales */}
              <div className="p-4 flex-1">
                <ul className="space-y-2 mb-4">
                  {meal.ingredients.map(ing => (
                    <li key={ing.id} className="flex justify-between items-center text-sm border-b pb-1">
                      <span>{ing.name} <span className="text-gray-500">({ing.amount} {ing.unit})</span></span>
                      <form action={deleteIngredient}>
                        <input type="hidden" name="id" value={ing.id} />
                        <button type="submit" className="text-red-400 hover:text-red-600 text-lg">×</button>
                      </form>
                    </li>
                  ))}
                  {meal.ingredients.length === 0 && (
                    <li className="text-xs text-gray-400 italic">No hay ingredientes.</li>
                  )}
                </ul>

                {/* Formulario para añadir ingredientes a este plato */}
                <form action={addMealIngredient} className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100">
                  <input type="hidden" name="meal_id" value={meal.id} />
                  <input type="text" name="name" placeholder="Ingrediente" required className="w-1/2 px-2 py-1 text-sm border border-gray-300 rounded" />
                  <input type="number" step="0.1" name="amount" placeholder="Cant" required className="w-1/4 px-2 py-1 text-sm border border-gray-300 rounded" />
                  <input type="text" name="unit" placeholder="ud" defaultValue="ud" required className="w-1/4 px-2 py-1 text-sm border border-gray-300 rounded" />
                  <button type="submit" className="bg-green-600 text-white px-2 py-1 rounded text-sm font-bold">+</button>
                </form>
              </div>

            </div>
          ))}
          {meals.length === 0 && (
            <div className="col-span-full p-6 text-center text-gray-500 italic bg-white rounded-lg border border-gray-200">
              No hay comidas planificadas todavía.
            </div>
          )}
        </div>

      </div>
    </main>
  );
}