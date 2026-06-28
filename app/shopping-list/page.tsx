import postgres from 'postgres';
import Link from 'next/link';

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
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🛒 Lista de la Compra</h1>
          <Link href="/calendar" className="text-blue-600 hover:underline text-sm font-medium">
            ← Volver al Calendario
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <span className="font-medium text-gray-900">{item.name}</span>
                <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm font-bold">
                  {item.amount} {item.unit}
                </span>
              </li>
            ))}
            {items.length === 0 && (
              <li className="p-6 text-center text-gray-500 italic">La lista está vacía.</li>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}