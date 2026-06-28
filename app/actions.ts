'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';

// ==========================================
// 1. ACCIONES DEL INVENTARIO
// ==========================================

export async function addItem(formData: FormData) {
  if (!process.env.POSTGRES_PRISMA_URL) return;
  const sql = postgres(process.env.POSTGRES_PRISMA_URL);
  
  const name = formData.get('name') as string;
  const stock = parseInt(formData.get('stock') as string, 10);

  if (!name || isNaN(stock)) return;

  await sql`INSERT INTO items (name, stock) VALUES (${name}, ${stock});`;

  revalidatePath('/inventory');
  revalidatePath('/manage');
}

export async function updateStock(formData: FormData) {
  if (!process.env.POSTGRES_PRISMA_URL) return;
  const sql = postgres(process.env.POSTGRES_PRISMA_URL);
  
  const id = parseInt(formData.get('id') as string, 10);
  const stock = parseInt(formData.get('stock') as string, 10);

  if (isNaN(id) || isNaN(stock)) return;

  await sql`UPDATE items SET stock = ${stock} WHERE id = ${id};`;

  revalidatePath('/inventory');
  revalidatePath('/manage');
}

// ==========================================
// 2. ACCIONES DE LA LISTA DE LA COMPRA
// ==========================================

export async function addShoppingItem(formData: FormData) {
  if (!process.env.POSTGRES_PRISMA_URL) return;
  const sql = postgres(process.env.POSTGRES_PRISMA_URL);
  
  const name = formData.get('name') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const unit = (formData.get('unit') as string).trim() || 'ud';

  if (!name || isNaN(amount)) return;

  await sql`
    INSERT INTO shopping_list (name, amount, unit) 
    VALUES (${name}, ${amount}, ${unit})
    ON CONFLICT (name, unit) 
    DO UPDATE SET amount = shopping_list.amount + EXCLUDED.amount;
  `;

  revalidatePath('/shopping-list');
}

export async function updateShoppingItem(formData: FormData) {
  if (!process.env.POSTGRES_PRISMA_URL) return;
  const sql = postgres(process.env.POSTGRES_PRISMA_URL);
  
  const id = parseInt(formData.get('id') as string, 10);
  const amount = parseFloat(formData.get('amount') as string);

  if (isNaN(id) || isNaN(amount)) return;

  if (amount <= 0) {
    await sql`DELETE FROM shopping_list WHERE id = ${id};`;
  } else {
    await sql`UPDATE shopping_list SET amount = ${amount} WHERE id = ${id};`;
  }

  revalidatePath('/shopping-list');
}

// ==========================================
// 3. ACCIONES DEL CALENDARIO Y MENÚ
// ==========================================

export async function addMeal(formData: FormData) {
  if (!process.env.POSTGRES_PRISMA_URL) return;
  const sql = postgres(process.env.POSTGRES_PRISMA_URL);
  
  const day = formData.get('day_of_week') as string;
  const type = formData.get('meal_type') as string;
  const name = formData.get('recipe_name') as string;

  if (!day || !type || !name) return;

  await sql`INSERT INTO weekly_meals (day_of_week, meal_type, recipe_name) VALUES (${day}, ${type}, ${name});`;

  revalidatePath('/calendar');
  revalidatePath('/calendar/manage');
}

export async function deleteMeal(formData: FormData) {
  if (!process.env.POSTGRES_PRISMA_URL) return;
  const sql = postgres(process.env.POSTGRES_PRISMA_URL);
  
  const id = parseInt(formData.get('id') as string, 10);
  if (isNaN(id)) return;

  await sql`DELETE FROM weekly_meals WHERE id = ${id};`;

  revalidatePath('/calendar');
  revalidatePath('/calendar/manage');
}

export async function addMealIngredient(formData: FormData) {
  if (!process.env.POSTGRES_PRISMA_URL) return;
  const sql = postgres(process.env.POSTGRES_PRISMA_URL);
  
  const meal_id = parseInt(formData.get('meal_id') as string, 10);
  const name = formData.get('name') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const unit = (formData.get('unit') as string).trim() || 'ud';

  if (isNaN(meal_id) || !name || isNaN(amount)) return;

  await sql`INSERT INTO ingredients (meal_id, name, amount, unit) VALUES (${meal_id}, ${name}, ${amount}, ${unit});`;

  revalidatePath('/calendar');
  revalidatePath('/calendar/manage');
}

export async function deleteIngredient(formData: FormData) {
  if (!process.env.POSTGRES_PRISMA_URL) return;
  const sql = postgres(process.env.POSTGRES_PRISMA_URL);
  
  const id = parseInt(formData.get('id') as string, 10);
  if (isNaN(id)) return;

  await sql`DELETE FROM ingredients WHERE id = ${id};`;

  revalidatePath('/calendar');
  revalidatePath('/calendar/manage');
}