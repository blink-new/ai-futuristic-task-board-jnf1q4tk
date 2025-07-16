import { motion } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Plus, MoreVertical } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { Column, Task } from '../types'
import { cn } from '../lib/utils'

interface TaskColumnProps {
  column: Column
  tasks: Task[]
  onAddTask?: (columnId: string) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
}

const statusGlowClasses = {
  '#6366f1': 'status-glow-todo',
  '#f59e0b': 'status-glow-progress', 
  '#8b5cf6': 'status-glow-review',
  '#22c55e': 'status-glow-done'
}

export function TaskColumn({ column, tasks, onAddTask, onEditTask, onDeleteTask }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const glowClass = statusGlowClasses[column.color as keyof typeof statusGlowClasses] || ''

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full min-w-80"
    >
      <Card className={cn(
        'flex-1 p-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg transition-all duration-300',
        isOver && 'ring-2 ring-primary/50 shadow-2xl',
        glowClass
      )}>
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h2 className="font-semibold text-gray-900">{column.name}</h2>
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onAddTask?.(column.id)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tasks Container */}
        <div
          ref={setNodeRef}
          className="flex-1 space-y-3 min-h-32"
        >
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <div key={task.id} className="group">
                <TaskCard
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              </div>
            ))}
          </SortableContext>

          {/* Empty State */}
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-gray-400"
            >
              <div 
                className="w-12 h-12 rounded-full mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${column.color}20` }}
              >
                <Plus className="w-6 h-6" style={{ color: column.color }} />
              </div>
              <p className="text-sm">No tasks yet</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => onAddTask?.(column.id)}
              >
                Add first task
              </Button>
            </motion.div>
          )}
        </div>

        {/* Add Task Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4"
        >
          <Button
            variant="outline"
            className="w-full border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
            onClick={() => onAddTask?.(column.id)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add task
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  )
}