import postgres from 'postgres';
import Link from 'next/link';
import { addShoppingItem, updateShoppingItem } from '../actions';
import ReceiptActions from './ReceiptActions';

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

  // Calculamos el total de artículos distintos en el ticket
  const totalArticulos = items.length;

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8 font-mono print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto">
        
        {/* Barra de navegación - Se oculta al imprimir */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h1 className="text-2xl font-bold text-gray-800">Control de Suministros</h1>
          <Link href="/calendar" className="text-blue-600 hover:underline text-sm font-medium">
            ← Volver al Calendario
          </Link>
        </div>

        {/* Sección de Alta Manual - Se oculta al imprimir */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 max-w-md mx-auto print:hidden">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Añadir a la lista</h2>
          <form action={addShoppingItem} className="flex flex-col gap-3">
            <input
              type="text"
              name="name"
              placeholder="Ej. Pechuga de pollo"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white"
            />
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                name="amount"
                placeholder="Cant."
                required
                min="0.1"
                className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white"
              />
              <input
                type="text"
                name="unit"
                placeholder="ud, kg, L..."
                required
                defaultValue="ud"
                className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white"
              />
            </div>
            <button
              type="submit"
              className="bg-gray-800 hover:bg-gray-950 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Insertar en Ticket
            </button>
          </form>
        </div>

        {/* COMPONENTE DE ACCIONES (WhatsApp y PDF) - Se oculta al imprimir */}
        <ReceiptActions items={items} />

        {/* EL TICKET DE COMPRA (Estructura visual térmica) */}
        <div className="bg-white max-w-md mx-auto p-6 shadow-md border-t-8 border-gray-800 rounded-b-md relative print:shadow-none print:border-t-0 print:p-0 print:max-w-full">
          
          {/* Cabecera del Ticket */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-black tracking-widest text-gray-900 uppercase">*** TICKET COMPRA ***</h2>
            <p className="text-xs text-gray-500 mt-1">Suministros y Provisiones</p>
            <p className="text-xs text-gray-400 mt-4 text-left">FECHA: {new Date().toLocaleDateString('es-ES')} {new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</p>
            <div className="border-b border-dashed border-gray-400 my-3"></div>
          </div>

          {/* Cuerpo del Ticket */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="text-gray-600 font-bold">
                <th className="text-left pb-2">CONCEPTO</th>
                <th className="text-right pb-2 print:pr-0 pr-24">CANT.</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="text-gray-800 border-b border-gray-100">
                  {/* Nombre del ingrediente */}
                  <td className="py-3 pr-2 align-middle font-medium uppercase text-xs">
                    {item.name}
                  </td>
                  
                  {/* Formulario/Input inline (en web se edita, en PDF se ve plano) */}
                  <td className="py-2 text-right align-middle">
                    <form action={updateShoppingItem} className="flex items-center justify-end gap-2 print:block">
                      <input type="hidden" name="id" value={item.id} />
                      
                      {/* En impresión ocultamos el input estético y pintamos texto plano */}
                      <span className="hidden print:inline font-bold text-xs">
                        {item.amount} {item.unit.toUpperCase()}
                      </span>
                      
                      <input
                        type="number"
                        step="0.1"
                        name="amount"
                        defaultValue={item.amount}
                        min="0"
                        required
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-right text-xs bg-white font-bold text-gray-900 print:hidden"
                      />
                      <span className="text-xs text-gray-500 font-bold w-8 text-left uppercase print:hidden">
                        {item.unit}
                      </span>
                      <button
                        type="submit"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded text-[10px] font-black transition-colors print:hidden"
                        title="Actualizar o poner 0 para borrar"
                      >
                        OK
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pie del Ticket */}
          <div className="border-t border-dashed border-gray-400 pt-4">
            <div className="flex justify-between font-bold text-sm text-gray-900">
              <span>TOTAL ITEMS:</span>
              <span>{totalArticulos} UDS</span>
            </div>
            <div className="border-b border-dashed border-gray-400 my-4"></div>
            <p className="text-center text-[10px] text-gray-400 uppercase tracking-wider">
              *** fin de la transmision ***
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}