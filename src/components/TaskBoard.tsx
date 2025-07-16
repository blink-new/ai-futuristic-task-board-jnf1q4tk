import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { TaskColumn } from './TaskColumn'
import { TaskCard } from './TaskCard'
import { AICommandBar } from './AICommandBar'
import { TaskDetailsModal } from './TaskDetailsModal'
import { AISuggestionsPanel } from './AISuggestionsPanel'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { 
  Plus, 
  Settings, 
  Users, 
  Sparkles,
  Brain,
  Zap,
  TrendingUp
} from 'lucide-react'
import { Task, Column } from '../types'
import { cn } from '../lib/utils'
import blink from '../blink/client'
import { toast } from 'sonner'
import { initializeDatabase, createMockData } from '../utils/initDatabase'

export function TaskBoard() {
  const [columns, setColumns] = useState<Column[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isAIProcessing, setIsAIProcessing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isAISuggestionsOpen, setIsAISuggestionsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [boardId] = useState('board-1') // Default board for now

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const loadData = useCallback(async (userId: string) => {
    try {
      // Check if database is available
      const dbAvailable = await initializeDatabase()
      
      if (dbAvailable) {
        // Database is available - try to load data
        try {
          // Load or create columns
          let userColumns = await blink.db.columns.list({
            where: { userId, boardId },
            orderBy: { position: 'asc' }
          })

          if (userColumns.length === 0) {
            // Create default columns for new user
            const mockData = createMockData(userId, boardId)
            
            // Try to create columns in database
            try {
              await blink.db.columns.createMany(mockData.columns.map(col => ({
                ...col,
                tags: JSON.stringify([])
              })))
              userColumns = mockData.columns
            } catch (createError) {
              console.warn('Failed to create columns in database, using mock data:', createError)
              userColumns = mockData.columns
              setIsDemoMode(true)
            }
          }

          setColumns(userColumns)

          // Load tasks
          let userTasks = []
          try {
            userTasks = await blink.db.tasks.list({
              where: { userId, boardId },
              orderBy: { position: 'asc' }
            })

            // Parse tags from JSON string
            const tasksWithParsedTags = userTasks.map(task => ({
              ...task,
              tags: typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags,
              aiGenerated: Number(task.aiGenerated) > 0
            }))

            setTasks(tasksWithParsedTags)
          } catch (taskError) {
            console.warn('Failed to load tasks from database, using mock data:', taskError)
            const mockData = createMockData(userId, boardId)
            setTasks(mockData.tasks)
            setIsDemoMode(true)
          }

          // Demo mode notification will be shown by the fallback logic if needed
        } catch (dbError) {
          console.warn('Database operations failed, using local data:', dbError)
          // Fallback to local mock data
          const mockData = createMockData(userId, boardId)
          setColumns(mockData.columns)
          setTasks(mockData.tasks)
          setIsDemoMode(true)
          toast.info('Running in demo mode - data will not persist')
        }
      } else {
        // Database not available - use local mock data
        console.log('Database not available, using demo mode')
        const mockData = createMockData(userId, boardId)
        setColumns(mockData.columns)
        setTasks(mockData.tasks)
        setIsDemoMode(true)
        toast.info('Running in demo mode - data will not persist')
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      // Final fallback to local mock data
      const mockData = createMockData(userId, boardId)
      setColumns(mockData.columns)
      setTasks(mockData.tasks)
      setIsDemoMode(true)
      toast.warning('Running in demo mode - data will not persist')
    }
  }, [boardId])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      setUser(state.user)
      if (state.user) {
        await loadData(state.user.id)
      }
      setIsLoading(false)
    })
    return unsubscribe
  }, [loadData])

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    const overId = over.id as string
    const overColumn = columns.find(c => c.id === overId)
    
    if (overColumn && activeTask.columnId !== overId) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === active.id 
            ? { ...task, columnId: overId }
            : task
        )
      )
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    const overId = over.id as string
    const overColumn = columns.find(c => c.id === overId)
    const overTask = tasks.find(t => t.id === overId)

    try {
      if (overColumn) {
        // Dropped on a column
        const columnTasks = tasks.filter(t => t.columnId === overColumn.id)
        const newPosition = columnTasks.length

        const updatedTask = {
          ...activeTask,
          columnId: overColumn.id,
          position: newPosition,
          updatedAt: new Date().toISOString()
        }

        // Update in database (if not in demo mode)
        if (!isDemoMode) {
          try {
            await blink.db.tasks.update(activeTask.id, {
              columnId: overColumn.id,
              position: newPosition,
              updatedAt: new Date().toISOString()
            })
          } catch (error) {
            console.warn('Database update failed, continuing in demo mode:', error)
          }
        }

        // Update local state
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === active.id ? updatedTask : task
          )
        )
      } else if (overTask && activeTask.columnId === overTask.columnId) {
        // Reordering within the same column
        const columnTasks = tasks.filter(t => t.columnId === activeTask.columnId)
        const oldIndex = columnTasks.findIndex(t => t.id === active.id)
        const newIndex = columnTasks.findIndex(t => t.id === over.id)

        const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex)
        
        // Update positions in database (if not in demo mode)
        if (!isDemoMode) {
          try {
            const updatePromises = reorderedTasks.map((task, index) =>
              blink.db.tasks.update(task.id, {
                position: index,
                updatedAt: new Date().toISOString()
              })
            )

            await Promise.all(updatePromises)
          } catch (error) {
            console.warn('Database update failed, continuing in demo mode:', error)
          }
        }
        
        // Update local state
        setTasks(prevTasks => {
          const otherTasks = prevTasks.filter(t => t.columnId !== activeTask.columnId)
          const updatedTasks = reorderedTasks.map((task, index) => ({
            ...task,
            position: index,
            updatedAt: new Date().toISOString()
          }))
          return [...otherTasks, ...updatedTasks]
        })
      }
    } catch (error) {
      console.error('Failed to update task position:', error)
      toast.error('Failed to move task')
    }
  }

  const handleAICommand = async (command: string) => {
    if (!user) return
    
    setIsAIProcessing(true)
    
    try {
      // Use AI to generate task details based on command
      const { text } = await blink.ai.generateText({
        prompt: `Based on this command: "${command}", generate a task with title and description. 
        Context: This is for a project management board with columns: ${columns.map(c => c.name).join(', ')}.
        Current tasks: ${tasks.map(t => t.title).join(', ')}.
        
        Respond with JSON format: {"title": "...", "description": "...", "priority": "low|medium|high", "tags": ["tag1", "tag2"]}`,
        model: 'gpt-4o-mini'
      })

      let taskData
      try {
        taskData = JSON.parse(text)
      } catch {
        // Fallback if AI doesn't return valid JSON
        taskData = {
          title: command.length > 50 ? command.substring(0, 50) + '...' : command,
          description: 'This task was created by AI based on your natural language command.',
          priority: 'medium',
          tags: ['ai-generated']
        }
      }

      // Find the first column (usually "To Do")
      const firstColumn = columns.find(c => c.position === 0) || columns[0]
      if (!firstColumn) {
        toast.error('No columns available')
        return
      }

      const columnTasks = tasks.filter(t => t.columnId === firstColumn.id)
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title,
        description: taskData.description,
        columnId: firstColumn.id,
        boardId,
        position: columnTasks.length,
        priority: taskData.priority || 'medium',
        tags: taskData.tags || ['ai-generated'],
        aiGenerated: true,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save to database (if not in demo mode)
      if (!isDemoMode) {
        try {
          await blink.db.tasks.create({
            ...newTask,
            tags: JSON.stringify(newTask.tags),
            aiGenerated: 1 // SQLite boolean as integer
          })
        } catch (error) {
          console.warn('Database save failed, continuing in demo mode:', error)
        }
      }
      
      // Update local state
      setTasks(prev => [...prev, newTask])
      toast.success('AI task created successfully!')
      
    } catch (error) {
      console.error('AI command failed:', error)
      toast.error('Failed to create AI task')
    } finally {
      setIsAIProcessing(false)
    }
  }

  const handleAddTask = async (columnId: string) => {
    if (!user) return

    try {
      const columnTasks = tasks.filter(t => t.columnId === columnId)
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: 'New Task',
        description: 'Click to edit this task',
        columnId,
        boardId,
        position: columnTasks.length,
        priority: 'medium',
        tags: [],
        aiGenerated: false,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save to database (if not in demo mode)
      if (!isDemoMode) {
        try {
          await blink.db.tasks.create({
            ...newTask,
            tags: JSON.stringify(newTask.tags),
            aiGenerated: 0 // SQLite boolean as integer
          })
        } catch (error) {
          console.warn('Database save failed, continuing in demo mode:', error)
        }
      }
      
      // Update local state
      setTasks(prev => [...prev, newTask])
      
      // Auto-open the task for editing
      setSelectedTask(newTask)
      setIsTaskModalOpen(true)
      
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    }
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }

  const handleSaveTask = async (updatedTask: Task) => {
    try {
      // Update in database (if not in demo mode)
      if (!isDemoMode) {
        try {
          await blink.db.tasks.update(updatedTask.id, {
            title: updatedTask.title,
            description: updatedTask.description,
            priority: updatedTask.priority,
            tags: JSON.stringify(updatedTask.tags),
            updatedAt: new Date().toISOString()
          })
        } catch (error) {
          console.warn('Database update failed, continuing in demo mode:', error)
        }
      }
      
      // Update local state
      setTasks(prev => 
        prev.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      )
      
      toast.success('Task updated successfully!')
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Delete from database (if not in demo mode)
      if (!isDemoMode) {
        try {
          await blink.db.tasks.delete(taskId)
        } catch (error) {
          console.warn('Database delete failed, continuing in demo mode:', error)
        }
      }
      
      // Update local state
      setTasks(prev => prev.filter(task => task.id !== taskId))
      
      toast.success('Task deleted successfully!')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleImplementSuggestion = (suggestion: any) => {
    // Handle AI suggestion implementation
    console.log('Implementing suggestion:', suggestion)
    // This would contain the actual logic to implement the suggestion
  }

  const handleRefreshSuggestions = async () => {
    try {
      // Generate AI suggestions based on current project context
      const { text } = await blink.ai.generateText({
        prompt: `Based on this project management board state, suggest 3-4 workflow improvements:
        
        Columns: ${columns.map(c => c.name).join(', ')}
        Tasks: ${tasks.map(t => `"${t.title}" (${t.priority} priority, in ${columns.find(c => c.id === t.columnId)?.name})`).join(', ')}
        
        Analyze the current workflow and suggest specific improvements like:
        - Task organization optimizations
        - Workflow bottlenecks to address
        - Missing tasks that should be added
        - Column rebalancing suggestions
        
        Respond with JSON array format: [{"type": "workflow|task|optimization|collaboration", "title": "...", "description": "...", "action": "...", "impact": "low|medium|high", "confidence": 0.85}]`,
        model: 'gpt-4o-mini'
      })

      // Parse AI suggestions and update the panel
      try {
        const suggestions = JSON.parse(text)
        // You would update the suggestions state here
        console.log('Generated AI suggestions:', suggestions)
      } catch (error) {
        console.error('Failed to parse AI suggestions:', error)
      }
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error)
      toast.error('Failed to refresh AI suggestions')
    }
  }

  const getTasksForColumn = (columnId: string) => {
    return tasks
      .filter(task => task.columnId === columnId)
      .sort((a, b) => a.position - b.position)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading AI Task Board</h2>
          <p className="text-gray-600">Setting up your workspace...</p>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Welcome to AI Task Board</h2>
          <p className="text-gray-600 mb-4">Please sign in to continue</p>
          <Button onClick={() => blink.auth.login()}>
            Sign In
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI Task Board</h1>
                  <p className="text-sm text-gray-600">Powered by artificial intelligence</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700">
                <Brain className="w-3 h-3 mr-1" />
                Smart Mode
              </Badge>
              {isDemoMode && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Demo Mode
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>4 completed today</span>
                </div>
                <button
                  onClick={() => setIsAISuggestionsOpen(true)}
                  className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>2 AI suggestions</span>
                </button>
              </div>
              
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Invite
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => blink.auth.logout()}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Board Container */}
          <div className="flex gap-6 overflow-x-auto pb-6">
            {columns.map((column) => (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={getTasksForColumn(column.id)}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            ))}

            {/* Add Column Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-w-80"
            >
              <Card className="h-full p-4 bg-white/40 backdrop-blur-sm border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors cursor-pointer">
                <div className="flex flex-col items-center justify-center h-full text-gray-500 hover:text-indigo-600 transition-colors">
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="font-medium">Add Column</span>
                  <span className="text-sm">Create new status</span>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask && (
              <div className="rotate-3 opacity-90">
                <TaskCard task={activeTask} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </main>

      {/* AI Command Bar */}
      <AICommandBar
        onCommand={handleAICommand}
        isProcessing={isAIProcessing}
        suggestions={[
          'Create sprint planning tasks',
          'Move high priority items to In Progress',
          'Generate QA checklist',
        ]}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false)
          setSelectedTask(null)
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* AI Suggestions Panel */}
      <AISuggestionsPanel
        isOpen={isAISuggestionsOpen}
        onClose={() => setIsAISuggestionsOpen(false)}
        onImplement={handleImplementSuggestion}
        onRefresh={handleRefreshSuggestions}
      />
    </div>
  )
}