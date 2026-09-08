import { useEffect, useState } from 'react'
import Homepage from './app/page.tsx'
import RegisterationPage from './app/register/page.tsx'
import LoginPage from './app/login/page.tsx'
import StudentDashboard from './app/student/dashboard/page.tsx'
import LandlordDashboard from './app/landlord/dashboard/page.tsx'
import AddAccommodation from './app/landlord/AddAccommodation/page.tsx'
import AccommodationListings from './app/landlord/AccommodationListing/page.tsx'
import StudentBrowseListings from './app/student/browseListings/page.tsx'

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
  if (activePage === '#student-browse-listings') {
    return <StudentBrowseListings />
  }
  return (
    <Homepage />
  )
}

export default App