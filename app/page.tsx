'use client'

import { useState, useEffect } from 'react'
import { RadioGroup } from '@headlessui/react'
import { Loader2, Info, BookOpen, Clock, Hash, Heart, TextQuote, Pen, Sparkles, Lightbulb, Trash2, Shuffle, MessageCircle, Map } from 'lucide-react'
import { motion } from 'framer-motion'

type StoryPreferences = {
  mood: string
  length: string
  style: string
  genre: string
  tone: string
  setting: string
}

// Add analytics interface
interface Analytics {
  storiesGenerated: number
  averageLength: number
  popularGenre: string
  lastGenerated: Date | null
}

// First, let's define a consistent animation system at the top of the file
const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  },
  scale: {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: { 
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  float: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
}

// First, create a new PreferenceCard component for better organization
function PreferenceCard({ 
  label, 
  options, 
  value, 
  onChange,
  icon: Icon 
}: {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  icon: React.ElementType
}) {
  return (
    <motion.div 
      variants={animations.fadeIn}
      className="bg-white/60 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-white rounded-xl shadow-sm">
          <Icon className="h-5 w-5 text-indigo-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">{label}</h3>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {options.map((option, index) => (
          <motion.button
            key={option}
            variants={animations.scale}
            whileHover="hover"
            whileTap="tap"
            initial="initial"
            animate="animate"
            custom={index}
            onClick={() => onChange(option)}
            className={`
              relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
              ${value === option 
                ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-100' 
                : 'bg-white/40 text-gray-600 hover:bg-white hover:shadow-sm'
              }
              flex items-center justify-center gap-2
            `}
          >
            {value === option && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-[10px]">✓</span>
              </motion.span>
            )}
            <span>{option}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [story, setStory] = useState('')
  const [error, setError] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [lastPrompt, setLastPrompt] = useState('')
  const [preferences, setPreferences] = useState<StoryPreferences>({
    mood: '',
    length: '',
    style: '',
    genre: '',
    tone: '',
    setting: ''
  })
  const [analytics, setAnalytics] = useState<Analytics>({
    storiesGenerated: 0,
    averageLength: 0,
    popularGenre: '',
    lastGenerated: null
  })
  const [charCount, setCharCount] = useState(0)

  // Example prompts for user guidance
  const examplePrompts = [
    "A mysterious artifact that grants unexpected wishes...",
    "Two strangers connected by a peculiar dream...",
    "A forgotten library with books that write themselves...",
    "A time-traveling letter that changes everything..."
  ]

  const moods = [
    "Sad", "Hopeful", "Mysterious", "Vivid", "Nostalgic", "Dreamy", 
    "Energetic", "Peaceful", "Dark", "Whimsical", "Intense", "Calm"
  ]

  const lengths = [
    "100 words", "150 words", "200 words", "300 words", 
    "500 words", "1000 words", "1500 words", "2000 words"
  ]

  const styles = [
    "Narrative", "Third Person", "First Person", "Descriptive",
    "Stream of Consciousness", "Minimalist", "Poetic", "Experimental"
  ]

  const genres = [
    "Mystery", "Thriller", "Romance", "Fantasy", "Horror",
    "Science Fiction", "Adventure", "Historical", "Comedy",
    "Drama", "Fairy Tale", "Dystopian"
  ]

  const tones = [
    "Serious", "Humorous", "Satirical", "Philosophical",
    "Casual", "Formal", "Playful", "Academic"
  ]

  const settings = [
    "Urban", "Rural", "Futuristic", "Medieval",
    "Contemporary", "Post-apocalyptic", "Magical", "Space"
  ]

  // Track character count
  useEffect(() => {
    setCharCount(prompt.length)
  }, [prompt])

  // Enhanced handleGenerate with analytics
  const handleGenerate = async () => {
    if (!prompt && !preferences.mood && !preferences.length && !preferences.style && !preferences.genre && !preferences.tone && !preferences.setting) {
      setError('Please enter a prompt or select preferences')
      return
    }

    
    setError('')
    setIsLoading(true)
    const fullPrompt = `Write a ${preferences.mood.toLowerCase()} story in ${preferences.style.toLowerCase()} style. 
      It should be a ${preferences.genre.toLowerCase()} genre and approximately ${preferences.length.toLowerCase()} words.
      The tone should be ${preferences.tone.toLowerCase()} and the setting should be ${preferences.setting.toLowerCase()}.
      Additional details: ${prompt}`
    setLastPrompt(fullPrompt)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...preferences }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate story')
      }
      
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      
      setStory(data.story)
      setShowPrompt(true)
      
      // Update analytics
      setAnalytics(prev => ({
        storiesGenerated: prev.storiesGenerated + 1,
        averageLength: Math.round((prev.averageLength * prev.storiesGenerated + data.story.length) / (prev.storiesGenerated + 1)),
        popularGenre: preferences.genre,
        lastGenerated: new Date()
      }))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate story')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRandomize = () => {
    setPreferences({
      mood: moods[Math.floor(Math.random() * moods.length)],
      length: lengths[Math.floor(Math.random() * lengths.length)],
      style: styles[Math.floor(Math.random() * styles.length)],
      genre: genres[Math.floor(Math.random() * genres.length)],
      tone: tones[Math.floor(Math.random() * tones.length)],
      setting: settings[Math.floor(Math.random() * settings.length)]
    })
  }

  // Add clearPreferences function in the Home component
  const clearPreferences = () => {
    setPreferences({
      mood: '',
      length: '',
      style: '',
      genre: '',
      tone: '',
      setting: ''
    })
  }

  return (
    <motion.main
      initial="initial"
      animate="animate"
      variants={animations.stagger}
      className="min-h-screen p-8"
    >
      <motion.header 
        variants={animations.fadeIn}
        className="relative py-16 mb-12 overflow-hidden"
      >
        {/* Background decoration */}
        <motion.div 
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        </motion.div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={animations.fadeIn}
            className="inline-block mb-4 px-4 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full"
          >
            <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              AI-Powered Story Generation
            </span>
          </motion.div>

          <motion.h1 
            variants={animations.fadeIn}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-6"
          >
            <span className="block">Make your Own</span>
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-6 pb-2">
              Deranged Stories
            </span>
          </motion.h1>

          <motion.p 
            variants={animations.fadeIn}
            className="max-w-2xl mx-auto text-lg text-gray-600 mb-8"
          >
            Let AI help you create unique and imaginative stories. Choose your preferences, 
            add your prompt, and watch your story come to life.
          </motion.p>

          <motion.div 
            variants={animations.fadeIn}
            className="flex flex-wrap justify-center gap-3 text-sm text-gray-600"
          >
            {['AI-Powered', 'Customizable', 'Instant Generation', 'Multiple Genres'].map((feature, index) => (
              <div 
                key={index}
                className="flex items-center px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200"
              >
                <span className="mr-1.5">✨</span>
                {feature}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating elements decoration */}
        <motion.div
          variants={animations.float}
          className="absolute top-10 left-10 w-20 h-20 rounded-full bg-indigo-200/30 blur-xl"
        />
        <motion.div
          variants={animations.float}
          className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-purple-200/30 blur-xl"
        />
      </motion.header>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Add Analytics Dashboard */}
      {/* <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center text-indigo-600 mb-2">
            <BookOpen className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Stories Generated</h3>
          </div>
          <p className="text-2xl font-bold">{analytics.storiesGenerated}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center text-indigo-600 mb-2">
            <Hash className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Average Length</h3>
          </div>
          <p className="text-2xl font-bold">{analytics.averageLength} chars</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center text-indigo-600 mb-2">
            <BookOpen className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Popular Genre</h3>
          </div>
          <p className="text-2xl font-bold">{analytics.popularGenre || 'N/A'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center text-indigo-600 mb-2">
            <Clock className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Last Generated</h3>
          </div>
          <p className="text-sm">
            {analytics.lastGenerated 
              ? new Date(analytics.lastGenerated).toLocaleString()
              : 'Never'}
          </p>
        </div>
      </div> */}

      <motion.div 
        variants={animations.fadeIn}
        className="space-y-8"
      >
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-white rounded-lg">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Story Prompt</h2>
              </div>
              <span className={`text-sm font-medium ${
                charCount > 450 ? 'text-red-500' : 'text-gray-400'
              }`}>
                {charCount}/500
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="relative">
              <textarea
                id="prompt"
                rows={4}
                maxLength={500}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your story idea here..."
                style={{ minHeight: '120px' }}
              />
              
              <motion.div 
                className="mt-4"
                initial="hidden"
                animate={prompt ? "hidden" : "show"}
                variants={animations.slideIn}
              >
                <div className="flex items-center gap-2 text-gray-500 mb-3">
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-sm font-medium">Example prompts</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {examplePrompts.map((example, index) => (
                    <motion.button
                      key={index}
                      variants={animations.scale}
                      whileHover="hover"
                      whileTap="tap"
                      initial="initial"
                      animate="animate"
                      custom={index}
                      onClick={() => setPrompt(example)}
                      className="text-left p-3 rounded-lg bg-gray-50 hover:bg-indigo-50 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                    >
                      {example}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={animations.fadeIn}
        className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-md p-8 mt-8 mb-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-gray-900">Story Preferences</h2>
            <p className="text-sm text-gray-500">Customize your story's characteristics</p>
          </div>
          <div className="flex gap-2">
            <motion.button
              variants={animations.scale}
              whileHover="hover"
              whileTap="tap"
              onClick={clearPreferences}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-red-600 bg-white hover:bg-red-50 hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </motion.button>
            <motion.button
              variants={animations.scale}
              whileHover="hover"
              whileTap="tap"
              onClick={handleRandomize}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Randomize
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          <PreferenceCard
            label="Mood"
            options={moods}
            value={preferences.mood}
            onChange={(mood) => preferences.mood ? setPreferences({...preferences,'mood':''}) : setPreferences({ ...preferences, mood })}
            icon={Heart}
          />
          <PreferenceCard
            label="Length"
            options={lengths}
            value={preferences.length}
            onChange={(length) => preferences.length ? setPreferences({...preferences,'length':''}) : setPreferences({ ...preferences, length })}
            icon={TextQuote}
          />
          <PreferenceCard
            label="Style"
            options={styles}
            value={preferences.style}
            onChange={(style) => preferences.style ? setPreferences({...preferences,'style':''}) : setPreferences({ ...preferences, style })}
            icon={Pen}
          />
          <PreferenceCard
            label="Genre"
            options={genres}
            value={preferences.genre}
            onChange={(genre) => preferences.genre ? setPreferences({...preferences,'genre':''}) : setPreferences({ ...preferences, genre })}
            icon={BookOpen}
          />
          <PreferenceCard
            label="Tone"
            options={tones}
            value={preferences.tone}
            onChange={(tone) => preferences.tone ? setPreferences({...preferences,'tone':''}) : setPreferences({ ...preferences, tone })}
            icon={MessageCircle}
          />
          <PreferenceCard
            label="Setting"
            options={settings}
            value={preferences.setting}
            onChange={(setting) => preferences.setting ? setPreferences({...preferences,'setting':''}) : setPreferences({ ...preferences, setting })}
            icon={Map}
          />
        </div>
      </motion.div>

      <motion.div
        variants={animations.fadeIn}
        className="flex flex-col sm:flex-row justify-center gap-4"
      >
        <motion.button
          variants={animations.scale}
          whileHover="hover"
          whileTap="tap"
          onClick={handleGenerate}
          disabled={isLoading || (!prompt && !preferences.mood && !preferences.length && !preferences.style && !preferences.genre && !preferences.tone && !preferences.setting)}
          className="group relative inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed min-w-[200px] transition-all duration-200"
          aria-label={isLoading ? "Generating story..." : "Generate story"}
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-200" />
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center"
            >
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
              <span>Crafting Story...</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <span className="text-lg">✨</span>
              <span>Generate Story</span>
            </motion.div>
          )}
        </motion.button>
      </motion.div>

      {story && (
        <motion.div
          variants={animations.slideIn}
          initial="initial"
          animate="animate"
          className="bg-white rounded-lg shadow-sm p-6 prose prose-indigo max-w-none mt-6"
        >
          <h2 className="text-xl font-semibold mb-4">Your Story:</h2>
          <div className="whitespace-pre-wrap">{story}</div>
        </motion.div>
      )}

      {/* <footer className="mt-12 text-center text-gray-500">
        <p className="text-sm mt-2">@2024</p>
      </footer> */}
    </motion.main>
  )
}