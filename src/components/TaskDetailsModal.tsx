import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  X, 
  Save, 
  Trash2, 
  Plus, 
  Sparkles,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Tag
} from 'lucide-react'
import { Task } from '../types'
import { cn } from '../lib/utils'

interface TaskDetailsModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  onDelete: (taskId: string) => void
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200'
}

const priorityIcons = {
  low: Clock,
  medium: AlertCircle,
  high: AlertCircle
}

export function TaskDetailsModal({ task, isOpen, onClose, onSave, onDelete }: TaskDetailsModalProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(null)
  const [newTag, setNewTag] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task })
    }
  }, [task])

  if (!task || !editedTask) return null

  const handleSave = () => {
    if (editedTask) {
      onSave({
        ...editedTask,
        updatedAt: new Date().toISOString()
      })
      onClose()
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id)
      onClose()
    }
  }

  const addTag = () => {
    if (newTag.trim() && !editedTask.tags.includes(newTag.trim())) {
      setEditedTask({
        ...editedTask,
        tags: [...editedTask.tags, newTag.trim()]
      })
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEditedTask({
      ...editedTask,
      tags: editedTask.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const generateAIDescription = async () => {
    setIsGeneratingAI(true)
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const aiDescription = `Based on the task "${editedTask.title}", here are some suggested details:

• Break down the task into smaller, actionable steps
• Consider dependencies and prerequisites
• Estimate time required: 2-4 hours
• Identify potential blockers or challenges
• Define clear acceptance criteria

This task appears to be ${editedTask.priority} priority and should be completed within the current sprint cycle.`

      setEditedTask({
        ...editedTask,
        description: aiDescription,
        aiGenerated: true
      })
    } catch (error) {
      console.error('AI generation failed:', error)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const PriorityIcon = priorityIcons[editedTask.priority]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {editedTask.aiGenerated && (
                <Sparkles className="w-5 h-5 text-purple-500" />
              )}
              <span>Task Details</span>
            </div>
            <Badge 
              className={cn(
                'text-xs border ml-auto',
                priorityColors[editedTask.priority]
              )}
            >
              <PriorityIcon className="w-3 h-3 mr-1" />
              {editedTask.priority}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <Input
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              placeholder="Enter task title..."
              className="text-lg font-medium"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <Select
              value={editedTask.priority}
              onValueChange={(value: 'low' | 'medium' | 'high') => 
                setEditedTask({ ...editedTask, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Low Priority
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    Medium Priority
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    High Priority
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Button
                variant="outline"
                size="sm"
                onClick={generateAIDescription}
                disabled={isGeneratingAI}
                className="text-xs"
              >
                {isGeneratingAI ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                  </motion.div>
                ) : (
                  <Sparkles className="w-3 h-3 mr-1" />
                )}
                AI Enhance
              </Button>
            </div>
            <Textarea
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              placeholder="Enter task description..."
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            
            {/* Existing Tags */}
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {editedTask.tags.map((tag) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1"
                  >
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add New Tag */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} size="sm" disabled={!newTag.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                Created
              </div>
              <p className="text-sm font-medium">
                {new Date(editedTask.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                Last Updated
              </div>
              <p className="text-sm font-medium">
                {new Date(editedTask.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Task
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}