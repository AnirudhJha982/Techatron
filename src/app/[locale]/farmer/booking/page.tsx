import BookingWizardClient from "./BookingWizardClient"
import { getCentres } from "@/app/actions/booking"
import { auth } from "@/auth"

export default async function FarmerBookingPage() {
  const session = await auth()
  
  let initialCentres: any[] = []
  
  if (session?.user?.role === 'FARMER') {
    try {
      initialCentres = await getCentres()
    } catch (err) {
      console.error("Failed to fetch centres on server:", err)
    }
  }

  return (
    <BookingWizardClient initialCentres={initialCentres} />
  )
}
