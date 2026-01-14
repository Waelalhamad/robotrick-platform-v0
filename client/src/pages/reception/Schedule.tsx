/**
 * Schedule Page
 *
 * Reception schedule management using react-big-calendar
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion } from 'framer-motion';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, LoadingState, Alert } from '../../components/ui';
import { EventModal } from '../../components/reception/EventModal';
import { EventDetailsModal } from '../../components/reception/EventDetailsModal';
import { api } from '../../lib/api';

// Setup localizer
const localizer = momentLocalizer(moment);

interface Event {
  _id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  color?: string;
  participants?: any[];
  createdBy?: any;
}

const Schedule: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [view, setView] = useState(Views.WEEK);
  const [date, setDate] = useState(new Date());

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch events for a broad range (e.g., current month +/- 1 month) or just all for now
      // Ideally we'd fetch based on the current view date range
      const response = await api.get('/reception/events');
      
      const formattedEvents = response.data.events.map((event: any) => ({
        ...event,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
      }));
      
      setEvents(formattedEvents);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError('Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle slot selection (create new event)
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent(null);
    setSelectedDate(start);
    setIsModalOpen(true);
  };

  // Handle event selection (show details)
  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  // Handle edit from details modal
  const handleEditFromDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedDate(undefined);
    setIsModalOpen(true);
  };

  // Handle delete from details modal
  const handleDeleteFromDetails = async () => {
    if (selectedEvent) {
      await handleDelete(selectedEvent._id);
      setIsDetailsModalOpen(false);
      setSelectedEvent(null);
    }
  };

  // Handle modal submit
  const handleModalSubmit = async (data: any) => {
    try {
      if (selectedEvent) {
        // Update
        await api.put(`/reception/events/${selectedEvent._id}`, data);
      } else {
        // Create
        await api.post('/reception/events', data);
      }
      await fetchEvents();
      setIsModalOpen(false);
    } catch (err) {
      throw err; // Let modal handle error display
    }
  };

  // Handle event deletion
  const handleDelete = async (eventId: string) => {
    try {
      await api.delete(`/reception/events/${eventId}`);
      await fetchEvents();
    } catch (err) {
      throw err; // Let modal handle error display
    }
  };

  // Custom event styling
  const eventStyleGetter = (event: Event) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      green: '#22c55e',
      red: '#ef4444',
      yellow: '#eab308',
      purple: '#a855f7',
      gray: '#71717a',
    };

    const backgroundColor = colorMap[event.color || 'blue'];

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    };
  };

  // Custom toolbar
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
    };

    const label = () => {
      const date = moment(toolbar.date);
      return (
        <span className="text-xl font-bold text-zinc-800">
          {date.format('MMMM YYYY')}
        </span>
      );
    };

    return (
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={goToBack}
              className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={goToCurrent}
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
          >
            Today
          </button>
          {label()}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-100 p-1 rounded-lg">
            {['month', 'week', 'day'].map((viewName) => (
              <button
                key={viewName}
                onClick={() => toolbar.onView(viewName)}
                className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-all ${
                  toolbar.view === viewName
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {viewName}
              </button>
            ))}
          </div>
          
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSelectedEvent(null);
              setSelectedDate(new Date());
              setIsModalOpen(true);
            }}
          >
            New Event
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading && !events.length) {
    return <LoadingState message="Loading schedule..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Schedule</h1>
          <p className="mt-1 text-zinc-500">Manage meetings and events</p>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 h-[calc(100vh-200px)]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
          }}
          view={view}
          onView={(newView) => setView(newView)}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          min={new Date(0, 0, 0, 10, 0, 0)} // 10:00 AM
          max={new Date(0, 0, 0, 19, 0, 0)} // 7:00 PM
          defaultView={Views.WEEK}
          views={['month', 'week', 'day']}
          step={30}
          timeslots={2}
        />
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
      />

      {/* Event Edit Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        selectedDate={selectedDate}
        onSubmit={handleModalSubmit}
        onDelete={handleDelete}
      />
    </motion.div>
  );
};

export default Schedule;
