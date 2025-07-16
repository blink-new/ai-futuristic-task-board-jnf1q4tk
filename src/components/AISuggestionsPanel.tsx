import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Users, 
  Target,
  CheckCircle,
  X,
  RefreshCw,
  Lightbulb,
  Zap,
  Brain
} from 'lucide-react'
import { cn } from '../lib/utils'

interface AISuggestion {
  id: string
  type: 'workflow' | 'task' | 'optimization' | 'collaboration'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  action: string
  implemented?: boolean
}

interface AISuggestionsPanelProps {
  isOpen: boolean
  onClose: () => void
  onImplement: (suggestion: AISuggestion) => void
  onRefresh: () => void
}

const mockSuggestions: AISuggestion[] = [
  {
    id: 'sug-1',
    type: 'workflow',
    title: 'Optimize Sprint Planning',
    description: 'Based on your team\'s velocity, consider breaking down large tasks into smaller, more manageable pieces. This could improve completion rates by 23%.',
    confidence: 0.87,
    impact: 'high',
    action: 'Break down 3 large tasks automatically'
  },
  {
    id: 'sug-2',
    type: 'task',
    title: 'Add QA Testing Tasks',
    description: 'I noticed several development tasks without corresponding QA tasks. Adding these could prevent bugs from reaching production.',
    confidence: 0.92,
    impact: 'medium',
    action: 'Generate QA tasks for 4 development items'
  },
  {
    id: 'sug-3',
    type: 'optimization',
    title: 'Rebalance Workload',
    description: 'The "In Progress" column has 60% more tasks than optimal. Consider moving some items back to "To Do" or creating a new status.',
    confidence: 0.78,
    impact: 'medium',
    action: 'Redistribute 2 tasks to balance columns'
  },
  {
    id: 'sug-4',
    type: 'collaboration',
    title: 'Schedule Team Sync',
    description: 'High-priority tasks have been in "Review" for 3+ days. A quick team sync could unblock these items.',
    confidence: 0.85,
    impact: 'high',
    action: 'Create calendar event and notify team'
  }
]

const typeIcons = {
  workflow: TrendingUp,
  task: Target,
  optimization: Zap,
  collaboration: Users
}

const typeColors = {
  workflow: 'bg-blue-100 text-blue-800 border-blue-200',
  task: 'bg-green-100 text-green-800 border-green-200',
  optimization: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  collaboration: 'bg-purple-100 text-purple-800 border-purple-200'
}

const impactColors = {
  low: 'text-gray-600',
  medium: 'text-yellow-600',
  high: 'text-red-600'
}

export function AISuggestionsPanel({ isOpen, onClose, onImplement, onRefresh }: AISuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(mockSuggestions)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleImplement = (suggestion: AISuggestion) => {
    setSuggestions(prev => 
      prev.map(s => 
        s.id === suggestion.id 
          ? { ...s, implemented: true }
          : s
      )
    )
    onImplement(suggestion)
  }

  const handleDismiss = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  const activeSuggestions = suggestions.filter(s => !s.implemented)
  const implementedSuggestions = suggestions.filter(s => s.implemented)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-6 h-6 text-indigo-500" />
                      <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
                    </div>
                    <Badge variant="secondary" className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Smart Suggestions
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: isRefreshing ? 360 : 0 }}
                        transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </motion.div>
                      Refresh
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span>{activeSuggestions.length} active suggestions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{implementedSuggestions.length} implemented</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {activeSuggestions.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No new suggestions at the moment. Check back later for AI insights.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeSuggestions.map((suggestion, index) => {
                      const TypeIcon = typeIcons[suggestion.type]
                      return (
                        <motion.div
                          key={suggestion.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <TypeIcon className="w-5 h-5 text-indigo-500" />
                                  <h3 className="font-medium text-gray-900">{suggestion.title}</h3>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={cn('text-xs', typeColors[suggestion.type])}
                                >
                                  {suggestion.type}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-xs">
                                  <span className={impactColors[suggestion.impact]}>
                                    {suggestion.impact} impact
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {Math.round(suggestion.confidence * 100)}% confidence
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4">
                              {suggestion.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-indigo-600">
                                <Zap className="w-4 h-4" />
                                <span>{suggestion.action}</span>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDismiss(suggestion.id)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  Dismiss
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleImplement(suggestion)}
                                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                >
                                  Implement
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                {/* Implemented Suggestions */}
                {implementedSuggestions.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Recently Implemented
                    </h3>
                    <div className="space-y-2">
                      {implementedSuggestions.slice(0, 3).map((suggestion) => {
                        const TypeIcon = typeIcons[suggestion.type]
                        return (
                          <div
                            key={suggestion.id}
                            className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <TypeIcon className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-800 font-medium">
                              {suggestion.title}
                            </span>
                            <Badge variant="outline" className="ml-auto text-xs bg-green-100 text-green-700 border-green-300">
                              Completed
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}