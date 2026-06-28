import postgres from 'postgres';
import Link from 'next/link';

// Cortafuegos de seguridad para Vercel
export const dynamic = 'force-dynamic';

interface Meal {
  id: number;
  day_of_week: string;
  meal_type: string;
  recipe_name: string;
  ingredients: { name: string; amount: number; unit: string }[];
}

export default async function CalendarPage() {
  let meals: Meal[] = [];

  if (process.env.POSTGRES_PRISMA_URL) {
    const sql = postgres(process.env.POSTGRES_PRISMA_URL);
    try {
      // json_agg extrae los nuevos campos separando la cantidad de la unidad
      meals = await sql<Meal[]>`
        SELECT 
          m.id, 
          m.day_of_week, 
          m.meal_type, 
          m.recipe_name,
          COALESCE(
            json_agg(
              json_build_object(
                'name', i.name, 
                'amount', i.amount, 
                'unit', i.unit
              )
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

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabecera con navegación */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Menú Semanal</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">
              ← Volver al Inventario
            </Link>
            <Link 
              href="/shopping-list" 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              🛒 Lista de la Compra
            </Link>
          </div>
        </div>

        {/* Grid del Calendario */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {days.map(day => {
            const dayMeals = meals.filter(m => m.day_of_week === day);
            const comida = dayMeals.find(m => m.meal_type === 'Comida');
            const cena = dayMeals.find(m => m.meal_type === 'Cena');

            return (
              <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="bg-gray-800 text-white text-center py-3 font-semibold">
                  {day}
                </div>
                
                <div className="p-4 flex-1 flex flex-col gap-6">
                  {/* Bloque Comida */}
                  <div>
                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 border-b pb-1">Comida</h3>
                    {comida ? (
                      <div>
                        <p className="font-medium text-gray-900 mb-2">{comida.recipe_name}</p>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                          {comida.ingredients.map((ing, idx) => (
                            <li key={idx}>
                              {ing.name} <span className="text-gray-400 font-medium">({ing.amount} {ing.unit})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Sin planificar</p>
                    )}
                  </div>

                  {/* Bloque Cena */}
                  <div>
                    <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 border-b pb-1">Cena</h3>
                    {cena ? (
                      <div>
                        <p className="font-medium text-gray-900 mb-2">{cena.recipe_name}</p>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                          {cena.ingredients.map((ing, idx) => (
                            <li key={idx}>
                              {ing.name} <span className="text-gray-400 font-medium">({ing.amount} {ing.unit})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Sin planificar</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}