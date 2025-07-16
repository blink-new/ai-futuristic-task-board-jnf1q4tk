export interface Task {
  id: string
  title: string
  description?: string
  columnId: string
  boardId: string
  position: number
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  aiGenerated: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Column {
  id: string
  boardId: string
  name: string
  color: string
  position: number
  userId: string
  createdAt: string
}

export interface Board {
  id: string
  name: string
  description?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface AICommand {
  type: 'create_task' | 'move_task' | 'update_task' | 'create_column' | 'generate_board'
  payload: any
  confidence: number
}