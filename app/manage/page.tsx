import postgres from 'postgres';
import Link from 'next/link';
import { addItem, updateStock } from '../actions';
export const dynamic = 'force-dynamic';
const sql = postgres(process.env.POSTGRES_PRISMA_URL as string);

interface Item {
  id: number;
  name: string;
  stock: number;
}

export default async function ManagePage() {
  const rows = await sql<Item[]>`SELECT id, name, stock FROM items ORDER BY id ASC;`;

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
          <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">
            ← Volver al Inventario
          </Link>
        </div>

        {/* Sección 1: Formulario de Alta */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Añadir Nuevo Objeto</h2>
          <form action={addItem} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="name"
              placeholder="Ej. Ratón óptico"
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
            />
            <input
              type="number"
              name="stock"
              placeholder="Stock"
              required
              min="0"
              className="w-full md:w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Añadir al Stock
            </button>
          </form>
        </div>

        {/* Sección 2: Tabla de Edición Directa */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-700 p-6 border-b border-gray-200">Modificar Unidades</h2>
          <table className="min-w-full text-left text-sm font-light">
            <thead className="bg-gray-100 border-b border-gray-200 font-medium text-gray-700">
              <tr>
                <th scope="col" className="px-6 py-4">ID</th>
                <th scope="col" className="px-6 py-4">Objeto</th>
                <th scope="col" className="px-6 py-4">Cantidad Actual</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.id}</td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{item.name}</td>
                  <td className="px-6 py-4">
                    {/* Cada fila es un formulario independiente que procesa su propia actualización */}
                    <form action={updateStock} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={item.id} />
                      <input
                        type="number"
                        name="stock"
                        defaultValue={item.stock}
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
        </div>
      </div>
    </main>
  );
}