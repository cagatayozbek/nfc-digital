import { NextResponse } from 'next/server';
import { getBusinessBySlug, deleteBusiness } from '../../../../lib/businesses';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const profile = await getBusinessBySlug(params.slug);
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(profile);
}

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  await deleteBusiness(params.slug);
  return NextResponse.json({ success: true });
}
