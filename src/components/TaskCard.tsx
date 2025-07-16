import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { MoreHorizontal, Sparkles, Clock, AlertCircle } from 'lucide-react'
import { Task } from '../types'
import { cn } from '../lib/utils'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
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

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const PriorityIcon = priorityIcons[task.priority]

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger edit if not dragging and not clicking on action buttons
    if (!isDragging && !(e.target as HTMLElement).closest('button')) {
      onEdit?.(task)
    }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'cursor-grab active:cursor-grabbing group',
        isDragging && 'opacity-50 rotate-3'
      )}
      onClick={handleCardClick}
    >
      <Card className="task-card-glow p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {task.aiGenerated && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                  AI
                </Badge>
              </motion.div>
            )}
            <Badge 
              className={cn(
                'text-xs border',
                priorityColors[task.priority]
              )}
            >
              <PriorityIcon className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              // Handle menu actions
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {task.title}
        </h3>

        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 3).map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Badge 
                  variant="outline" 
                  className="text-xs bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200"
                >
                  {tag}
                </Badge>
              </motion.div>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Active</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}