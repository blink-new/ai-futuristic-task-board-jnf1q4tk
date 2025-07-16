import blink from '../blink/client'

export async function initializeDatabase() {
  try {
    // Test if the database is available by trying a simple query
    await blink.db.columns.list({ where: { userId: 'test' }, limit: 1 })
    console.log('Database is available')
    return true
  } catch (error) {
    console.warn('Database not available, will use demo mode:', error)
    return false
  }
}

export async function createDatabaseTables() {
  try {
    // This function would create tables if we had database access
    // For now, we'll rely on the fallback to demo mode
    console.log('Database tables would be created here if database was available')
    return true
  } catch (error) {
    console.error('Failed to create database tables:', error)
    return false
  }
}

export function createMockData(userId: string, boardId: string) {
  // Default columns for new boards
  const defaultColumns = [
    {
      id: `col-${Date.now()}-0`,
      boardId,
      name: 'To Do',
      color: '#6366f1',
      position: 0,
      userId,
      createdAt: new Date().toISOString()
    },
    {
      id: `col-${Date.now()}-1`,
      boardId,
      name: 'In Progress',
      color: '#f59e0b',
      position: 1,
      userId,
      createdAt: new Date().toISOString()
    },
    {
      id: `col-${Date.now()}-2`,
      boardId,
      name: 'Review',
      color: '#8b5cf6',
      position: 2,
      userId,
      createdAt: new Date().toISOString()
    },
    {
      id: `col-${Date.now()}-3`,
      boardId,
      name: 'Done',
      color: '#22c55e',
      position: 3,
      userId,
      createdAt: new Date().toISOString()
    }
  ]

  // Sample tasks
  const sampleTasks = [
    {
      id: `task-${Date.now()}-0`,
      title: 'Welcome to AI Task Board!',
      description: 'This is your first AI-powered task. Try using the command bar below to create more tasks with natural language.',
      columnId: defaultColumns[0].id,
      boardId,
      position: 0,
      priority: 'high' as const,
      tags: ['welcome', 'ai-generated'],
      aiGenerated: true,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `task-${Date.now()}-1`,
      title: 'Set up project requirements',
      description: 'Define the scope and requirements for the new project',
      columnId: defaultColumns[1].id,
      boardId,
      position: 0,
      priority: 'medium' as const,
      tags: ['planning', 'requirements'],
      aiGenerated: false,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `task-${Date.now()}-2`,
      title: 'Code review for authentication',
      description: 'Review the authentication implementation and security measures',
      columnId: defaultColumns[2].id,
      boardId,
      position: 0,
      priority: 'high' as const,
      tags: ['security', 'review'],
      aiGenerated: false,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `task-${Date.now()}-3`,
      title: 'Deploy to production',
      description: 'Successfully deployed the application to production environment',
      columnId: defaultColumns[3].id,
      boardId,
      position: 0,
      priority: 'low' as const,
      tags: ['deployment', 'completed'],
      aiGenerated: false,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  return { columns: defaultColumns, tasks: sampleTasks }
}