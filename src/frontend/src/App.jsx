import { useState, useEffect } from 'react'
import './App.css'
import MapPage from './components/MapPage'
import EstablishmentDetail from './components/EstablishmentDetail'
import SearchBar from './components/SearchBar'

function App() {
  const [establishments, setEstablishments] = useState([])
  const [selectedEstablishment, setSelectedEstablishment] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredEstablishments, setFilteredEstablishments] = useState([])

  useEffect(() => {
    fetchEstablishments()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredEstablishments(
        establishments.filter(e =>
          e.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    } else {
      setFilteredEstablishments(establishments)
    }
  }, [searchQuery, establishments])

  const fetchEstablishments = async () => {
    try {
      const response = await fetch('/api/establishments')
      const data = await response.json()
      setEstablishments(data)
      setFilteredEstablishments(data)
    } catch (error) {
      console.error('Failed to fetch establishments:', error)
    }
  }

  const handleEstablishmentCreated = () => {
    fetchEstablishments()
  }

  const handleReviewAdded = async (establishmentId) => {
    try {
      const response = await fetch(`/api/establishments/${establishmentId}`)
      const data = await response.json()
      setSelectedEstablishment(data)
      setEstablishments(
        establishments.map(e => (e.id === establishmentId ? data : e))
      )
    } catch (error) {
      console.error('Failed to fetch updated establishment:', error)
    }
  }

  const handleSelectEstablishment = async (id) => {
    try {
      const response = await fetch(`/api/establishments/${id}`)
      const data = await response.json()
      setSelectedEstablishment(data)
    } catch (error) {
      console.error('Failed to fetch establishment details:', error)
    }
  }

  const handleCloseDetail = () => {
    setSelectedEstablishment(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚽 Toilet Rating Map</h1>
        <SearchBar searchQuery={searchQuery} onSearch={setSearchQuery} />
      </header>
      <main className="app-main">
        <MapPage
          establishments={selectedEstablishment ? establishments : filteredEstablishments}
          onMapClick={handleEstablishmentCreated}
          onSelectEstablishment={handleSelectEstablishment}
        />
        {selectedEstablishment && (
          <EstablishmentDetail
            establishment={selectedEstablishment}
            onClose={handleCloseDetail}
            onReviewAdded={handleReviewAdded}
          />
        )}
      </main>
    </div>
  )
}

export default App
