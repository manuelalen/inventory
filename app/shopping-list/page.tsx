import postgres from 'postgres';
import Link from 'next/link';
import { addShoppingItem, updateShoppingItem } from '../actions';

export const dynamic = 'force-dynamic';

interface ShoppingItem {
  id: number;
  name: string;
  amount: number;
  unit: string;
}

export default async function ShoppingListPage() {
  let items: ShoppingItem[] = [];

  if (process.env.POSTGRES_PRISMA_URL) {
    const sql = postgres(process.env.POSTGRES_PRISMA_URL);
    try {
      items = await sql<ShoppingItem[]>`
        SELECT id, name, amount, unit 
        FROM shopping_list 
        ORDER BY name ASC;
      `;
    } catch (error) {
      console.error("Error DB:", error);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🛒 Lista de la Compra</h1>
          <Link href="/calendar" className="text-blue-600 hover:underline text-sm font-medium">
            ← Volver al Calendario
          </Link>
        </div>

        {/* Sección 1: Formulario de Alta Manual */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Añadir a la lista</h2>
          <form action={addShoppingItem} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="name"
              placeholder="Ej. Leche desnatada"
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
            />
            <input
              type="number"
              step="0.1"
              name="amount"
              placeholder="Cant."
              required
              min="0.1"
              className="w-full md:w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
            />
            <input
              type="text"
              name="unit"
              placeholder="Unidad (ud, L, kg...)"
              required
              defaultValue="ud"
              className="w-full md:w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Añadir
            </button>
          </form>
        </div>

        {/* Sección 2: Tabla de Edición (Igual que el inventario) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-700 p-6 border-b border-gray-200">Productos en la Lista</h2>
          <table className="min-w-full text-left text-sm font-light">
            <thead className="bg-gray-100 border-b border-gray-200 font-medium text-gray-700">
              <tr>
                <th scope="col" className="px-6 py-4">Objeto</th>
                <th scope="col" className="px-6 py-4">Unidad</th>
                <th scope="col" className="px-6 py-4">Cantidad (Pon 0 para borrar)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                  <td className="px-6 py-4">
                    <form action={updateShoppingItem} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={item.id} />
                      <input
                        type="number"
                        step="0.1"
                        name="amount"
                        defaultValue={item.amount}
                        min="0"
                        required
                        className="w-24 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                      />
                      <button
                        type="submit"
                        className="bg-gray-800 hover:bg-gray-950 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Actualizar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="p-6 text-center text-gray-500 italic">
              La lista de la compra está vacía.
            </div>
          )}
        </div>
        
      </div>
    </main>
  );
}