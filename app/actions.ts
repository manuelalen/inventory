'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';

const sql = postgres(process.env.POSTGRES_PRISMA_URL as string);

// Acción para añadir un nuevo objeto
export async function addItem(formData: FormData) {
  const name = formData.get('name') as string;
  const stock = parseInt(formData.get('stock') as string, 10);

  if (!name || isNaN(stock)) return;

  // Inserción directa en Supabase
  await sql`INSERT INTO items (name, stock) VALUES (${name}, ${stock});`;

  // Forzamos a Next.js a actualizar los datos en ambas páginas inmediatamente
  revalidatePath('/');
  revalidatePath('/manage');
}

// Acción para actualizar el stock de un objeto existente
export async function updateStock(formData: FormData) {
  const id = parseInt(formData.get('id') as string, 10);
  const stock = parseInt(formData.get('stock') as string, 10);

  if (isNaN(id) || isNaN(stock)) return;

  // Update directo por ID
  await sql`UPDATE items SET stock = ${stock} WHERE id = ${id};`;

  revalidatePath('/');
  revalidatePath('/manage');
}