/**
 * CLO Evaluation Criteria Management Page
 *
 * Allows CLO to create and manage dynamic evaluation parameters
 * Can be applied to entire courses or specific groups
 *
 * @page CLOEvaluationCriteria
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  BookOpen,
  Users,
  Star,
  BarChart3,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  Button,
  Badge,
  LoadingState,
  Alert,
  CardComponent,
  CardBody
} from '../components/ui';
import EvaluationCriteriaForm from '../components/clo/EvaluationCriteriaForm';
import { api } from '../lib/api';

interface EvaluationCriteria {
  _id: string;
  name: string;
  description?: string;
  appliesTo: 'course' | 'groups';
  courseId: {
    _id: string;
    title: string;
    category?: string;
  };
  groupIds?: Array<{
    _id: string;
    name: string;
  }>;
  parameters: Array<{
    name: string;
    description?: string;
    type: 'rating' | 'percentage' | 'grade' | 'boolean' | 'text';
    ratingScale?: {
      min: number;
      max: number;
      labels?: Map<string, string>;
    };
    weight: number;
    required: boolean;
    order: number;
  }>;
  includeOverallRating: boolean;
  overallRatingScale?: {
    min: number;
    max: number;
  };
  includeComments: boolean;
  requireComments: boolean;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export default function CLOEvaluationCriteria() {
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCriteria, setExpandedCriteria] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCriteriaId, setEditingCriteriaId] = useState<string | null>(null);

  useEffect(() => {
    fetchCriteria();
  }, []);

  const fetchCriteria = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Only fetch active criteria
      const response = await api.get('/clo/evaluation-criteria', { params: { status: 'active' } });
      setCriteria(response.data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch evaluation criteria');
      console.error('Error fetching criteria:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCriteria = async (id: string) => {
    if (!confirm('Are you sure you want to delete this evaluation criteria? This action cannot be undone.')) return;

    try {
      await api.delete(`/clo/evaluation-criteria/${id}`);
      fetchCriteria();
    } catch (err: any) {
      alert(err.message || 'Failed to delete criteria');
    }
  };

  const filteredCriteria = criteria.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.courseId.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedCriteria(expandedCriteria === id ? null : id);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rating': return <Star className="w-4 h-4" />;
      case 'percentage': return <BarChart3 className="w-4 h-4" />;
      case 'grade': return <FileText className="w-4 h-4" />;
      case 'boolean': return <CheckCircle className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'archived': return 'error';
      default: return 'primary';
    }
  };

  if (isLoading && criteria.length === 0) {
    return <LoadingState type="skeleton" text="Loading evaluation criteria..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Evaluation Criteria</h1>
          <p className="text-white/60 mt-2">
            Create and manage dynamic evaluation parameters for courses and groups
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => setShowCreateModal(true)}
        >
          Create Criteria
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Failed to load criteria</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchCriteria}
            >
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Search by name or course..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Criteria List */}
      {filteredCriteria.length === 0 ? (
        <CardComponent variant="glass">
          <CardBody className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Settings className="w-10 h-10 text-white/40" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Evaluation Criteria Found</h3>
            <p className="text-white/60 mb-6">
              {searchTerm
                ? 'No criteria match your search'
                : 'Get started by creating your first evaluation criteria'}
            </p>
            {!searchTerm && (
              <Button
                variant="primary"
                leftIcon={<Plus className="w-5 h-5" />}
                onClick={() => setShowCreateModal(true)}
              >
                Create Criteria
              </Button>
            )}
          </CardBody>
        </CardComponent>
      ) : (
        <div className="space-y-4">
          {filteredCriteria.map((criteriaItem) => (
            <CardComponent key={criteriaItem._id} variant="glass" hover>
              <CardBody>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{criteriaItem.name}</h3>
                      <Badge variant={getStatusColor(criteriaItem.status) as any}>
                        {criteriaItem.status}
                      </Badge>
                      <Badge variant="secondary" size="sm">
                        {criteriaItem.appliesTo === 'course' ? (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span>Course-wide</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{criteriaItem.groupIds?.length || 0} Groups</span>
                          </div>
                        )}
                      </Badge>
                    </div>
                    {criteriaItem.description && (
                      <p className="text-white/60 text-sm">{criteriaItem.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Edit className="w-4 h-4" />}
                      onClick={() => setEditingCriteriaId(criteriaItem._id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleDeleteCriteria(criteriaItem._id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Course Info */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-sm text-white/80">{criteriaItem.courseId.title}</span>
                  </div>
                  {criteriaItem.courseId.category && (
                    <Badge variant="outline" size="sm">
                      {criteriaItem.courseId.category}
                    </Badge>
                  )}
                </div>

                {/* Parameters Summary */}
                <button
                  onClick={() => toggleExpand(criteriaItem._id)}
                  className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedCriteria === criteriaItem._id ? (
                      <ChevronDown className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-white/60" />
                    )}
                    <span className="font-semibold text-white">
                      {criteriaItem.parameters.length} Evaluation Parameters
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    {criteriaItem.includeOverallRating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>Overall Rating</span>
                      </div>
                    )}
                    {criteriaItem.includeComments && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span>Comments {criteriaItem.requireComments && '(Required)'}</span>
                      </div>
                    )}
                  </div>
                </button>

                {/* Expanded Parameters */}
                <AnimatePresence>
                  {expandedCriteria === criteriaItem._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3">
                        {criteriaItem.parameters
                          .sort((a, b) => a.order - b.order)
                          .map((param, index) => (
                            <div
                              key={index}
                              className="p-4 bg-white/5 rounded-lg border border-white/10"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getTypeIcon(param.type)}
                                    <h4 className="font-semibold text-white">{param.name}</h4>
                                    {param.required && (
                                      <Badge variant="error" size="sm">Required</Badge>
                                    )}
                                  </div>
                                  {param.description && (
                                    <p className="text-sm text-white/60">{param.description}</p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <Badge variant="primary" size="sm">
                                    {param.type}
                                  </Badge>
                                  {param.weight > 0 && (
                                    <span className="text-xs text-white/60">
                                      Weight: {param.weight}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              {param.type === 'rating' && param.ratingScale && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                                  <span>Scale: {param.ratingScale.min} - {param.ratingScale.max}</span>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardBody>
            </CardComponent>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingCriteriaId) && (
          <EvaluationCriteriaForm
            criteriaId={editingCriteriaId || undefined}
            onClose={() => {
              setShowCreateModal(false);
              setEditingCriteriaId(null);
            }}
            onSuccess={() => {
              fetchCriteria();
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
