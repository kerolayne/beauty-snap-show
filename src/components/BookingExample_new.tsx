import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import type { Service, Professional, AvailabilitySlot } from '@/lib/api'
import { formatDateTime, formatTime } from '@/lib/formatters'

export function BookingExample() {
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availability, setAvailability] = useState<{ slots: AvailabilitySlot[] } | null>(null)
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

  const handleBookAppointment = async (slot: AvailabilitySlot) => {
    if (!selectedProfessional) return

    try {
      // Get current user from Firebase Auth
      const currentUser = apiClient.getCurrentUser()
      if (!currentUser) {
        throw new Error('Please sign in to book an appointment')
      }

      // Find a service offered by the selected professional
      const professional = professionals.find(p => p.id === selectedProfessional)
      if (!professional?.services?.length) {
        throw new Error('No service available for this professional')
      }
      const service = professional.services[0]

      const appointment = await apiClient.createAppointment({
        userId: currentUser.uid,
        professionalId: selectedProfessional,
        serviceId: service.id,
        status: 'PENDING',
        startsAt: { seconds: Math.floor(new Date(slot.startsAt).getTime() / 1000), nanoseconds: 0 },
        endsAt: { seconds: Math.floor(new Date(slot.endsAt).getTime() / 1000), nanoseconds: 0 },
        notes: '',
      })

      alert(`Appointment booked successfully!\n${new Date(appointment.startsAt.seconds * 1000).toLocaleDateString()}`)
      
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

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Professional</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
          >
            <option value="">Select a professional</option>
            {professionals.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        )}

        {availability && !loading && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Available Time Slots</h2>
            <div className="grid grid-cols-3 gap-4">
              {availability.slots.length > 0 ? (
                availability.slots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleBookAppointment(slot)}
                    disabled={!slot.available}
                    className={`px-4 py-2 rounded transition-colors ${
                      slot.available
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {new Date(slot.startsAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </button>
                ))
              ) : (
                <p className="col-span-3 text-gray-500 italic">
                  No available slots for this date
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}