import React, { useState, useEffect, useCallback } from 'react'
import {
  TrashIcon,
  SearchIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import '../styles/HallList.css'
import loadingLogo from '../assets/logo.png'

export default function HallList({ isAdmin = true }) {
  const navigate = useNavigate()

  const [halls, setHalls] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' })
  const [filteredHalls, setFilteredHalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showLoader, setShowLoader] = useState(true)
  const [allowDelete, setAllowDelete] = useState(isAdmin)

  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [selectedHall, setSelectedHall] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    const fetchHalls = async () => {
      const start = Date.now()
      try {
        const response = await fetch('http://localhost:5000/api/halls')
        if (!response.ok) throw new Error(`Server error: ${response.status}`)
        const data = await response.json()
        setHalls(data)
      } catch (err) {
        console.error("Fetch error:", err)
        setError("Failed to load hall data")
      } finally {
        const elapsed = Date.now() - start
        const remaining = 500 - elapsed // minimum 500ms loader
        setTimeout(() => setLoading(false), remaining > 0 ? remaining : 0)
      }
    }

    fetchHalls()
  }, [])

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setShowLoader(false), 500)
    }
  }, [loading])

  useEffect(() => {
    let filtered = halls.filter(hall =>
      hall.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const comparison = aVal.localeCompare(bVal)
          return sortConfig.direction === 'ascending' ? comparison : -comparison
        } else {
          if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1
          if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1
          return 0
        }
      })
    }

    setFilteredHalls(filtered)
  }, [halls, searchTerm, sortConfig])

  const requestSort = (key) => {
    let direction = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/halls/${selectedHall.hall_id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to delete hall")
      }
      setHalls(prev => prev.filter(h => h.hall_id !== selectedHall.hall_id))
      setConfirmDeleteId(null)
      setSelectedHall(null)
    } catch (err) {
      console.error("❌ Delete failed:", err)
      setDeleteError(err.message)
    }
  }

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setConfirmDeleteId(null)
      setSelectedHall(null)
      setDeleteError(null)
    }
  }, [])

  useEffect(() => {
    if (confirmDeleteId) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [confirmDeleteId, handleKeyDown])

  return (
    <>
      {showLoader && (
        <div className={`loading-overlay ${!loading ? 'fade-out' : ''}`}>
          <img src={loadingLogo} alt="Loading" className="loading-logo" />
          <p>Loading...</p>
        </div>
      )}

      <div className="admin-container">
        <div className="admin-panel">
          <div className="admin-header">
            <h1 className="admin-title">Hall List</h1>
            <div className="nav-buttons">
              <button className="nav-button" onClick={() => navigate(-1)}>Dashboard</button>
            </div>
          </div>

          <div className="admin-main">
            <div className="main-content">
              <div className="main-toolbar">
                <div className="sort-dropdown">
                  <button
                    className="sort-button"
                    onClick={() => setSortMenuOpen(!sortMenuOpen)}
                    aria-haspopup="true"
                    aria-expanded={sortMenuOpen}
                  >
                    Sort By
                    <ChevronDownIcon className={`h-5 w-5 ${sortMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {sortMenuOpen && (
                    <div className="sort-menu" role="menu">
                      {['hall_id', 'name', 'no_of_seats', 'main_building'].map((key) => (
                        <button
                          key={key}
                          onClick={() => { requestSort(key); setSortMenuOpen(false) }}
                          role="menuitem"
                        >
                          {key === 'hall_id' && 'Index'}
                          {key === 'name' && 'Name'}
                          {key === 'no_of_seats' && 'No. of Seats'}
                          {key === 'main_building' && 'Main Building'}
                          {sortConfig.key === key && (
                            sortConfig.direction === 'ascending'
                              ? <ArrowUpIcon className="h-4 w-4" />
                              : <ArrowDownIcon className="h-4 w-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    aria-label="Search halls by name"
                  />
                  <SearchIcon className="search-icon" />
                </div>
              </div>

              <div className="overflow-x-auto">
                {error ? (
                  <p className="error-message">{error}</p>
                ) : (
                  <table className="halls-table" role="grid" aria-rowcount={filteredHalls.length}>
                    <thead>
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Seats</th>
                        <th scope="col">Main Building</th>
                        <th scope="col">Tech Officer</th>
                        <th scope="col">Contact</th>
                        {allowDelete && <th scope="col">Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHalls.length > 0 ? (
                        filteredHalls.map((hall) => (
                          <tr key={hall.hall_id}>
                            <td>{hall.hall_id}</td>
                            <td
                              className="clickable-name"
                              onClick={() => navigate(`/hall/${hall.hall_id}`)}
                              tabIndex={0}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  navigate(`/hall/${hall.hall_id}`)
                                }
                              }}
                              aria-label={`View details of hall ${hall.name}`}
                              role="link"
                            >
                              {hall.name}
                            </td>
                            <td>{hall.no_of_seats}</td>
                            <td>{hall.main_building}</td>
                            <td>{hall.assigned_tech_officer}</td>
                            <td>{hall.contact_no || 'N/A'}</td>
                            {allowDelete && (
                              <td>
                                <button
                                  className="delete-button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedHall(hall)
                                    setConfirmDeleteId(hall.hall_id)
                                    setDeleteError(null)
                                  }}
                                  aria-label={`Delete hall ${hall.name}`}
                                >
                                  <TrashIcon size={16} /> Delete
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={allowDelete ? 7 : 6} className="empty-message">
                            No halls found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {confirmDeleteId && selectedHall && (
            <div
              className="modal-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modalTitle"
              aria-describedby="modalDesc"
            >
              <div className="modal-box">
                <h3 id="modalTitle">Confirm Deletion</h3>
                <p id="modalDesc">
                  Are you sure you want to delete <strong>{selectedHall.name}</strong>?
                </p>
                {deleteError && <p className="error-message">{deleteError}</p>}
                <div className="modal-buttons">
                  <button onClick={handleDelete} className="confirm-btn">Yes, Delete</button>
                  <button
                    onClick={() => {
                      setConfirmDeleteId(null)
                      setSelectedHall(null)
                      setDeleteError(null)
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
