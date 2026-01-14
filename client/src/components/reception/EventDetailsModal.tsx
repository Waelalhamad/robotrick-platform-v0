/**
 * EventDetailsModal Component
 *
 * Modal for viewing event details with edit and delete options
 */

import React, { useState } from 'react';
import { Modal, Button } from '../ui';
import { Calendar, Clock, User, Edit2, Trash2, Users } from 'lucide-react';
import moment from 'moment';

interface Participant {
  _id?: string;
  type: 'lead' | 'custom' | 'company';
  leadId?: any;
  customName?: string;
  customPhone?: string;
  companyRole?: string;
}

interface Event {
  _id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  color?: string;
  participants?: Participant[];
  createdBy?: any;
}

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onEdit: () => void;
  onDelete: () => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!event) return null;

  const formatDate = (date: Date) => {
    return moment(date).format('MMMM DD, YYYY');
  };

  const formatTime = (date: Date) => {
    return moment(date).format('h:mm A');
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      gray: 'bg-zinc-500',
    };
    return colorMap[color || 'blue'];
  };

  const getParticipantDisplay = (p: Participant) => {
    if (p.type === 'company') {
      return { name: p.companyRole || 'Unknown', subtitle: 'Company Internal' };
    }
    if (p.type === 'lead' && p.leadId) {
      return {
        name: p.leadId.fullName || 'Unknown',
        subtitle: p.leadId.mobileNumber || 'External Lead'
      };
    }
    return {
      name: p.customName || 'Unknown',
      subtitle: p.customPhone || 'Custom Participant'
    };
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setIsDeleting(true);
      try {
        await onDelete();
        onClose();
      } catch (error) {
        console.error('Error deleting event:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Event Details"
      size="md"
    >
      <div className="space-y-6">
        {/* Event Header */}
        <div className="flex items-start gap-4">
          <div className={`w-4 h-4 rounded-full ${getColorClass(event.color || 'blue')} mt-1 flex-shrink-0`} />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-zinc-900">{event.title}</h2>
            {event.description && (
              <p className="mt-2 text-zinc-600">{event.description}</p>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="space-y-3 bg-zinc-50 rounded-lg p-4 border border-zinc-200">
          <div className="flex items-center gap-3 text-zinc-700">
            <Calendar className="w-5 h-5 text-zinc-500" />
            <div>
              <p className="text-sm font-medium text-zinc-500">Date</p>
              <p className="font-medium">{formatDate(event.startTime)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-zinc-700">
            <Clock className="w-5 h-5 text-zinc-500" />
            <div>
              <p className="text-sm font-medium text-zinc-500">Time</p>
              <p className="font-medium">
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Participants */}
        {event.participants && event.participants.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-zinc-500" />
              <h3 className="font-semibold text-zinc-900">
                Participants ({event.participants.length})
              </h3>
            </div>

            <div className="space-y-2">
              {event.participants.map((participant, index) => {
                const display = getParticipantDisplay(participant);
                return (
                  <div
                    key={participant._id || index}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      participant.type === 'company'
                        ? 'bg-purple-50 border-purple-100'
                        : participant.type === 'lead'
                        ? 'bg-cyan-50 border-cyan-100'
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      participant.type === 'company'
                        ? 'bg-purple-100 text-purple-600'
                        : participant.type === 'lead'
                        ? 'bg-cyan-100 text-cyan-600'
                        : 'bg-zinc-200 text-zinc-600'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        participant.type === 'company'
                          ? 'text-purple-900'
                          : participant.type === 'lead'
                          ? 'text-cyan-900'
                          : 'text-zinc-900'
                      }`}>
                        {display.name}
                      </p>
                      <p className={`text-sm ${
                        participant.type === 'company'
                          ? 'text-purple-600'
                          : participant.type === 'lead'
                          ? 'text-cyan-600'
                          : 'text-zinc-500'
                      }`}>
                        {display.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-zinc-200">
          <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            {isDeleting ? 'Deleting...' : 'Delete Event'}
          </Button>
          <Button
            variant="primary"
            onClick={onEdit}
            className="flex-1"
            leftIcon={<Edit2 className="w-4 h-4" />}
          >
            Edit Event
          </Button>
        </div>
      </div>
    </Modal>
  );
};
