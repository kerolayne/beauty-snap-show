import React, { useState, useEffect } from 'react'
import { apiClient, Service, Professional, Availability } from '@/lib/api'
import { formatDateTime, formatTime } from '@/lib/api'

export function BookingExample() {
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Load services and professionals on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesData, professionalsData] = await Promise.all([
          apiClient.getServices(),
          apiClient.getProfessionals(),
        ])
        setServices(servicesData)
        setProfessionals(professionalsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      }
    }

    loadData()
  }, [])

  // Load availability when professional and date are selected
  useEffect(() => {
    if (selectedProfessional && selectedDate) {
      const loadAvailability = async () => {
        setLoading(true)
        setError('')
        try {
          const availabilityData = await apiClient.getAvailability(
            selectedProfessional,
            selectedDate
          )
          setAvailability(availabilityData)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load availability')
        } finally {
          setLoading(false)
        }
      }

      loadAvailability()
    }
  }, [selectedProfessional, selectedDate])

  const handleBookAppointment = async (slot: any) => {
    if (!selectedProfessional) return

    try {
      // For demo purposes, using a hardcoded user ID
      // In a real app, this would come from authentication
      const userId = 'demo-user-id'
      
      // Find a service offered by the selected professional
      const professional = professionals.find(p => p.id === selectedProfessional)
      const service = professional?.services[0]
      
      if (!service) {
        throw new Error('No service available for this professional')
      }

      const appointment = await apiClient.createAppointment({
        userId,
        professionalId: selectedProfessional,
        serviceId: service.id,
        startsAtISO: slot.startsAt,
      })

      alert(`Appointment booked successfully!\n${formatDateTime(new Date(appointment.startsAt))}`)
      
      // Refresh availability
      if (selectedDate) {
        const availabilityData = await apiClient.getAvailability(
          selectedProfessional,
          selectedDate
        )
        setAvailability(availabilityData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Beauty Services Booking</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Services */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Available Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.id} className="border rounded-lg p-4">
              <h3 className="font-medium">{service.name}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
              <p className="text-sm">
                {service.durationMinutes} min • €{(service.priceCents / 100).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Professionals */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Select Professional</h2>
        <select
          value={selectedProfessional}
          onChange={(e) => setSelectedProfessional(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Choose a professional...</option>
          {professionals.map((professional) => (
            <option key={professional.id} value={professional.id}>
              {professional.name} - {professional.services.length} services
            </option>
          ))}
        </select>
      </div>

      {/* Date Selection */}
      {selectedProfessional && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Select Date</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {/* Availability */}
      {selectedProfessional && selectedDate && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Available Time Slots</h2>
          {loading ? (
            <p>Loading availability...</p>
          ) : availability ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Available slots for {availability.professional.name} on{' '}
                {new Date(availability.date).toLocaleDateString('pt-PT')}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {availability.slots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleBookAppointment(slot)}
                    className="p-2 border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {formatTime(new Date(slot.startsAt))}
                  </button>
                ))}
              </div>
              {availability.slots.length === 0 && (
                <p className="text-gray-500">No available slots for this date.</p>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
