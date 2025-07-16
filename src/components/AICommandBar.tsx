import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Loader2, 
  Lightbulb,
  Zap,
  Brain
} from 'lucide-react'
import { cn } from '../lib/utils'

interface AICommandBarProps {
  onCommand?: (command: string) => void
  isProcessing?: boolean
  suggestions?: string[]
}

const quickCommands = [
  { text: 'Create a task for user research', icon: Lightbulb },
  { text: 'Move all high priority tasks to In Progress', icon: Zap },
  { text: 'Generate a sprint planning board', icon: Brain },
]

export function AICommandBar({ onCommand, isProcessing = false, suggestions = [] }: AICommandBarProps) {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isProcessing) {
      onCommand?.(input.trim())
      setInput('')
      setIsExpanded(false)
    }
  }

  const handleQuickCommand = (command: string) => {
    onCommand?.(command)
    setIsExpanded(false)
  }

  const toggleVoice = () => {
    setIsListening(!isListening)
    // Voice recognition would be implemented here
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsExpanded(true)
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setIsExpanded(false)
        setInput('')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {/* Trigger Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <motion.div
            animate={{ rotate: isProcessing ? 360 : 0 }}
            transition={{ duration: 1, repeat: isProcessing ? Infinity : 0 }}
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </motion.div>
        </Button>
      </motion.div>

      {/* Command Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl mx-4"
            >
              <Card className="p-6 bg-white/95 backdrop-blur-md border-0 shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <h2 className="font-semibold text-gray-900">AI Assistant</h2>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Beta
                  </Badge>
                  <div className="ml-auto">
                    <Badge variant="outline" className="text-xs">
                      ⌘K
                    </Badge>
                  </div>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="mb-6">
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Tell me what you want to do... (e.g., 'Create a task for user testing')"
                      className="pr-20 h-12 text-base"
                      autoFocus
                      disabled={isProcessing}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'h-8 w-8 p-0',
                          isListening && 'text-red-500 bg-red-50'
                        )}
                        onClick={toggleVoice}
                      >
                        {isListening ? (
                          <MicOff className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={!input.trim() || isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Quick Commands */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Quick Commands</h3>
                  <div className="grid gap-2">
                    {quickCommands.map((command, index) => {
                      const Icon = command.icon
                      return (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleQuickCommand(command.text)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
                          disabled={isProcessing}
                        >
                          <Icon className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm text-gray-700">{command.text}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Suggestions</h3>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleQuickCommand(suggestion)}
                          className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors"
                          disabled={isProcessing}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Processing Indicator */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 flex items-center gap-2 text-sm text-indigo-600"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI is processing your request...</span>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}