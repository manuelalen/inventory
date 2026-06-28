'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';

const sql = postgres(process.env.POSTGRES_PRISMA_URL as string);

export async function addItem(formData: FormData) {
  const name = formData.get('name') as string;
  const stock = parseInt(formData.get('stock') as string, 10);

  if (!name || isNaN(stock)) return;

  await sql`INSERT INTO items (name, stock) VALUES (${name}, ${stock});`;

  revalidatePath('/');
  revalidatePath('/manage');
}

export async function updateStock(formData: FormData) {
  const id = parseInt(formData.get('id') as string, 10);
  const stock = parseInt(formData.get('stock') as string, 10);

  if (isNaN(id) || isNaN(stock)) return;

  await sql`UPDATE items SET stock = ${stock} WHERE id = ${id};`;

  revalidatePath('/');
  revalidatePath('/manage');
}