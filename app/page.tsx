import postgres from 'postgres';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const sql = postgres(process.env.POSTGRES_PRISMA_URL as string);

interface Item {
  id: number;
  name: string;
  stock: number;
}

export default async function InventoryPage() {
  const rows = await sql<Item[]>`SELECT id, name, stock FROM items ORDER BY id ASC;`;

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Estado del Inventario</h1>
          <Link 
            href="/manage" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Gestionar Inventario →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full text-left text-sm font-light">
            <thead className="bg-gray-100 border-b border-gray-200 font-medium text-gray-700">
              <tr>
                <th scope="col" className="px-6 py-4">ID</th>
                <th scope="col" className="px-6 py-4">Objeto</th>
                <th scope="col" className="px-6 py-4">Stock Disponible</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.id}</td>
                  <td className="px-6 py-4 text-gray-700">{item.name}</td>
                  <td className="px-6 py-4">
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.stock} uds.
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {rows.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No hay objetos en la base de datos.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}