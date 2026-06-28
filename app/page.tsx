import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8 font-sans">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-2">Panel de Control</h1>
        <p className="text-center text-gray-500 mb-12">Gestión centralizada del hogar</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta Inventario */}
          <Link href="/inventory" className="group block bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-blue-300 transition-all">
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">Inventario</h2>
            <p className="text-gray-500 text-sm">Gestiona el stock actual de objetos y productos.</p>
          </Link>

          {/* Tarjeta Menú Semanal */}
          <Link href="/calendar" className="group block bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-purple-300 transition-all">
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">Menú Semanal</h2>
            <p className="text-gray-500 text-sm">Planifica las comidas y cenas de toda la semana.</p>
          </Link>

          {/* Tarjeta Lista de la Compra */}
          <Link href="/shopping-list" className="group block bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-green-300 transition-all">
            <div className="text-4xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">Lista de Compra</h2>
            <p className="text-gray-500 text-sm">Revisa lo que falta y añade productos manualmente.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}