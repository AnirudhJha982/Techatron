import { redirect } from "next/navigation"

export default async function FarmerBookPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/farmer/booking`)
}
