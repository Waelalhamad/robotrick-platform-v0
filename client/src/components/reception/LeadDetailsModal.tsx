/**
 * LeadDetailsModal Component
 *
 * Displays comprehensive lead information in a modal
 */

import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui';
import { X, User, Phone, Mail, MapPin, School, Calendar, Users, MessageSquare, Clock, History, Plus } from 'lucide-react';
import type { Lead } from '../../hooks/useReceptionLeads';
import { useContactHistory } from '../../hooks/useContactHistory';
import { ContactHistoryList } from './ContactHistoryList';
import { ContactHistoryModal } from './ContactHistoryModal';

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  isOpen,
  onClose,
  lead
}) => {
  const [isContactHistoryModalOpen, setIsContactHistoryModalOpen] = useState(false);
  const { contactHistory, isLoading, fetchContactHistory, createContactHistory, deleteContactHistory } = useContactHistory();

  // Fetch contact history when modal opens
  useEffect(() => {
    if (isOpen && lead) {
      fetchContactHistory(lead._id);
    }
  }, [isOpen, lead, fetchContactHistory]);

  if (!lead) return null;

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      interest: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      student: 'bg-green-500/10 text-green-400 border-green-500/20',
      blacklist: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    return variants[status as keyof typeof variants] || variants.interest;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lead Details"
      size="xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header with Status */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">{lead.fullName}</h2>
            {lead.englishName && (
              <p className="text-white/60 mt-1">{lead.englishName}</p>
            )}
          </div>
          <div className={`px-4 py-2 rounded-lg border ${getStatusBadge(lead.status)}`}>
            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 rounded-lg p-4">
            {lead.firstName && (
              <div>
                <p className="text-white/60 text-sm">First Name</p>
                <p className="text-white">{lead.firstName}</p>
              </div>
            )}
            {lead.lastName && (
              <div>
                <p className="text-white/60 text-sm">Last Name</p>
                <p className="text-white">{lead.lastName}</p>
              </div>
            )}
            {lead.gender && (
              <div>
                <p className="text-white/60 text-sm">Gender</p>
                <p className="text-white capitalize">{lead.gender}</p>
              </div>
            )}
            {lead.dateOfBirth && (
              <div>
                <p className="text-white/60 text-sm">Date of Birth</p>
                <p className="text-white">{formatDate(lead.dateOfBirth)}</p>
              </div>
            )}
            {lead.age && (
              <div>
                <p className="text-white/60 text-sm">Age</p>
                <p className="text-white">{lead.age} years</p>
              </div>
            )}
            {lead.residence && (
              <div>
                <p className="text-white/60 text-sm">Residence</p>
                <p className="text-white">{lead.residence}</p>
              </div>
            )}
            {lead.schoolName && (
              <div>
                <p className="text-white/60 text-sm">School</p>
                <p className="text-white">{lead.schoolName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Family Information */}
        {(lead.fatherName || lead.motherName) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Family Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 rounded-lg p-4">
              {lead.fatherName && (
                <div>
                  <p className="text-white/60 text-sm">Father's Name</p>
                  <p className="text-white">{lead.fatherName}</p>
                </div>
              )}
              {lead.motherName && (
                <div>
                  <p className="text-white/60 text-sm">Mother's Name</p>
                  <p className="text-white">{lead.motherName}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Contact Information
          </h3>
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-white/60 text-sm">Primary Mobile</p>
              <p className="text-white">{lead.mobileNumber} {lead.mobileNumberLabel && `(${lead.mobileNumberLabel})`}</p>
            </div>
            {lead.additionalNumbers && lead.additionalNumbers.length > 0 && (
              <div>
                <p className="text-white/60 text-sm mb-2">Additional Numbers</p>
                {lead.additionalNumbers.map((num, idx) => (
                  <p key={idx} className="text-white">
                    {num.number} {num.label && `(${num.label})`}
                  </p>
                ))}
              </div>
            )}
            {lead.socialMedia && lead.socialMedia.length > 0 && (
              <div>
                <p className="text-white/60 text-sm mb-2">Social Media</p>
                {lead.socialMedia.map((social, idx) => (
                  <p key={idx} className="text-white">
                    {social.platform}: {social.handle}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interest & Referral */}
        {(lead.interestField || lead.referralSource) && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Interest & Referral
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 rounded-lg p-4">
              {lead.interestField && (
                <div>
                  <p className="text-white/60 text-sm">Interest Field</p>
                  <p className="text-white">{lead.interestField}</p>
                </div>
              )}
              {lead.referralSource && (
                <div>
                  <p className="text-white/60 text-sm">Referral Source</p>
                  <p className="text-white">{lead.referralSource}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {lead.notes && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Notes
            </h3>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-white whitespace-pre-wrap">{lead.notes}</p>
            </div>
          </div>
        )}

        {/* Blacklist Information */}
        {lead.status === 'blacklist' && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
              <X className="w-5 h-5" />
              Blacklist Information
            </h3>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-2">
              {lead.isBannedFromPlatform && (
                <div className="flex items-center gap-2 text-red-400">
                  <X className="w-4 h-4" />
                  <span className="font-semibold">Banned from Platform</span>
                </div>
              )}
              {lead.blacklistReason && (
                <div>
                  <p className="text-red-400/60 text-sm">Reason</p>
                  <p className="text-red-400">{lead.blacklistReason}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status History */}
        {lead.statusHistory && lead.statusHistory.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Status History
            </h3>
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              {lead.statusHistory.map((history, idx) => (
                <div key={idx} className="border-l-2 border-primary/50 pl-4 pb-3 last:pb-0">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Clock className="w-4 h-4" />
                    {formatDateTime(history.changedAt)}
                  </div>
                  <p className="text-white mt-1">
                    {history.fromStatus ? (
                      <>
                        <span className="capitalize">{history.fromStatus}</span>
                        {' → '}
                        <span className="capitalize">{history.toStatus}</span>
                      </>
                    ) : (
                      <span className="capitalize">Set to {history.toStatus}</span>
                    )}
                  </p>
                  <p className="text-white/60 text-sm mt-1">Reason: {history.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Contact History
            </h3>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsContactHistoryModalOpen(true)}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Add Contact
            </Button>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <ContactHistoryList
              contactHistory={contactHistory}
              onDelete={deleteContactHistory}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Record Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 rounded-lg p-4">
            <div>
              <p className="text-white/60 text-sm">Created At</p>
              <p className="text-white">{formatDateTime(lead.createdAt)}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Last Updated</p>
              <p className="text-white">{formatDateTime(lead.updatedAt)}</p>
            </div>
            {lead.convertedAt && (
              <div>
                <p className="text-white/60 text-sm">Converted At</p>
                <p className="text-white">{formatDateTime(lead.convertedAt)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact History Modal */}
      <ContactHistoryModal
        isOpen={isContactHistoryModalOpen}
        onClose={() => setIsContactHistoryModalOpen(false)}
        leadId={lead._id}
        leadName={lead.fullName}
        onSubmit={async (data) => {
          await createContactHistory(lead._id, data);
          setIsContactHistoryModalOpen(false);
        }}
      />
    </Modal>
  );
};
