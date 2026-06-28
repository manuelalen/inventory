'use client';

interface ShoppingItem {
  id: number;
  name: string;
  amount: number;
  unit: string;
}

interface ReceiptActionsProps {
  items: ShoppingItem[];
}

export default function ReceiptActions({ items }: ReceiptActionsProps) {
  
  // 1. Generar texto formateado para WhatsApp
  const shareSuberscript = () => {
    if (items.length === 0) return '';
    
    let text = `🛒 *LISTA DE LA COMPRA* 🛒\n`;
    text += `-----------------------------\n`;
    items.forEach(item => {
      text += `• *${item.name}*: ${item.amount} ${item.unit}\n`;
    });
    text += `-----------------------------\n`;
    text += `Generado el ${new Date().toLocaleDateString('es-ES')}`;
    
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  // 2. Lanzar la impresión nativa (optimizado para Guardar como PDF)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-3 mb-6 print:hidden w-full max-w-md mx-auto">
      <a
        href={shareSuberscript()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white text-center py-2.5 rounded-xl font-medium text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
      >
        <span>💬</span> Enviar por WhatsApp
      </a>
      <button
        onClick={handlePrint}
        className="flex-1 bg-gray-800 hover:bg-gray-950 text-white py-2.5 rounded-xl font-medium text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
      >
        <span>📄</span> Descargar en PDF
      </button>
    </div>
  );
}