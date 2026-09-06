import { useEffect, useState } from 'react'
import Homepage from './assets/pages/Homepage.tsx'
import RegisterationPage from './assets/pages/RegisterationPage'
import LoginPage from './assets/pages/LoginPage'
import StudentDashboard from './assets/pages/Students/StudentDashboard.tsx'
import LandlordDashboard from './assets/pages/Landlords/LandloardsDashboard.tsx'
import AddAccommodation from './assets/pages/Landlords/AddAccommodation.tsx'
import AccommodationListings from './assets/pages/Landlords/AccommodationListings.tsx'

function App() {
  const [activePage, setActivePage] = useState(() => window.location.hash)

  useEffect(() => {
    const handleHashChange = () => {
      setActivePage(window.location.hash)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (activePage === '#register') {
    return <RegisterationPage />
  }

  if (activePage === '#login') {
    return <LoginPage />
  }

  if (activePage === '#student-dashboard') {
    return <StudentDashboard />
  }
  if (activePage === '#landlord-dashboard') {
    return <LandlordDashboard />
  }
  if (activePage === '#add-accommodation') {
    return <AddAccommodation />
  }
  if (activePage === '#accommodation-listings') {
    return <AccommodationListings />
  }
  return (
    <Homepage />
  )
}

export default App