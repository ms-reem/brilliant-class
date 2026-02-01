import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================================
// DATA IMPORTS
// ============================================================

import adjectivesData from '../adjectives.json'
import idleStoryGrammarData from '../idle_story_grammar.json'
import idleWordTranslationData from '../idle_word_translation.json'
import idleMultiLanguageData from '../idle_multi_language.json'
import unit7Data from '../unit7.json'
import unit8Data from '../unit8.json'
import unit9Data from '../unit9.json'
import unit10Data from '../unit10.json'
import unit11Data from '../unit11.json'
import unit12Data from '../unit12.json'

const unitDataMap = {
    7: unit7Data,
    8: unit8Data,
    9: unit9Data,
    10: unit10Data,
    11: unit11Data,
    12: unit12Data
}

// ============================================================
// COLOR PALETTE
// ============================================================

const accentColors = ['cyan', 'pink', 'lime', 'purple', 'red']

const colorValues = {
    cyan: '#00D9FF',
    pink: '#FF006E',
    lime: '#7CB518',
    purple: '#A855F7',
    red: '#BE0000'
}

const bgTints = {
    cyan: '#D3F4FB',
    pink: '#F9D3E5',
    lime: '#E5EFD8',
    purple: '#ECE0FA',
    red: '#F9D5D5'
}

const lightTints = {
    cyan: 'rgba(0, 217, 255, 0.15)',
    pink: 'rgba(255, 0, 110, 0.15)',
    lime: 'rgba(124, 181, 24, 0.15)',
    purple: 'rgba(168, 85, 247, 0.15)',
    red: 'rgba(190, 0, 0, 0.15)'
}

const textColors = {
    cyan: '#0099b3',
    pink: '#cc0058',
    lime: '#5a8a10',
    purple: '#7c3aed',
    red: '#8B0000'
}

// ============================================================
// UTILITIES
// ============================================================

const shuffle = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Get next color that's NOT the same as current
const getNextAccent = (current) => {
    const idx = accentColors.indexOf(current)
    return accentColors[(idx + 1) % accentColors.length]
}

// Get random color that's NOT the same as current
const getRandomAccentExcluding = (current) => {
    const available = accentColors.filter(c => c !== current)
    return available[Math.floor(Math.random() * available.length)]
}

// ============================================================
// CONFETTI
// ============================================================

function Confetti({ show }) {
    if (!show) return null

    const colors = Object.values(colorValues)
    const pieces = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.4,
        size: 6 + Math.random() * 6
    }))

    return (
        <div className="confetti">
            {pieces.map(p => (
                <div
                    key={p.id}
                    className="confetti-piece"
                    style={{
                        left: `${p.left}%`,
                        backgroundColor: p.color,
                        width: p.size,
                        height: p.size,
                        animationDelay: `${p.delay}s`,
                        borderRadius: Math.random() > 0.5 ? '50%' : '0'
                    }}
                />
            ))}
        </div>
    )
}

// ============================================================
// BACK ARROW
// ============================================================

function BackArrow({ onClick, color }) {
    return (
        <motion.div
            className="back-arrow"
            onClick={onClick}
            style={{ color: colorValues[color] || colorValues.cyan }}
            whileHover={{ scale: 1.1, x: -4 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', damping: 20 }}
        >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
            </svg>
        </motion.div>
    )
}

// ============================================================
// ANIMATED TITLE COMPONENT - Reusable for all list screens
// ============================================================

function useAnimatedTitle({ onColorChange, initialColor = 'cyan' }) {
    const [shuffledAdjectives, setShuffledAdjectives] = useState([])
    const [adjIndex, setAdjIndex] = useState(0)
    const [displayedWord, setDisplayedWord] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [currentColor, setCurrentColor] = useState(initialColor)

    // Shuffle adjectives on mount
    useEffect(() => {
        setShuffledAdjectives(shuffle(adjectivesData))
    }, [])

    const currentAdjective = shuffledAdjectives[adjIndex] || 'amazing'

    // Typewriter effect + notify parent of color changes
    useEffect(() => {
        if (shuffledAdjectives.length === 0) return

        let timeout

        if (!isDeleting) {
            if (displayedWord.length < currentAdjective.length) {
                timeout = setTimeout(() => {
                    setDisplayedWord(currentAdjective.slice(0, displayedWord.length + 1))
                }, 80 + Math.random() * 40)
            } else {
                timeout = setTimeout(() => {
                    setIsDeleting(true)
                }, 2500)
            }
        } else {
            if (displayedWord.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayedWord(displayedWord.slice(0, -1))
                }, 40)
            } else {
                setIsDeleting(false)
                // Get a different color - never the same as current
                const newColor = getRandomAccentExcluding(currentColor)
                setCurrentColor(newColor)
                onColorChange?.(newColor)

                if (adjIndex >= shuffledAdjectives.length - 1) {
                    setShuffledAdjectives(shuffle(adjectivesData))
                    setAdjIndex(0)
                } else {
                    setAdjIndex(prev => prev + 1)
                }
            }
        }

        return () => clearTimeout(timeout)
    }, [displayedWord, isDeleting, currentAdjective, shuffledAdjectives, adjIndex, onColorChange, currentColor])

    // Also notify on initial color
    useEffect(() => {
        onColorChange?.(currentColor)
    }, [currentColor, onColorChange])

    return {
        title: (
            <motion.div
                className="home-title mb-lg"
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                Ali's{' '}
                <span
                    className="home-adjective"
                    style={{ color: colorValues[currentColor] }}
                >
                    {displayedWord}
                </span>
                <span
                    className="home-cursor"
                    style={{ backgroundColor: colorValues[currentColor] }}
                />
                {' '}Class
            </motion.div>
        ),
        color: currentColor
    }
}

// Info sections data (outside component to prevent re-creation)
const infoSections = [
    {
        titles: ['Who Made This?', 'The Creator', 'About Me', 'Meet the Teacher', 'Hello!', 'My Story', 'The Maker', 'Who Am I?', 'Greetings!', 'Hi There!'],
        content: "My name is Ali Alghamdi. I am an English teacher. I love helping kids learn English in fun ways. I made this app for my students to practice and have fun!"
    },
    {
        titles: ['Why This App?', 'The Reason', 'My Goal', 'The Purpose', 'Why I Made This', 'The Idea', 'My Dream', 'What I Want', 'The Plan', 'My Hope'],
        content: "I wanted to make learning feel like playing. When you see pretty colors and smooth moves, your brain feels happy. Happy brains learn better!"
    },
    {
        titles: ['Color Magic', 'The Colors', 'Rainbow System', 'Color Engine', 'Chromatic System', 'Pretty Colors', 'Color Wheel', 'Hue Machine', 'Palette Power', 'Shade Shifter'],
        content: "The colors change all the time! This keeps your eyes awake and your mind fresh. Each color has a soft tint for the background so it never hurts your eyes."
    },
    {
        titles: ['Smooth Moves', 'Animations', 'The Motion', 'Why It Moves', 'Living Screen', 'Dance of Parts', 'Movement Magic', 'Flow System', 'Motion Engine', 'Dynamic Feel'],
        content: "Everything slides and fades nicely. This makes the app feel alive and friendly. It also helps you see where things are going!"
    }
]

function InfoScreen({ onBack, onAccentChange }) {
    const [titleIndices, setTitleIndices] = useState([0, 0, 0, 0])
    const [charCount, setCharCount] = useState([0, 0, 0, 0])
    const [isDeleting, setIsDeleting] = useState(false)
    const [accent, setAccent] = useState('cyan')

    // Typewriter effect for all titles simultaneously
    useEffect(() => {
        const maxLength = Math.max(...infoSections.map((s, i) => s.titles[titleIndices[i]].length))
        const currentMaxDisplay = Math.max(...charCount)

        let timeout

        if (!isDeleting) {
            // Writing phase
            if (currentMaxDisplay < maxLength) {
                timeout = setTimeout(() => {
                    setCharCount(prev => prev.map((c, i) => {
                        const target = infoSections[i].titles[titleIndices[i]]
                        return Math.min(c + 1, target.length)
                    }))
                }, 70)
            } else {
                // Finished writing - pause then start deleting
                timeout = setTimeout(() => setIsDeleting(true), 2500)
            }
        } else {
            // Deleting phase
            if (currentMaxDisplay > 0) {
                timeout = setTimeout(() => {
                    setCharCount(prev => prev.map(c => Math.max(0, c - 1)))
                }, 25)
            } else {
                // Finished deleting - change color and move to next titles
                setIsDeleting(false)
                setTitleIndices(prev => prev.map((idx, i) => (idx + 1) % infoSections[i].titles.length))
                setAccent(getRandomAccentExcluding(accent))
            }
        }

        return () => clearTimeout(timeout)
    }, [charCount, isDeleting, titleIndices, accent])

    // Get displayed titles
    const displayedTitles = infoSections.map((s, i) =>
        s.titles[titleIndices[i]].slice(0, charCount[i])
    )

    // Sync global accent
    useEffect(() => {
        onAccentChange?.(accent)
    }, [accent, onAccentChange])

    return (
        <motion.div
            className="idle-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                overflow: 'auto',
                padding: '100px 50px 60px',
                maxWidth: 900,
                margin: '0 auto'
            }}
        >
            <BackArrow onClick={onBack} color={accent} />

            <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                    fontSize: 64,
                    color: colorValues[accent],
                    marginBottom: 60,
                    textAlign: 'center',
                    fontFamily: 'var(--font-display)'
                }}
            >
                About This App
            </motion.h1>

            {infoSections.map((section, i) => (
                <motion.div
                    key={i}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * i }}
                    style={{ marginBottom: 50 }}
                >
                    <h2 style={{
                        fontSize: 38,
                        color: colorValues[accent],
                        marginBottom: 16,
                        fontFamily: 'var(--font-display)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                    }}>
                        {displayedTitles[i]}
                        <span
                            style={{
                                width: 4,
                                height: 36,
                                backgroundColor: colorValues[accent],
                                display: 'inline-block',
                                animation: 'blink 0.8s infinite'
                            }}
                        />
                    </h2>
                    <p style={{
                        fontSize: 24,
                        lineHeight: 1.8,
                        opacity: 0.85,
                        color: 'inherit'
                    }}>
                        {section.content}
                    </p>
                </motion.div>
            ))}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                style={{
                    marginTop: 70,
                    padding: 30,
                    borderRadius: 20,
                    backgroundColor: `${colorValues[accent]}15`,
                    border: `2px solid ${colorValues[accent]}30`,
                    textAlign: 'center'
                }}
            >
                <p style={{ fontSize: 16, opacity: 0.8 }}>
                    Made with ❤️ for learning English
                </p>
            </motion.div>
        </motion.div>
    )
}

// ============================================================
// MAIN MENU
// ============================================================

function MainMenu({ onNavigate, onAccentChange, isDarkMode, onToggleDarkMode }) {
    const { title, color } = useAnimatedTitle({
        onColorChange: onAccentChange,
        initialColor: 'cyan'
    })

    const buttonStyle = {
        '--btn-bg': lightTints[color],
        '--btn-color': colorValues[color],
        '--btn-text': textColors[color],
        '--btn-hover-bg': `${colorValues[color]}40`
    }

    return (
        <motion.div
            className="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Top Bar with Icons */}
            <div style={{
                position: 'absolute',
                top: 24,
                right: 24,
                display: 'flex',
                gap: 16,
                zIndex: 100
            }}>
                {/* Dark Mode Toggle */}
                <motion.button
                    onClick={onToggleDarkMode}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        border: `2px solid ${colorValues[color]}`,
                        backgroundColor: isDarkMode ? colorValues[color] : 'transparent',
                        color: isDarkMode ? '#111' : colorValues[color],
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20
                    }}
                    title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                >
                    {isDarkMode ? '☀️' : '🌙'}
                </motion.button>

                {/* Info Icon */}
                <motion.button
                    onClick={() => onNavigate('info', color)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        border: `2px solid ${colorValues[color]}`,
                        backgroundColor: 'transparent',
                        color: colorValues[color],
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        fontWeight: 'bold',
                        fontFamily: 'serif'
                    }}
                    title="About this app"
                >
                    ℹ
                </motion.button>
            </div>

            {title}

            <div className="home-menu-grid">
                <motion.div
                    className="menu-item"
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <button
                        className="btn btn-dynamic"
                        style={{ width: '100%', height: '100%', ...buttonStyle }}
                        onClick={() => onNavigate('revise', color)}
                    >
                        Revise
                    </button>
                </motion.div>

                <motion.div
                    className="menu-item"
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <button
                        className="btn btn-dynamic"
                        style={{ width: '100%', height: '100%', ...buttonStyle }}
                        onClick={() => onNavigate('breathing', color)}
                    >
                        Breathing
                    </button>
                </motion.div>

                <motion.div
                    className="menu-item"
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <button
                        className="btn btn-dynamic"
                        style={{ width: '100%', height: '100%', ...buttonStyle }}
                        onClick={() => onNavigate('idle', color)}
                    >
                        Idle Animations
                    </button>
                </motion.div>
            </div>
        </motion.div>
    )
}

// ============================================================
// LIST SCREEN WITH ANIMATED TITLE
// ============================================================

function ListScreenWithTitle({ items, onSelect, onBack, renderItem, onAccentChange }) {
    const { title, color } = useAnimatedTitle({
        onColorChange: onAccentChange,
        initialColor: 'cyan'
    })

    return (
        <motion.div
            className="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <BackArrow onClick={onBack} color={color} />

            {title}

            <div className="menu-grid">
                {items.map((item, i) => (
                    <motion.div
                        key={item.key || i}
                        className="menu-item"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.08 }}
                    >
                        {renderItem(item, color, i)}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}

// ============================================================
// IDLE MENU
// ============================================================

function IdleMenu({ onNavigate, onBack, onAccentChange }) {
    const items = [
        { key: 'grammar-typewriter', label: 'Grammar Stories' },
        { key: 'word-flash', label: 'Word Flash' },
        { key: 'multi-language', label: 'Multi-Language' }
    ]

    return (
        <ListScreenWithTitle
            items={items}
            onBack={onBack}
            onAccentChange={onAccentChange}
            onSelect={(key) => onNavigate(key)}
            renderItem={(item, color) => (
                <button
                    className={`btn btn-${color}`}
                    style={{ width: '100%', height: '100%' }}
                    onClick={() => onNavigate(item.key)}
                >
                    {item.label}
                </button>
            )}
        />
    )
}

// ============================================================
// GRAMMAR TYPEWRITER
// ============================================================

function GrammarTypewriter({ onBack, onAccentChange }) {
    const [shuffledStories, setShuffledStories] = useState([])
    const [storyIndex, setStoryIndex] = useState(0)
    const [charIndex, setCharIndex] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)
    const [accent, setAccent] = useState('cyan')

    useEffect(() => {
        setShuffledStories(shuffle(idleStoryGrammarData))
    }, [])

    const currentStory = shuffledStories[storyIndex]

    const storyData = useMemo(() => {
        if (!currentStory) return { parts: [], totalChars: 0 }

        let parts = []
        let totalChars = 0

        currentStory.story.forEach((part) => {
            const chars = part.text.split('')
            chars.forEach((char, charIdx) => {
                parts.push({
                    char,
                    highlight: part.highlight,
                    globalIdx: totalChars + charIdx
                })
            })
            totalChars += chars.length
        })

        return { parts, totalChars }
    }, [currentStory])

    useEffect(() => {
        onAccentChange?.(accent)
    }, [accent, onAccentChange])

    useEffect(() => {
        if (!currentStory || storyData.totalChars === 0) return

        let timeout

        if (!isDeleting) {
            if (charIndex < storyData.totalChars) {
                timeout = setTimeout(() => {
                    setCharIndex(prev => prev + 1)
                }, 35 + Math.random() * 25)
            } else {
                timeout = setTimeout(() => {
                    setIsDeleting(true)
                }, 3500)
            }
        } else {
            if (charIndex > 0) {
                timeout = setTimeout(() => {
                    setCharIndex(prev => prev - 1)
                }, 18)
            } else {
                setIsDeleting(false)
                const newAccent = getRandomAccentExcluding(accent)
                setAccent(newAccent)

                if (storyIndex >= shuffledStories.length - 1) {
                    setShuffledStories(shuffle(idleStoryGrammarData))
                    setStoryIndex(0)
                } else {
                    setStoryIndex(prev => prev + 1)
                }
            }
        }

        return () => clearTimeout(timeout)
    }, [charIndex, isDeleting, storyData.totalChars, storyIndex, shuffledStories.length, accent, currentStory])

    if (!currentStory) return null

    const highlightClass = `highlight-${accent}`

    return (
        <motion.div
            className="idle-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <BackArrow onClick={onBack} color={accent} />

            <div className="typewriter-text">
                {storyData.parts.slice(0, charIndex).map((item, i) => (
                    <motion.span
                        key={`${storyIndex}-${i}`}
                        className={item.highlight ? highlightClass : ''}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.12 }}
                    >
                        {item.char}
                    </motion.span>
                ))}
                <span
                    className="typewriter-cursor"
                    style={{ backgroundColor: colorValues[accent] }}
                />
            </div>

            <motion.div
                className="grammar-label mt-lg"
                style={{
                    backgroundColor: bgTints[accent],
                    color: colorValues[accent],
                    border: `2px solid ${colorValues[accent]}`
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                {currentStory.rules?.[0]}
            </motion.div>
        </motion.div>
    )
}

// ============================================================
// WORD FLASH
// ============================================================

function WordFlash({ onBack, onAccentChange }) {
    const [shuffledWords, setShuffledWords] = useState([])
    const [wordIndex, setWordIndex] = useState(0)
    const [phase, setPhase] = useState('english')
    const [progress, setProgress] = useState(0)
    const [accent, setAccent] = useState('pink')

    const displayDuration = 4000

    useEffect(() => {
        setShuffledWords(shuffle(idleWordTranslationData))
    }, [])

    const currentWord = shuffledWords[wordIndex]

    useEffect(() => {
        onAccentChange?.(accent)
    }, [accent, onAccentChange])

    useEffect(() => {
        if (!currentWord) return

        if (phase === 'english') {
            setProgress(0)
            const startTime = Date.now()

            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime
                const newProgress = Math.min(elapsed / displayDuration, 1)
                setProgress(newProgress)

                if (newProgress >= 1) {
                    clearInterval(interval)
                    setPhase('transition')
                }
            }, 30)

            return () => clearInterval(interval)
        } else if (phase === 'transition') {
            const timeout = setTimeout(() => {
                setPhase('arabic')
            }, 400)
            return () => clearTimeout(timeout)
        } else if (phase === 'arabic') {
            const timeout = setTimeout(() => {
                setPhase('english')
                setAccent(getRandomAccentExcluding(accent))

                if (wordIndex >= shuffledWords.length - 1) {
                    setShuffledWords(shuffle(idleWordTranslationData))
                    setWordIndex(0)
                } else {
                    setWordIndex(prev => prev + 1)
                }
            }, 2500)
            return () => clearTimeout(timeout)
        }
    }, [phase, wordIndex, shuffledWords.length, accent, currentWord])

    if (!currentWord) return null

    return (
        <motion.div
            className="idle-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <BackArrow onClick={onBack} color={accent} />

            <div className="word-flash-container">
                <motion.div
                    className="flash-card"
                    style={{ borderColor: colorValues[accent] }}
                >
                    <AnimatePresence mode="wait">
                        {phase !== 'arabic' ? (
                            <motion.div
                                key="english"
                                className="flash-word"
                                style={{ color: colorValues[accent] }}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                {currentWord.word}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="arabic"
                                className="flash-word-arabic"
                                style={{ color: colorValues[accent] }}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                {currentWord.translation}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        className="flash-progress-bar"
                        style={{ backgroundColor: colorValues[accent] }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.05 }}
                    />
                </motion.div>
            </div>
        </motion.div>
    )
}

// ============================================================
// MULTI-LANGUAGE SCROLL v5
// ============================================================

function MultiLanguageScroll({ onBack, onAccentChange }) {
    const [shuffledWords, setShuffledWords] = useState([])
    const [wordIndex, setWordIndex] = useState(0)
    const [activeIndex, setActiveIndex] = useState(0)
    const [isExiting, setIsExiting] = useState(false)
    const [accent, setAccent] = useState('red')

    const languages = ['word', 'ar', 'fr', 'es', 'ko', 'ja']
    const langLabels = {
        word: 'English',
        ar: 'Arabic',
        fr: 'French',
        es: 'Spanish',
        ko: 'Korean',
        ja: 'Japanese'
    }
    const itemHeight = 120

    useEffect(() => {
        setShuffledWords(shuffle(idleMultiLanguageData))
    }, [])

    const currentWord = shuffledWords[wordIndex]

    useEffect(() => {
        onAccentChange?.(accent)
    }, [accent, onAccentChange])

    useEffect(() => {
        if (!currentWord || isExiting) return

        const timeout = setTimeout(() => {
            if (activeIndex < languages.length - 1) {
                setActiveIndex(prev => prev + 1)
            } else {
                setIsExiting(true)
            }
        }, activeIndex === 0 ? 2000 : 1200)

        return () => clearTimeout(timeout)
    }, [activeIndex, isExiting, currentWord])

    useEffect(() => {
        if (!isExiting) return

        const timeout = setTimeout(() => {
            setIsExiting(false)
            setActiveIndex(0)
            setAccent(getRandomAccentExcluding(accent))

            if (wordIndex >= shuffledWords.length - 1) {
                setShuffledWords(shuffle(idleMultiLanguageData))
                setWordIndex(0)
            } else {
                setWordIndex(prev => prev + 1)
            }
        }, 800) // Wait for exit animation

        return () => clearTimeout(timeout)
    }, [isExiting, shuffledWords.length, wordIndex, accent])

    if (!currentWord) return null

    const isRtl = (lang) => lang === 'ar'
    // Center alignment calculation:
    // With top: 50%, we subtract 45px (half item height) to center the first item (index 0).
    // Then we subtract (index * 90px) to scroll up to the current item.
    const yOffset = -(activeIndex * itemHeight + 60)

    return (
        <motion.div
            className="idle-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <BackArrow onClick={onBack} color={accent} />

            <div className="multilang-container-v6">
                <div
                    className="multilang-pointer-wrapper"
                    style={{ color: colorValues[accent] }}
                >
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>

                <AnimatePresence mode="wait">
                    {!isExiting && (
                        <motion.div
                            key={wordIndex}
                            className="multilang-stack"
                            style={{
                                color: colorValues[accent],
                                position: 'absolute',
                                left: '25%', // Initial stack position
                                top: '50%'
                            }}
                            initial={{ x: -100, opacity: 0 }}
                            animate={{
                                x: 0,
                                opacity: 1,
                                y: yOffset
                            }}
                            exit={{ x: 200, opacity: 0, transition: { duration: 0.5, ease: "backIn" } }}
                            transition={{
                                y: { type: 'spring', stiffness: 100, damping: 20 },
                                x: { duration: 0.6, ease: "circOut" },
                                opacity: { duration: 0.4 }
                            }}
                        >
                            {languages.map((lang, i) => (
                                <motion.div
                                    key={lang}
                                    className={`multilang-item ${isRtl(lang) ? 'rtl' : ''} ${i === activeIndex ? 'active' : 'inactive'}`}
                                    animate={{
                                        // Specific animations for active state
                                        scale: i === activeIndex ? 1 : 0.9,
                                        x: i === activeIndex ? 0 : 20 // Slight indentation for inactive
                                    }}
                                >
                                    <div className="multilang-label">{langLabels[lang]}</div>
                                    <div className="multilang-word-text">{currentWord[lang]}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

// ================================================
// BREATHING SUITE
// ================================================

function BreathingMenu({ onNavigate, onBack, onAccentChange }) {
    const { title, color } = useAnimatedTitle({
        onColorChange: onAccentChange,
        initialColor: 'cyan'
    })

    return (
        <motion.div
            className="idle-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ overflow: 'hidden', height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0 }}
        >
            <BackArrow onClick={onBack} color={color} />

            <div className="flex flex-col items-center justify-center h-full gap-xl">
                {title}

                <div className="flex gap-lg" style={{ marginTop: 40 }}>
                    <button
                        className={`btn btn-${color}`}
                        style={{ minWidth: 220, padding: '20px 40px', fontSize: 28 }}
                        onClick={() => onNavigate('sigh')}
                    >
                        Psychological Sigh
                    </button>

                    <button
                        className={`btn btn-${color}`}
                        style={{ minWidth: 220, padding: '20px 40px', fontSize: 28 }}
                        onClick={() => onNavigate('box')}
                    >
                        Box Breathing
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

function PsychologicalSigh({ onBack, onAccentChange }) {
    const [phase, setPhase] = useState('ready')
    const [secondsLeft, setSecondsLeft] = useState(0)
    const [accent, setAccent] = useState('cyan')

    const phaseConfig = {
        inhale1: { dur: 3, label: 'Double Inhale', ar: 'شهيق - ١', scale: 1.4 },
        inhale2: { dur: 1.5, label: 'Top Up!', ar: 'شهيق - ٢', scale: 1.6 },
        exhale: { dur: 6, label: 'Long Exhale', ar: 'زفيييير', scale: 0.8 }
    }

    const current = phaseConfig[phase] || phaseConfig.inhale1

    useEffect(() => {
        if (phase === 'ready') return

        // Timer logic
        let remaining = current.dur
        setSecondsLeft(Math.ceil(remaining))

        const timer = setInterval(() => {
            remaining -= 1
            if (remaining > 0) {
                setSecondsLeft(Math.ceil(remaining))
            }
        }, 1000)

        // Phase Transition Logic
        const nextMap = { inhale1: 'inhale2', inhale2: 'exhale', exhale: 'inhale1' }
        const timeout = setTimeout(() => {
            const next = nextMap[phase]
            setPhase(next)

            // Cycle color on Exhale -> Inhale transition
            if (next === 'inhale1') {
                setAccent(prev => getRandomAccentExcluding(prev))
            }
        }, current.dur * 1000)

        return () => {
            clearTimeout(timeout)
            clearInterval(timer)
        }
    }, [phase, current.dur])

    // Sync global accent
    useEffect(() => {
        onAccentChange?.(accent)
    }, [accent, onAccentChange])

    useEffect(() => {
        const t = setTimeout(() => setPhase('inhale1'), 500)
        return () => clearTimeout(t)
    }, [])

    return (
        <motion.div
            className="idle-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                overflow: 'hidden',
                height: '100vh',
                width: '100vw',
                position: 'fixed',
                top: 0,
                left: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: '10vh' // Shift everything up a bit
            }}
        >
            <BackArrow onClick={onBack} color={accent} />

            {/* Ripples */}
            {phase.startsWith('inhale') && [...Array(3)].map((_, i) => (
                <motion.div
                    key={`ripple-${i}`}
                    style={{
                        position: 'absolute',
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        border: `2px solid ${colorValues[accent]}`,
                    }}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{
                        duration: 2,
                        delay: i * 0.5,
                        ease: 'easeOut',
                        repeat: Infinity
                    }}
                />
            ))}

            {/* Main Circle with Timer */}
            <motion.div
                style={{
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    backgroundColor: colorValues[accent],
                    boxShadow: `0 0 60px ${colorValues[accent]}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                }}
                animate={{ scale: current.scale }}
                transition={{ duration: current.dur, ease: 'easeInOut' }}
            >
                <motion.span
                    key={secondsLeft}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ fontSize: 40, fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' }}
                >
                    {secondsLeft}
                </motion.span>
            </motion.div>

            {/* Label */}
            <div style={{ position: 'absolute', bottom: '15%', textAlign: 'center' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={phase}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h2 style={{ fontSize: 56, color: colorValues[accent], margin: 0 }}>
                            {current.label}
                        </h2>
                        <p className="font-arabic" style={{ fontSize: 28, color: colorValues[accent], opacity: 0.8, marginTop: 10 }}>
                            {current.ar}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

function BoxBreathing({ onBack, onAccentChange }) {
    const [step, setStep] = useState(0)
    const [timeLeft, setTimeLeft] = useState(4)
    const [accent, setAccent] = useState('cyan')

    const PHASE_DURATION = 4000 // ms

    useEffect(() => {
        // Step Management
        const interval = setInterval(() => {
            setStep(prev => {
                const next = (prev + 1) % 4
                if (next === 0) {
                    setAccent(getRandomAccentExcluding(accent))
                }
                return next
            })
            setTimeLeft(4)
        }, PHASE_DURATION)

        // Countdown Timer
        const timer = setInterval(() => {
            setTimeLeft(t => t > 1 ? t - 1 : 1)
        }, 1000)

        // Sync initial timer
        const syncTimer = setTimeout(() => {
            setTimeLeft(4)
        }, 0)

        return () => {
            clearInterval(interval)
            clearInterval(timer)
            clearTimeout(syncTimer)
        }
    }, [accent])

    useEffect(() => {
        onAccentChange?.(accent)
    }, [accent, onAccentChange])

    const size = 300
    const labels = ['Inhale', 'Hold', 'Exhale', 'Hold']
    const arabicLabels = ['شهيق', 'احبس', 'زفير', 'احبس']

    return (
        <motion.div
            className="idle-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                overflow: 'hidden',
                height: '100vh',
                width: '100vw',
                position: 'fixed',
                top: 0,
                left: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <BackArrow onClick={onBack} color={accent} />

            <div style={{ position: 'relative', width: size + 40, height: size + 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Rotating Container */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, ease: "linear", repeat: Infinity }}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                >
                    <svg width={size + 40} height={size + 40} style={{ overflow: 'visible' }}>
                        <g transform="translate(20, 20)">
                            {/* Gray Track */}
                            <rect width={size} height={size} fill="none" stroke="#e0e0e0" strokeWidth="6" rx="20" />

                            {/* Active Side Fills - Smooth Animation */}
                            <motion.line x1="20" y1="0" x2={size - 20} y2="0" stroke={colorValues[accent]} strokeWidth="8" strokeLinecap="round"
                                animate={{ pathLength: step === 0 ? [0, 1] : step > 0 ? 1 : 0, opacity: step >= 0 ? 1 : 0 }}
                                transition={{ duration: step === 0 ? 4 : 0.5, ease: "linear" }}
                            />
                            <motion.line x1={size} y1="20" x2={size} y2={size - 20} stroke={colorValues[accent]} strokeWidth="8" strokeLinecap="round"
                                animate={{ pathLength: step === 1 ? [0, 1] : step > 1 ? 1 : 0, opacity: step >= 1 ? 1 : 0 }}
                                transition={{ duration: step === 1 ? 4 : 0.5, ease: "linear" }}
                            />
                            <motion.line x1={size - 20} y1={size} x2="20" y2={size} stroke={colorValues[accent]} strokeWidth="8" strokeLinecap="round"
                                animate={{ pathLength: step === 2 ? [0, 1] : step > 2 ? 1 : 0, opacity: step >= 2 ? 1 : 0 }}
                                transition={{ duration: step === 2 ? 4 : 0.5, ease: "linear" }}
                            />
                            <motion.line x1="0" y1={size - 20} x2="0" y2="20" stroke={colorValues[accent]} strokeWidth="8" strokeLinecap="round"
                                animate={{ pathLength: step === 3 ? [0, 1] : step > 3 ? 1 : 0, opacity: step >= 3 ? 1 : 0 }}
                                transition={{ duration: step === 3 ? 4 : 0.5, ease: "linear" }}
                            />

                            {/* Smooth Gliding Dot */}
                            <motion.circle
                                r="14"
                                fill={colorValues[accent]}
                                animate={{
                                    cx: step === 0 ? [0, size] : step === 1 ? size : step === 2 ? [size, 0] : 0,
                                    cy: step === 0 ? 0 : step === 1 ? [0, size] : step === 2 ? size : [size, 0]
                                }}
                                transition={{ duration: 4, ease: "linear" }}
                            />
                        </g>
                    </svg>
                </motion.div>

                {/* Central Text & Timer (Static, does not rotate) */}
                <div style={{ zIndex: 10, textAlign: 'center' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                        >
                            <h2 style={{ fontSize: 42, color: colorValues[accent], margin: 0 }}>
                                {labels[step]}
                            </h2>
                            <p className="font-arabic" style={{ fontSize: 24, color: colorValues[accent], opacity: 0.8, marginTop: 4 }}>
                                {arabicLabels[step]}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    <motion.div
                        key={`${step}-${timeLeft}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ fontSize: 64, fontWeight: 'bold', color: colorValues[accent], marginTop: 10 }}
                    >
                        {timeLeft}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}

// ============================================================
// UNIT SELECT - With animated title
// ============================================================

function UnitSelect({ onSelect, onBack, onAccentChange }) {
    const units = [7, 8, 9, 10, 11, 12]

    const items = units.map(u => ({ key: u, label: `Unit ${u}` }))

    return (
        <ListScreenWithTitle
            items={items}
            onBack={onBack}
            onAccentChange={onAccentChange}
            renderItem={(item, color) => (
                <button
                    className={`btn btn-${color}`}
                    style={{ width: '100%', height: '100%' }}
                    onClick={() => onSelect(item.key, color)}
                >
                    {item.label}
                </button>
            )}
        />
    )
}

// ============================================================
// QUESTION TYPE SELECT - With animated title
// ============================================================

function QuestionTypeSelect({ unit, onSelect, onBack, onAccentChange }) {
    const unitData = unitDataMap[unit]

    const questionTypes = [
        { key: 'grammarMCQ', label: 'Grammar', data: unitData.grammarMCQ, hasScore: true },
        { key: 'fillInBlank', label: 'Fill in the Blank', data: unitData.fillInBlank, hasScore: false },
        { key: 'oddOneOut', label: 'Odd One Out', data: unitData.oddOneOut, hasScore: true },
        { key: 'translateToArabic', label: 'Translate to Arabic', data: unitData.translateToArabic, hasScore: false },
        { key: 'translateToEnglish', label: 'Translate to English', data: unitData.translateToEnglish, hasScore: false }
    ].filter(t => t.data && t.data.length > 0)

    return (
        <ListScreenWithTitle
            items={questionTypes}
            onBack={onBack}
            onAccentChange={onAccentChange}
            renderItem={(item, color) => (
                <button
                    className={`btn btn-${color}`}
                    style={{ width: '100%', height: '100%' }}
                    onClick={() => onSelect(item.key, item.data, item.hasScore, color)}
                >
                    {item.label}
                </button>
            )}
        />
    )
}

// ============================================================
// QUESTION DISPLAY
// ============================================================

function QuestionDisplay({ unit, questionType, questions, hasScore, onBack, staticColor: initialColor, onAccentChange }) {
    const [shuffledQuestions, setShuffledQuestions] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [showResult, setShowResult] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)
    const [score, setScore] = useState(0)
    const [revealedAnswer, setRevealedAnswer] = useState(false)
    const [questionColor, setQuestionColor] = useState(initialColor)

    useEffect(() => {
        setShuffledQuestions(shuffle(questions))
    }, [questions])

    // Sync background color with questionColor
    useEffect(() => {
        onAccentChange?.(questionColor)
    }, [questionColor, onAccentChange])

    if (shuffledQuestions.length === 0) return null

    const currentQuestion = shuffledQuestions[currentIndex]
    const progress = ((currentIndex + 1) / shuffledQuestions.length) * 100

    const checkAnswer = (answer) => {
        setSelectedAnswer(answer)
        setShowResult(true)

        let isCorrect = false

        if (questionType === 'grammarMCQ') {
            isCorrect = answer === currentQuestion.ans
        } else if (questionType === 'oddOneOut') {
            isCorrect = answer === currentQuestion.a
        }

        if (isCorrect && hasScore) {
            setScore(s => s + 1)
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 1800)
        }
    }

    const revealAnswer = () => {
        setRevealedAnswer(true)
    }

    const nextQuestion = () => {
        if (currentIndex < shuffledQuestions.length - 1) {
            setCurrentIndex(i => i + 1)
            setSelectedAnswer(null)
            setShowResult(false)
            setRevealedAnswer(false)
            setQuestionColor(getRandomAccentExcluding(questionColor))
        }
    }

    const prevQuestion = () => {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1)
            setSelectedAnswer(null)
            setShowResult(false)
            setRevealedAnswer(false)
            setQuestionColor(getRandomAccentExcluding(questionColor))
        }
    }

    return (
        <motion.div
            className="idle-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <BackArrow onClick={onBack} color={questionColor} />
            <Confetti show={showConfetti} />

            <div className="progress-container">
                <div className="progress-bar">
                    <motion.div
                        className="progress-fill"
                        style={{ backgroundColor: colorValues[questionColor] }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
                <div className="progress-text">
                    Question {currentIndex + 1} of {shuffledQuestions.length}
                    {hasScore && ` • Score: ${score}`}
                </div>
            </div>

            <div className="question-container">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -40, opacity: 0 }}
                        className="question-container"
                    >
                        {questionType === 'grammarMCQ' && (
                            <>
                                <div className="question-text">
                                    {currentQuestion.q.split('_____').map((part, i, arr) => (
                                        <span key={i}>
                                            {part}
                                            {i < arr.length - 1 && <span className="blank" style={{ borderColor: colorValues[questionColor] }} />}
                                        </span>
                                    ))}
                                </div>

                                <div className="options-grid">
                                    {currentQuestion.opts.map((opt, i) => {
                                        let className = 'option-btn'
                                        if (showResult) {
                                            if (opt === currentQuestion.ans) className += ' correct'
                                            else if (opt === selectedAnswer) className += ' incorrect'
                                        } else if (opt === selectedAnswer) {
                                            className += ' selected'
                                        }

                                        return (
                                            <motion.button
                                                key={i}
                                                className={className}
                                                onClick={() => !showResult && checkAnswer(opt)}
                                                whileHover={{ scale: showResult ? 1 : 1.02 }}
                                                whileTap={{ scale: showResult ? 1 : 0.98 }}
                                            >
                                                {opt}
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </>
                        )}

                        {questionType === 'fillInBlank' && (
                            <>
                                <div className="question-text">
                                    {currentQuestion.s.split('_____').map((part, i, arr) => (
                                        <span key={i}>
                                            {part}
                                            {i < arr.length - 1 && (
                                                revealedAnswer ? (
                                                    <span style={{ color: colorValues[questionColor], fontWeight: 700 }}>
                                                        {currentQuestion.a}
                                                    </span>
                                                ) : (
                                                    <span className="blank" style={{ borderColor: colorValues[questionColor] }} />
                                                )
                                            )}
                                        </span>
                                    ))}
                                </div>

                                {!revealedAnswer && (
                                    <button
                                        className={`btn btn-solid-${questionColor}`}
                                        onClick={revealAnswer}
                                    >
                                        Reveal Answer
                                    </button>
                                )}

                                {revealedAnswer && (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="reveal-answer"
                                        style={{
                                            backgroundColor: `${colorValues[questionColor]}20`,
                                            border: `3px solid ${colorValues[questionColor]}`,
                                            color: colorValues[questionColor]
                                        }}
                                    >
                                        {currentQuestion.a}
                                    </motion.div>
                                )}
                            </>
                        )}

                        {questionType === 'oddOneOut' && (
                            <>
                                <div className="question-text">
                                    Which word doesn't belong?
                                </div>

                                <div className="options-grid">
                                    {currentQuestion.w.map((word, i) => {
                                        let className = 'option-btn'
                                        if (showResult) {
                                            if (word === currentQuestion.a) className += ' correct'
                                            else if (word === selectedAnswer) className += ' incorrect'
                                        } else if (word === selectedAnswer) {
                                            className += ' selected'
                                        }

                                        return (
                                            <motion.button
                                                key={i}
                                                className={className}
                                                onClick={() => !showResult && checkAnswer(word)}
                                                whileHover={{ scale: showResult ? 1 : 1.02 }}
                                                whileTap={{ scale: showResult ? 1 : 0.98 }}
                                            >
                                                {word}
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </>
                        )}

                        {questionType === 'translateToArabic' && (
                            <>
                                <div className="question-text">
                                    {currentQuestion.en}
                                </div>

                                {!revealedAnswer ? (
                                    <button
                                        className={`btn btn-solid-${questionColor}`}
                                        onClick={revealAnswer}
                                    >
                                        Show Translation / أظهر الترجمة
                                    </button>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`arabic-text card card-${questionColor}`}
                                        style={{ padding: 'var(--space-lg)', maxWidth: '850px' }}
                                    >
                                        {currentQuestion.ar}
                                    </motion.div>
                                )}
                            </>
                        )}

                        {questionType === 'translateToEnglish' && (
                            <>
                                <div className="question-text arabic-text" style={{ fontSize: 'var(--text-lg)' }}>
                                    {currentQuestion.ar}
                                </div>

                                {!revealedAnswer ? (
                                    <button
                                        className={`btn btn-solid-${questionColor}`}
                                        onClick={revealAnswer}
                                    >
                                        Show Translation
                                    </button>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`body-text card card-${questionColor}`}
                                        style={{ padding: 'var(--space-lg)', maxWidth: '850px', textAlign: 'center' }}
                                    >
                                        {currentQuestion.en}
                                    </motion.div>
                                )}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="nav-buttons">
                    <button
                        className={`btn btn-sm btn-${questionColor}`}
                        onClick={prevQuestion}
                        disabled={currentIndex === 0}
                        style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
                    >
                        ← Previous
                    </button>
                    <button
                        className={`btn btn-sm btn-${questionColor}`}
                        onClick={nextQuestion}
                        disabled={currentIndex === shuffledQuestions.length - 1}
                        style={{ opacity: currentIndex === shuffledQuestions.length - 1 ? 0.4 : 1 }}
                    >
                        Next →
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

// ============================================================
// MAIN APP
// ============================================================

// Dark mode background tints
const darkBgTints = {
    cyan: '#0a1a1f',
    pink: '#1a0a12',
    lime: '#0a1a0a',
    orange: '#1a120a',
    purple: '#120a1a'
}

export default function App() {
    const [screen, setScreen] = useState('home')
    const [selectedUnit, setSelectedUnit] = useState(null)
    const [selectedQuestionType, setSelectedQuestionType] = useState(null)
    const [questions, setQuestions] = useState([])
    const [hasScore, setHasScore] = useState(true)
    const [staticColor, setStaticColor] = useState('cyan')
    const [globalAccent, setGlobalAccent] = useState('cyan')
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (screen === 'idle' || screen === 'breathing' || screen === 'revise' || screen === 'info') {
                    setScreen('home')
                } else if (screen.startsWith('idle-')) {
                    setScreen('idle')
                } else if (screen === 'breathing-sigh' || screen === 'breathing-box') {
                    setScreen('breathing')
                } else if (screen === 'revise-questions') {
                    setScreen('revise-types')
                } else if (screen === 'revise-types') {
                    setScreen('revise')
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [screen])

    const navigate = (newScreen, color) => {
        if (color) {
            setStaticColor(color)
        }
        setScreen(newScreen)
    }

    const selectUnit = (unit, color) => {
        setSelectedUnit(unit)
        if (color) setStaticColor(color)
        setScreen('revise-types')
    }

    const selectQuestionType = (type, data, scoreEnabled, color) => {
        setSelectedQuestionType(type)
        setQuestions(data)
        setHasScore(scoreEnabled)
        if (color) setStaticColor(color)
        setScreen('revise-questions')
    }

    // Background color based on current global accent and dark mode
    const appBgColor = isDarkMode ? darkBgTints[globalAccent] : bgTints[globalAccent]

    return (
        <div className="app" style={{ backgroundColor: appBgColor, color: isDarkMode ? '#e8e8e8' : 'inherit' }}>
            <AnimatePresence mode="wait">
                {screen === 'home' && (
                    <MainMenu
                        key="home"
                        onNavigate={navigate}
                        onAccentChange={setGlobalAccent}
                        isDarkMode={isDarkMode}
                        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                    />
                )}

                {screen === 'info' && (
                    <InfoScreen
                        key="info"
                        onBack={() => navigate('home')}
                        onAccentChange={setGlobalAccent}
                    />
                )}

                {screen === 'idle' && (
                    <IdleMenu
                        key="idle"
                        onNavigate={(type) => navigate(`idle-${type}`)}
                        onBack={() => navigate('home')}
                        onAccentChange={setGlobalAccent}
                    />
                )}

                {screen === 'idle-grammar-typewriter' && (
                    <GrammarTypewriter
                        key="grammar"
                        onBack={() => navigate('idle')}
                        onAccentChange={setGlobalAccent}
                    />
                )}

                {screen === 'idle-word-flash' && (
                    <WordFlash
                        key="wordflash"
                        onBack={() => navigate('idle')}
                        onAccentChange={setGlobalAccent}
                    />
                )}

                {screen === 'idle-multi-language' && (
                    <MultiLanguageScroll
                        key="multilang"
                        onBack={() => navigate('idle')}
                        onAccentChange={setGlobalAccent}
                    />
                )}

                {screen === 'breathing' && (
                    <BreathingMenu
                        key="breathing"
                        onNavigate={(type) => navigate(`breathing-${type}`)}
                        onBack={() => navigate('home')}
                        onAccentChange={setGlobalAccent}
                    />
                )}

                {screen === 'breathing-sigh' && (
                    <PsychologicalSigh
                        key="sigh"
                        onBack={() => navigate('breathing')}
                        onAccentChange={setGlobalAccent}
                    />
                )}

                {screen === 'breathing-box' && (
                    <BoxBreathing
                        key="box"
                        onBack={() => navigate('breathing')}
                        onAccentChange={setGlobalAccent}
                    />
                )}

                {screen === 'revise' && (
                    <UnitSelect
                        key="revise"
                        onSelect={selectUnit}
                        onBack={() => navigate('home')}
                        onAccentChange={setGlobalAccent}
                    />
                )}

                {screen === 'revise-types' && (
                    <QuestionTypeSelect
                        key="types"
                        unit={selectedUnit}
                        onSelect={selectQuestionType}
                        onBack={() => navigate('revise')}
                        onAccentChange={setGlobalAccent}
                    />
                )}

                {screen === 'revise-questions' && (
                    <QuestionDisplay
                        key="questions"
                        unit={selectedUnit}
                        questionType={selectedQuestionType}
                        questions={questions}
                        hasScore={hasScore}
                        onBack={() => navigate('revise-types')}
                        staticColor={staticColor}
                        onAccentChange={setGlobalAccent}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
