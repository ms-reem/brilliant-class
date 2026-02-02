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

const accentColors = ['cyan', 'pink', 'lime', 'purple', 'red', 'yellow']

const colorValues = {
    cyan: '#00D9FF',
    pink: '#FF006E',
    lime: '#7CB518',
    purple: '#A855F7',
    red: '#FF0000',
    yellow: '#FFBF00'
}

const bgTints = {
    cyan: '#D3F4FB',
    pink: '#F9D3E5',
    lime: '#E5EFD8',
    purple: '#ECE0FA',
    red: '#F9D5D5',
    yellow: '#FFF5D6'
}

const lightTints = {
    cyan: 'rgba(0, 217, 255, 0.15)',
    pink: 'rgba(255, 0, 110, 0.15)',
    lime: 'rgba(124, 181, 24, 0.15)',
    purple: 'rgba(168, 85, 247, 0.15)',
    red: 'rgba(255, 0, 0, 0.15)',
    yellow: 'rgba(255, 191, 0, 0.15)'
}

const textColors = {
    cyan: '#0099b3',
    pink: '#cc0058',
    lime: '#5a8a10',
    purple: '#7c3aed',
    red: '#DD0000',
    yellow: '#E68A00'
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

    const currentAdjective = shuffledAdjectives[adjIndex] || 'Amazing'

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
                Reem's{' '}
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
        content: "My name is Reem Ali Alghamdi. I am an English teacher. I love helping kids learn English in fun ways. I made this app for my students to practice and have fun!"
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

// ============================================================
// FLOATING 4-SIDED STARS COMPONENT
// ============================================================

function FloatingStars({ color }) {
    // Use useMemo without color dependency so stars keep their positions
    // but they will still update color via the style prop
    const stars = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
        id: i,
        size: 12 + Math.random() * 10,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2
    })), [])

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {stars.map(star => (
                <motion.svg
                    key={star.id}
                    width={star.size}
                    height={star.size}
                    viewBox="0 0 24 24"
                    style={{
                        position: 'absolute',
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                    }}
                    initial={{ opacity: 0, scale: 0, rotate: 0 }}
                    animate={{
                        opacity: [0, 1, 1, 0],
                        scale: [0.5, 1, 1, 0.5],
                        rotate: [0, 180, 360],
                        y: [0, -20, 0, 20, 0]
                    }}
                    transition={{
                        duration: star.duration,
                        delay: star.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {/* 4-pointed star */}
                    <motion.path
                        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                        animate={{ fill: colorValues[color] }}
                        transition={{ duration: 0.3 }}
                    />
                </motion.svg>
            ))}
        </div>
    )
}

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
                    {isDarkMode ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="5" />
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    )}
                </motion.button>

                {/* Breathing Icon (moved from main menu) */}
                <motion.button
                    onClick={() => onNavigate('breathing', color)}
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
                        fontSize: 20
                    }}
                    title="Breathing Exercises"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="8" />
                        <path d="M12 8v8M8 12h8" />
                    </svg>
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
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 16v-4M12 8h.01" />
                    </svg>
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
                    style={{ position: 'relative' }}
                >
                    <FloatingStars color={color} />
                    <button
                        className="btn btn-dynamic"
                        style={{ width: '100%', height: '100%', ...buttonStyle, position: 'relative', zIndex: 1 }}
                        onClick={() => onNavigate('unit8-grammar', color)}
                    >
                        Unit 8 Grammar
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
// UNIT 8 GRAMMAR SYSTEM
// ============================================================

// Grammar content data
const unit8GrammarContent = {
    suchSoThat: {
        title: "Such…That / So…That",
        titleAr: "Such…That / So…That",
        introduction: {
            en: "Such and so make the meaning of an adjective or adverb stronger. Such…that and so…that are used to show cause and effect.",
            ar: "Such و so تجعل معنى الصفة أو الظرف أقوى. Such…that و so…that تُستخدم لإظهار السبب والنتيجة."
        },
        note: {
            en: "Note: That is frequently left out in casual speech.",
            ar: "ملاحظة: كلمة That كثيراً ما تُحذف في الكلام غير الرسمي.",
            example: "The book was so popular (that) it sold out within a week."
        },
        patterns: [
            {
                pattern: "such + adjective + noun + that",
                examples: [
                    "It was such a strange experience to see my old friend again that I was speechless.",
                    "Jake is such a determined person that he always manages to succeed."
                ]
            },
            {
                pattern: "so + adjective or adverb + that",
                examples: [
                    "Finding my keys on the beach was so unlikely that I was shocked when I spotted them.",
                    "He ran so quickly that he won the race."
                ]
            },
            {
                pattern: "so + many/few + plural count noun + that",
                examples: [
                    "We discovered so many similarities between our lives that it almost frightened us.",
                    "So few people were accepted into the school that it's amazing we both got in."
                ]
            },
            {
                pattern: "so + much/little + noncount noun + that",
                examples: [
                    "I have so much homework that I won't be able to go out tonight.",
                    "He had so little training that no one thought he would be accepted to the energy company."
                ]
            }
        ]
    },
    reducingAdverbClauses: {
        title: "Reducing Adverb Clauses",
        titleAr: "اختصار جمل الظرف",
        introduction: {
            en: "An adverb clause can be reduced to a participle phrase when the subject of the adverb clause and the subject of the main clause are the same. To do this, drop the subject in the adverb clause, and follow it with a gerund.",
            ar: "يمكن اختصار جملة الظرف إلى عبارة اسم فاعل عندما يكون فاعل جملة الظرف وفاعل الجملة الرئيسية متطابقين. للقيام بذلك، احذف الفاعل في جملة الظرف واتبعها بالاسم المشتق (gerund)."
        },
        examples: [
            {
                original: "After we met online, we discovered that we live in the same town.",
                reduced: "After meeting online, we discovered that we live in the same town."
            },
            {
                original: "I ran into him on the street while I was calling him on my cell phone.",
                reduced: "I ran into him on the street while calling him on my cell phone."
            }
        ]
    }
}

// 50 Examples for both grammars
const unit8Examples = [
    // Such...that / So...that examples (30)
    { text: "It was such a beautiful day that we decided to have a picnic.", grammar: "Such...that", highlight: "such a beautiful day that" },
    { text: "She is such a talented singer that she won the competition.", grammar: "Such...that", highlight: "such a talented singer that" },
    { text: "The movie was so boring that I fell asleep.", grammar: "So...that", highlight: "so boring that" },
    { text: "He spoke so quickly that nobody understood him.", grammar: "So...that", highlight: "so quickly that" },
    { text: "There were so many people that we couldn't find a seat.", grammar: "So many...that", highlight: "so many people that" },
    { text: "She had so little time that she couldn't finish the project.", grammar: "So little...that", highlight: "so little time that" },
    { text: "It was such an exciting game that everyone cheered loudly.", grammar: "Such...that", highlight: "such an exciting game that" },
    { text: "The coffee was so hot that I burned my tongue.", grammar: "So...that", highlight: "so hot that" },
    { text: "He is such a kind person that everyone loves him.", grammar: "Such...that", highlight: "such a kind person that" },
    { text: "The test was so difficult that most students failed.", grammar: "So...that", highlight: "so difficult that" },
    { text: "There was so much noise that I couldn't concentrate.", grammar: "So much...that", highlight: "so much noise that" },
    { text: "So few tickets were available that we couldn't get any.", grammar: "So few...that", highlight: "So few tickets that" },
    { text: "It was such a long journey that we were exhausted.", grammar: "Such...that", highlight: "such a long journey that" },
    { text: "She sang so beautifully that the audience was moved to tears.", grammar: "So...that", highlight: "so beautifully that" },
    { text: "The food was such a disappointment that we left early.", grammar: "Such...that", highlight: "such a disappointment that" },
    { text: "He had so much work that he stayed late every day.", grammar: "So much...that", highlight: "so much work that" },
    { text: "It was such terrible weather that the event was cancelled.", grammar: "Such...that", highlight: "such terrible weather that" },
    { text: "The child was so tired that she fell asleep immediately.", grammar: "So...that", highlight: "so tired that" },
    { text: "There were so many options that I couldn't decide.", grammar: "So many...that", highlight: "so many options that" },
    { text: "He made such a good impression that he got the job.", grammar: "Such...that", highlight: "such a good impression that" },
    { text: "The music was so loud that my ears hurt.", grammar: "So...that", highlight: "so loud that" },
    { text: "She has such incredible patience that nothing bothers her.", grammar: "Such...that", highlight: "such incredible patience that" },
    { text: "The cake was so delicious that I had three slices.", grammar: "So...that", highlight: "so delicious that" },
    { text: "He drove so fast that he got a speeding ticket.", grammar: "So...that", highlight: "so fast that" },
    { text: "It was such a funny joke that everyone laughed.", grammar: "Such...that", highlight: "such a funny joke that" },
    // Reducing Adverb Clauses examples (25)
    { text: "Before leaving the house, she checked all the windows.", grammar: "Reducing Adverb Clauses", highlight: "Before leaving" },
    { text: "While studying for the exam, she listened to music.", grammar: "Reducing Adverb Clauses", highlight: "While studying" },
    { text: "After finishing dinner, they watched a movie.", grammar: "Reducing Adverb Clauses", highlight: "After finishing" },
    { text: "Since moving to the city, he has made many friends.", grammar: "Reducing Adverb Clauses", highlight: "Since moving" },
    { text: "Before starting the project, review all the instructions.", grammar: "Reducing Adverb Clauses", highlight: "Before starting" },
    { text: "While walking in the park, I saw a beautiful bird.", grammar: "Reducing Adverb Clauses", highlight: "While walking" },
    { text: "After completing the course, she received a certificate.", grammar: "Reducing Adverb Clauses", highlight: "After completing" },
    { text: "Before making a decision, consider all options.", grammar: "Reducing Adverb Clauses", highlight: "Before making" },
    { text: "While waiting for the bus, he read a book.", grammar: "Reducing Adverb Clauses", highlight: "While waiting" },
    { text: "After hearing the news, she called her mother.", grammar: "Reducing Adverb Clauses", highlight: "After hearing" },
    { text: "Since graduating from university, he has worked here.", grammar: "Reducing Adverb Clauses", highlight: "Since graduating" },
    { text: "Before entering the room, knock on the door.", grammar: "Reducing Adverb Clauses", highlight: "Before entering" },
    { text: "While cooking dinner, she talked on the phone.", grammar: "Reducing Adverb Clauses", highlight: "While cooking" },
    { text: "After reading the email, he replied immediately.", grammar: "Reducing Adverb Clauses", highlight: "After reading" },
    { text: "Before buying the car, test drive it first.", grammar: "Reducing Adverb Clauses", highlight: "Before buying" },
    { text: "While exercising, listen to motivating music.", grammar: "Reducing Adverb Clauses", highlight: "While exercising" },
    { text: "After watching the documentary, we discussed it.", grammar: "Reducing Adverb Clauses", highlight: "After watching" },
    { text: "Since joining the team, she has improved a lot.", grammar: "Reducing Adverb Clauses", highlight: "Since joining" },
    { text: "Before traveling abroad, get travel insurance.", grammar: "Reducing Adverb Clauses", highlight: "Before traveling" },
    { text: "While driving to work, he listens to podcasts.", grammar: "Reducing Adverb Clauses", highlight: "While driving" },
    { text: "After solving the problem, they celebrated.", grammar: "Reducing Adverb Clauses", highlight: "After solving" },
    { text: "Before submitting the form, verify all information.", grammar: "Reducing Adverb Clauses", highlight: "Before submitting" },
    { text: "While running in the morning, she plans her day.", grammar: "Reducing Adverb Clauses", highlight: "While running" },
    { text: "After receiving feedback, improve your work.", grammar: "Reducing Adverb Clauses", highlight: "After receiving" },
    { text: "Since learning English, he has gained confidence.", grammar: "Reducing Adverb Clauses", highlight: "Since learning" }
]

// 50 Questions for Unit 8
const unit8Questions = [
    { question: "The movie was ___ interesting that I watched it twice.", options: ["so", "such", "very", "too"], correct: 0 },
    { question: "It was ___ a hot day that we stayed indoors.", options: ["so", "such", "very", "too"], correct: 1 },
    { question: "He ran ___ fast that he won the race.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "She is ___ talented artist that galleries want her work.", options: ["so", "such", "such a", "very"], correct: 2 },
    { question: "There were ___ many people that we left early.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "I have ___ much homework that I can't go out.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "___ few students passed that the teacher was disappointed.", options: ["Such", "So", "Such a", "Very"], correct: 1 },
    { question: "It was ___ terrible experience that I never forgot it.", options: ["so", "such", "such a", "very"], correct: 2 },
    { question: "The food was ___ delicious that we ordered more.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "He had ___ little money that he couldn't buy lunch.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "After ___ the book, she wrote a review.", options: ["read", "reading", "to read", "reads"], correct: 1 },
    { question: "While ___ for the train, he checked his email.", options: ["wait", "waiting", "to wait", "waited"], correct: 1 },
    { question: "Before ___ the house, turn off all lights.", options: ["leave", "leaving", "to leave", "left"], correct: 1 },
    { question: "Since ___ to Japan, she has learned Japanese.", options: ["move", "moving", "to move", "moved"], correct: 1 },
    { question: "After ___ dinner, they watched TV.", options: ["have", "having", "to have", "had"], correct: 1 },
    { question: "The cake was ___ sweet that I couldn't eat it.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "She made ___ good impression that she got hired.", options: ["so", "such", "such a", "very"], correct: 2 },
    { question: "Before ___ a decision, think carefully.", options: ["make", "making", "to make", "made"], correct: 1 },
    { question: "While ___ in the garden, I found an old coin.", options: ["dig", "digging", "to dig", "dug"], correct: 1 },
    { question: "He was ___ tired that he fell asleep immediately.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "It was ___ confusing instructions that nobody understood.", options: ["so", "such", "such a", "very"], correct: 1 },
    { question: "There was ___ much traffic that we were late.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "After ___ the email, she responded quickly.", options: ["receive", "receiving", "to receive", "received"], correct: 1 },
    { question: "The story was ___ boring that I stopped reading.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "She speaks ___ quietly that no one can hear her.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "___ completing the project, celebrate your success.", options: ["While", "After", "Since", "During"], correct: 1 },
    { question: "He is ___ honest person that everyone trusts him.", options: ["so", "such", "such an", "very"], correct: 2 },
    { question: "The test was ___ easy that everyone passed.", options: ["such", "so", "such an", "very"], correct: 1 },
    { question: "Before ___ abroad, get your passport.", options: ["travel", "traveling", "to travel", "traveled"], correct: 1 },
    { question: "While ___ to music, she cleaned the house.", options: ["listen", "listening", "to listen", "listened"], correct: 1 },
    { question: "They were ___ friendly neighbors that we miss them.", options: ["so", "such", "such a", "very"], correct: 1 },
    { question: "I had ___ little sleep that I couldn't focus.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "Since ___ the new diet, he has lost weight.", options: ["start", "starting", "to start", "started"], correct: 1 },
    { question: "The weather was ___ nice that we went hiking.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "She has ___ beautiful voice that everyone listens.", options: ["so", "such", "such a", "very"], correct: 2 },
    { question: "After ___ the instructions, begin the test.", options: ["read", "reading", "to read", "reads"], correct: 1 },
    { question: "There were ___ few options that I chose quickly.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "He drove ___ carelessly that he had an accident.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "While ___ the report, he found an error.", options: ["review", "reviewing", "to review", "reviewed"], correct: 1 },
    { question: "The book was ___ popular that it sold out.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "Before ___ conclusions, gather all facts.", options: ["draw", "drawing", "to draw", "drew"], correct: 1 },
    { question: "It was ___ important meeting that everyone attended.", options: ["so", "such", "such an", "very"], correct: 2 },
    { question: "She has ___ many friends that her phone is always busy.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "Since ___ his job, he has been happier.", options: ["change", "changing", "to change", "changed"], correct: 1 },
    { question: "The movie was ___ long that we took a break.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "While ___ dinner, tell me about your day.", options: ["eat", "eating", "to eat", "ate"], correct: 1 },
    { question: "He made ___ many errors that he had to redo it.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "After ___ the course, she got a certificate.", options: ["complete", "completing", "to complete", "completed"], correct: 1 },
    { question: "The pizza was ___ good that we ordered another.", options: ["such", "so", "such a", "very"], correct: 1 },
    { question: "Before ___ the contract, read it carefully.", options: ["sign", "signing", "to sign", "signed"], correct: 1 }
]

// Unit 8 Grammar Menu
function Unit8GrammarMenu({ onNavigate, onBack, onAccentChange }) {
    const { title, color } = useAnimatedTitle({
        onColorChange: onAccentChange,
        initialColor: 'purple'
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

                <div className="flex gap-lg" style={{ marginTop: 30, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <motion.button
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className={`btn btn-${color}`}
                        style={{ minWidth: 260, padding: '25px 50px', fontSize: 32 }}
                        onClick={() => onNavigate('explain')}
                    >
                        Explain
                    </motion.button>

                    <motion.button
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className={`btn btn-${color}`}
                        style={{ minWidth: 260, padding: '25px 50px', fontSize: 32 }}
                        onClick={() => onNavigate('examples')}
                    >
                        Examples
                    </motion.button>

                    <motion.button
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className={`btn btn-${color}`}
                        style={{ minWidth: 260, padding: '25px 50px', fontSize: 32 }}
                        onClick={() => onNavigate('questions')}
                    >
                        Questions
                    </motion.button>
                </div>
            </div>
        </motion.div>
    )
}

// Unit 8 Grammar Explain Component - Granular & Interactive
function Unit8GrammarExplain({ onBack, onAccentChange }) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [accent, setAccent] = useState('purple')
    const [revealed, setRevealed] = useState(false)
    const [typedText, setTypedText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [reductionTypedText, setReductionTypedText] = useState('')
    const [isReductionTyping, setIsReductionTyping] = useState(false)

    // Build granular slides array - one piece of content per slide
    const slides = useMemo(() => {
        const s = []

        // === SUCH/SO THAT SECTION ===

        // Title slide
        s.push({
            type: 'title',
            title: 'Such...That / So...That',
            subtitle: 'Showing Cause and Effect'
        })

        // What they do - English
        s.push({
            type: 'concept',
            label: 'What do they do?',
            text: 'Such and so make the meaning of an adjective or adverb stronger.',
            textAr: 'Such و so تجعل معنى الصفة أو الظرف أقوى.'
        })

        // Purpose - English
        s.push({
            type: 'concept',
            label: 'Purpose',
            text: 'Such...that and so...that show cause and effect.',
            textAr: 'تُستخدم لإظهار السبب والنتيجة.'
        })

        // Pattern 1: such + adj + noun + that
        s.push({
            type: 'pattern-intro',
            pattern: 'such + adjective + noun + that',
            patternNum: 1,
            totalPatterns: 4
        })

        // Pattern 1 examples (one per slide)
        s.push({
            type: 'example',
            patternNum: 1,
            example: 'It was such a strange experience that I was speechless.',
            highlight: 'such a strange experience that'
        })

        s.push({
            type: 'example',
            patternNum: 1,
            example: 'Jake is such a determined person that he always succeeds.',
            highlight: 'such a determined person that'
        })

        // Pattern 2: so + adj/adv + that
        s.push({
            type: 'pattern-intro',
            pattern: 'so + adjective/adverb + that',
            patternNum: 2,
            totalPatterns: 4
        })

        s.push({
            type: 'example',
            patternNum: 2,
            example: 'The sunset was so beautiful that everyone stopped to watch.',
            highlight: 'so beautiful that'
        })

        s.push({
            type: 'example',
            patternNum: 2,
            example: 'He ran so quickly that he won the race.',
            highlight: 'so quickly that'
        })

        // Pattern 3: so + many/few + plural noun + that
        s.push({
            type: 'pattern-intro',
            pattern: 'so + many/few + plural noun + that',
            patternNum: 3,
            totalPatterns: 4
        })

        s.push({
            type: 'example',
            patternNum: 3,
            example: 'There were so many people that we couldn\'t find seats.',
            highlight: 'so many people that'
        })

        s.push({
            type: 'example',
            patternNum: 3,
            example: 'So few tickets remained that we couldn\'t get any.',
            highlight: 'So few tickets remained that'
        })

        // Pattern 4: so + much/little + noncount noun + that
        s.push({
            type: 'pattern-intro',
            pattern: 'so + much/little + noncount noun + that',
            patternNum: 4,
            totalPatterns: 4
        })

        s.push({
            type: 'example',
            patternNum: 4,
            example: 'I have so much homework that I can\'t go out tonight.',
            highlight: 'so much homework that'
        })

        s.push({
            type: 'example',
            patternNum: 4,
            example: 'He had so little training that no one expected him to win.',
            highlight: 'so little training that'
        })

        // Note about "that"
        s.push({
            type: 'tip',
            label: 'Quick Tip',
            text: '"That" can be left out in casual speech.',
            example: 'The book was so popular (that) it sold out.'
        })

        // === REDUCING ADVERB CLAUSES SECTION ===

        // Title slide
        s.push({
            type: 'title',
            title: 'Reducing Adverb Clauses',
            subtitle: 'Making Sentences Shorter'
        })

        // What is it
        s.push({
            type: 'concept',
            label: 'What is this?',
            text: 'We can shorten adverb clauses by removing the subject and changing the verb.',
            textAr: 'يمكننا اختصار جمل الظرف بإزالة الفاعل وتغيير الفعل.'
        })

        // When to use
        s.push({
            type: 'concept',
            label: 'When can we do this?',
            text: 'When the subject of both clauses is the same person or thing.',
            textAr: 'عندما يكون الفاعل هو نفسه في كلا الجملتين.'
        })

        // Reduction examples
        const reductionExamples = [
            { original: 'Before she left the house, she checked the windows.', reduced: 'Before leaving the house, she checked the windows.', highlight: 'Before leaving' },
            { original: 'While he was studying, he listened to music.', reduced: 'While studying, he listened to music.', highlight: 'While studying' },
            { original: 'After they finished dinner, they watched a movie.', reduced: 'After finishing dinner, they watched a movie.', highlight: 'After finishing' },
            { original: 'Since she moved to the city, she has made friends.', reduced: 'Since moving to the city, she has made friends.', highlight: 'Since moving' }
        ]

        reductionExamples.forEach((ex, i) => {
            s.push({
                type: 'reduction',
                original: ex.original,
                reduced: ex.reduced,
                highlight: ex.highlight,
                index: i + 1,
                total: reductionExamples.length
            })
        })

        // Final tip
        s.push({
            type: 'tip',
            label: 'Remember',
            text: 'Keep the time word (before, after, while, since) when reducing.',
            example: 'While waiting → NOT: Waiting'
        })

        return s
    }, [])

    // Typewriter effect for examples
    useEffect(() => {
        const slide = slides[currentSlide]
        if (slide?.type === 'example' || slide?.type === 'reduction') {
            const targetText = slide.type === 'example' ? slide.example : slide.reduced
            setTypedText('')
            setIsTyping(true)
            setRevealed(false)

            let i = 0
            const interval = setInterval(() => {
                if (i < targetText.length) {
                    setTypedText(targetText.slice(0, i + 1))
                    i++
                } else {
                    setIsTyping(false)
                    clearInterval(interval)
                }
            }, 35)

            return () => clearInterval(interval)
        } else {
            setTypedText('')
            setIsTyping(false)
            setRevealed(false)
        }
    }, [currentSlide, slides])

    useEffect(() => {
        onAccentChange?.(accent)
    }, [accent, onAccentChange])

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1)
            setAccent(getRandomAccentExcluding(accent))
            setRevealed(false)
        }
    }

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1)
            setAccent(getRandomAccentExcluding(accent))
            setRevealed(false)
        }
    }

    const slide = slides[currentSlide]

    // Helper to render text with optional highlighting
    const renderHighlightedText = (text, highlight, showHighlight) => {
        if (!highlight || !showHighlight) {
            return <span>{text}</span>
        }

        const idx = text.toLowerCase().indexOf(highlight.toLowerCase())
        if (idx === -1) return <span>{text}</span>

        return (
            <>
                <span>{text.slice(0, idx)}</span>
                <motion.span
                    initial={{ backgroundColor: 'transparent' }}
                    animate={{
                        backgroundColor: `${colorValues[accent]}30`,
                        color: colorValues[accent]
                    }}
                    style={{
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4
                    }}
                >
                    {text.slice(idx, idx + highlight.length)}
                </motion.span>
                <span>{text.slice(idx + highlight.length)}</span>
            </>
        )
    }

    const renderSlide = () => {
        // Title slide
        if (slide.type === 'title') {
            return (
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    style={{ textAlign: 'center', padding: '0 20px' }}
                >
                    <motion.h1
                        style={{
                            fontSize: 48,
                            color: colorValues[accent],
                            marginBottom: 20,
                            fontFamily: 'var(--font-display)'
                        }}
                    >
                        {slide.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 0.3 }}
                        style={{ fontSize: 24 }}
                    >
                        {slide.subtitle}
                    </motion.p>
                </motion.div>
            )
        }

        // Concept slide
        if (slide.type === 'concept') {
            return (
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    style={{ textAlign: 'center', maxWidth: 700, padding: '0 20px' }}
                >
                    <motion.div
                        style={{
                            fontSize: 16,
                            color: colorValues[accent],
                            marginBottom: 20,
                            letterSpacing: 2,
                            textTransform: 'uppercase',
                            fontWeight: 600
                        }}
                    >
                        {slide.label}
                    </motion.div>
                    <motion.p
                        style={{
                            fontSize: 32,
                            lineHeight: 1.6,
                            marginBottom: 25
                        }}
                    >
                        {slide.text}
                    </motion.p>
                    {slide.textAr && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            transition={{ delay: 0.3 }}
                            className="font-arabic"
                            style={{
                                fontSize: 26,
                                direction: 'rtl',
                                color: colorValues[accent]
                            }}
                        >
                            {slide.textAr}
                        </motion.p>
                    )}
                </motion.div>
            )
        }

        // Pattern intro slide
        if (slide.type === 'pattern-intro') {
            return (
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{ textAlign: 'center', padding: '0 20px' }}
                >
                    <motion.div
                        style={{
                            fontSize: 14,
                            opacity: 0.6,
                            marginBottom: 25,
                            letterSpacing: 2
                        }}
                    >
                        PATTERN {slide.patternNum} OF {slide.totalPatterns}
                    </motion.div>
                    <motion.div
                        animate={{
                            boxShadow: [
                                `0 0 20px ${colorValues[accent]}30`,
                                `0 0 40px ${colorValues[accent]}50`,
                                `0 0 20px ${colorValues[accent]}30`
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            display: 'inline-block',
                            padding: '25px 50px',
                            borderRadius: 60,
                            backgroundColor: colorValues[accent],
                            color: 'white',
                            fontSize: 28,
                            fontWeight: 700
                        }}
                    >
                        {slide.pattern}
                    </motion.div>
                </motion.div>
            )
        }

        // Example slide with typewriter - real-time highlighting
        if (slide.type === 'example') {
            // Helper to render typewriter text with real-time highlighting
            const renderTypingWithHighlight = () => {
                const fullText = slide.example
                const highlight = slide.highlight.toLowerCase()
                const currentText = typedText

                // Find where highlight starts in the full text
                const highlightStart = fullText.toLowerCase().indexOf(highlight)
                const highlightEnd = highlightStart + slide.highlight.length

                // Build the display with real-time highlighting
                const chars = []
                for (let i = 0; i < currentText.length; i++) {
                    const isHighlighted = i >= highlightStart && i < highlightEnd
                    chars.push(
                        <span
                            key={i}
                            style={isHighlighted ? {
                                color: colorValues[accent],
                                fontWeight: 700,
                                backgroundColor: `${colorValues[accent]}20`,
                                borderRadius: 2
                            } : {}}
                        >
                            {currentText[i]}
                        </span>
                    )
                }
                return chars
            }

            return (
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    style={{ textAlign: 'center', maxWidth: 800, padding: '0 20px' }}
                >
                    <motion.div
                        style={{
                            fontSize: 14,
                            opacity: 0.5,
                            marginBottom: 30,
                            letterSpacing: 2
                        }}
                    >
                        PATTERN {slide.patternNum} EXAMPLE
                    </motion.div>

                    {/* Typewriter text with real-time highlighting */}
                    <div style={{
                        fontSize: 32,
                        lineHeight: 1.7,
                        minHeight: 80
                    }}>
                        {renderTypingWithHighlight()}
                        {isTyping && (
                            <motion.span
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                                style={{
                                    display: 'inline-block',
                                    width: 3,
                                    height: '1.1em',
                                    backgroundColor: colorValues[accent],
                                    marginLeft: 2,
                                    verticalAlign: 'text-bottom'
                                }}
                            />
                        )}
                    </div>
                </motion.div>
            )
        }

        // Tip slide
        if (slide.type === 'tip') {
            return (
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    style={{ textAlign: 'center', maxWidth: 650, padding: '0 20px' }}
                >
                    <motion.div
                        style={{
                            padding: '30px 40px',
                            borderRadius: 20,
                            backgroundColor: `${colorValues[accent]}15`,
                            border: `3px solid ${colorValues[accent]}`
                        }}
                    >
                        <div style={{
                            fontSize: 16,
                            color: colorValues[accent],
                            marginBottom: 15,
                            fontWeight: 700,
                            letterSpacing: 2
                        }}>
                            {slide.label}
                        </div>
                        <p style={{ fontSize: 26, lineHeight: 1.6, marginBottom: 20 }}>
                            {slide.text}
                        </p>
                        {slide.example && (
                            <div style={{
                                padding: '12px 25px',
                                borderRadius: 10,
                                backgroundColor: `${colorValues[accent]}10`,
                                fontSize: 20,
                                fontStyle: 'italic'
                            }}>
                                {slide.example}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )
        }

        // Reduction slide - reveal button embedded over text with pop animation
        if (slide.type === 'reduction') {
            // Helper for reduction highlighting with typewriter (works on colored bg)
            const renderReductionTypewriter = () => {
                const text = reductionTypedText
                const highlight = slide.highlight.toLowerCase()
                const fullText = slide.reduced
                const highlightStart = fullText.toLowerCase().indexOf(highlight)
                const highlightEnd = highlightStart + slide.highlight.length

                const chars = []
                for (let i = 0; i < text.length; i++) {
                    const isHighlighted = i >= highlightStart && i < highlightEnd
                    chars.push(
                        <span
                            key={i}
                            style={isHighlighted ? {
                                backgroundColor: 'rgba(255,255,255,0.3)',
                                color: 'white',
                                fontWeight: 700,
                                borderRadius: 2,
                                textDecoration: 'underline',
                                textDecorationColor: 'rgba(255,255,255,0.5)'
                            } : {}}
                        >
                            {text[i]}
                        </span>
                    )
                }
                return chars
            }

            return (
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    style={{ textAlign: 'center', maxWidth: 750, padding: '0 20px' }}
                >
                    <motion.div
                        style={{
                            fontSize: 14,
                            opacity: 0.5,
                            marginBottom: 25,
                            letterSpacing: 2
                        }}
                    >
                        REDUCTION {slide.index} OF {slide.total}
                    </motion.div>

                    {/* Original sentence */}
                    <div style={{
                        padding: '18px 25px',
                        borderRadius: 12,
                        backgroundColor: `${colorValues[accent]}10`,
                        border: `2px dashed ${colorValues[accent]}50`,
                        marginBottom: 20,
                        fontSize: 22,
                        lineHeight: 1.6
                    }}>
                        <span style={{ fontSize: 12, opacity: 0.6, display: 'block', marginBottom: 8 }}>ORIGINAL</span>
                        {slide.original}
                    </div>

                    {/* Arrow */}
                    <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{ marginBottom: 20 }}
                    >
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={colorValues[accent]} strokeWidth="2.5">
                            <path d="M12 5v14M5 12l7 7 7-7" />
                        </svg>
                    </motion.div>

                    {/* Reduced - with reveal button embedded */}
                    <motion.div
                        animate={revealed ? { scale: [1, 1.03, 1] } : {}}
                        transition={{ duration: 0.4 }}
                        style={{
                            padding: '18px 25px',
                            borderRadius: 12,
                            backgroundColor: colorValues[accent],
                            color: 'white',
                            fontSize: 22,
                            lineHeight: 1.6,
                            minHeight: 80,
                            position: 'relative',
                            boxShadow: revealed ? `0 8px 30px ${colorValues[accent]}50` : 'none'
                        }}
                    >
                        <span style={{ fontSize: 12, opacity: 0.7, display: 'block', marginBottom: 8 }}>REDUCED</span>

                        {revealed ? (
                            // Show the reduced text with typewriter
                            <>
                                {renderReductionTypewriter()}
                                {isReductionTyping && (
                                    <motion.span
                                        animate={{ opacity: [1, 0, 1] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                        style={{
                                            display: 'inline-block',
                                            width: 3,
                                            height: '1em',
                                            backgroundColor: 'white',
                                            marginLeft: 2,
                                            verticalAlign: 'text-bottom'
                                        }}
                                    />
                                )}
                            </>
                        ) : (
                            // Show reveal button covering the text area
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.25)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setRevealed(true)
                                    // Start typewriter for reduction
                                    setReductionTypedText('')
                                    setIsReductionTyping(true)
                                    let i = 0
                                    const text = slide.reduced
                                    const interval = setInterval(() => {
                                        if (i < text.length) {
                                            setReductionTypedText(text.slice(0, i + 1))
                                            i++
                                        } else {
                                            setIsReductionTyping(false)
                                            clearInterval(interval)
                                        }
                                    }, 30)
                                }}
                                style={{
                                    width: '100%',
                                    padding: '20px',
                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                    border: '2px dashed rgba(255,255,255,0.4)',
                                    borderRadius: 10,
                                    color: 'white',
                                    fontSize: 20,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 10
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                Tap to Reveal
                            </motion.button>
                        )}
                    </motion.div>
                </motion.div>
            )
        }

        return null
    }

    const progress = ((currentSlide + 1) / slides.length) * 100

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

            {/* Progress bar at top */}
            <div style={{
                position: 'absolute',
                top: 25,
                left: 100,
                right: 100,
                height: 6,
                backgroundColor: `${colorValues[accent]}20`,
                borderRadius: 3
            }}>
                <motion.div
                    animate={{ width: `${progress}%` }}
                    style={{
                        height: '100%',
                        backgroundColor: colorValues[accent],
                        borderRadius: 3
                    }}
                />
            </div>

            {/* Slide counter */}
            <div style={{
                position: 'absolute',
                top: 40,
                right: 100,
                fontSize: 14,
                opacity: 0.6
            }}>
                {currentSlide + 1} / {slides.length}
            </div>

            <AnimatePresence mode="wait">
                {renderSlide()}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div style={{
                position: 'absolute',
                bottom: 35,
                display: 'flex',
                gap: 20
            }}>
                <motion.button
                    className={`btn btn-sm btn-${accent}`}
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    style={{ opacity: currentSlide === 0 ? 0.4 : 1, minWidth: 130 }}
                    whileHover={{ scale: currentSlide === 0 ? 1 : 1.05 }}
                >
                    ← Back
                </motion.button>

                <motion.button
                    className={`btn btn-sm btn-${accent}`}
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    style={{ opacity: currentSlide === slides.length - 1 ? 0.4 : 1, minWidth: 130 }}
                    whileHover={{ scale: currentSlide === slides.length - 1 ? 1 : 1.05 }}
                >
                    Next →
                </motion.button>
            </div>
        </motion.div>
    )
}

// Unit 8 Grammar Examples Component with typewriter delete animation
function Unit8GrammarExamples({ onBack, onAccentChange }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [charIndex, setCharIndex] = useState(0)
    const [isAutoPlay, setIsAutoPlay] = useState(false)
    const [accent, setAccent] = useState('cyan')
    const [isDeleting, setIsDeleting] = useState(false)
    const [pendingIndex, setPendingIndex] = useState(null)

    const currentExample = unit8Examples[currentIndex]

    useEffect(() => {
        onAccentChange?.(accent)
    }, [accent, onAccentChange])

    // Typewriter effect with delete animation
    useEffect(() => {
        let timeout

        if (isDeleting) {
            // Deleting phase - faster
            if (charIndex > 0) {
                timeout = setTimeout(() => {
                    setCharIndex(prev => prev - 1)
                }, 20)
            } else {
                // Done deleting, switch to new index
                setIsDeleting(false)
                if (pendingIndex !== null) {
                    setCurrentIndex(pendingIndex)
                    setPendingIndex(null)
                    setAccent(getRandomAccentExcluding(accent))
                }
            }
        } else {
            // Typing phase
            if (charIndex < currentExample.text.length) {
                timeout = setTimeout(() => {
                    setCharIndex(prev => prev + 1)
                }, 40)
            } else if (isAutoPlay) {
                // Wait then start delete animation
                timeout = setTimeout(() => {
                    const nextIdx = currentIndex < unit8Examples.length - 1 ? currentIndex + 1 : 0
                    setPendingIndex(nextIdx)
                    setIsDeleting(true)
                }, 2000)
            }
        }

        return () => clearTimeout(timeout)
    }, [charIndex, currentExample.text.length, isAutoPlay, isDeleting, pendingIndex, currentIndex, accent])

    const goToExample = (newIndex) => {
        if (newIndex === currentIndex) return
        setPendingIndex(newIndex)
        setIsDeleting(true)
    }

    const nextExample = () => {
        if (currentIndex < unit8Examples.length - 1) {
            goToExample(currentIndex + 1)
        }
    }

    const prevExample = () => {
        if (currentIndex > 0) {
            goToExample(currentIndex - 1)
        }
    }

    // Highlight the grammar part
    const displayText = currentExample.text.slice(0, charIndex)
    const highlightStart = currentExample.text.toLowerCase().indexOf(currentExample.highlight.toLowerCase())
    const highlightEnd = highlightStart + currentExample.highlight.length

    const renderText = () => {
        const chars = displayText.split('')
        return chars.map((char, i) => {
            const isHighlighted = i >= highlightStart && i < highlightEnd && i < charIndex
            return (
                <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        color: isHighlighted ? colorValues[accent] : 'inherit',
                        fontWeight: isHighlighted ? 700 : 500
                    }}
                >
                    {char}
                </motion.span>
            )
        })
    }

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

            {/* Counter */}
            <div style={{
                position: 'absolute',
                top: 30,
                right: 100,
                fontSize: 24,
                color: colorValues[accent],
                fontWeight: 600
            }}>
                {currentIndex + 1} / {unit8Examples.length}
            </div>

            {/* Grammar type badge */}
            <motion.div
                key={currentExample.grammar}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    padding: '10px 25px',
                    borderRadius: 30,
                    backgroundColor: `${colorValues[accent]}20`,
                    border: `2px solid ${colorValues[accent]}`,
                    color: colorValues[accent],
                    fontSize: 18,
                    fontWeight: 600,
                    marginBottom: 40
                }}
            >
                {currentExample.grammar}
            </motion.div>

            {/* Typewriter text */}
            <div style={{
                fontSize: 36,
                lineHeight: 1.8,
                textAlign: 'center',
                maxWidth: 900,
                minHeight: 100,
                padding: '0 20px'
            }}>
                {renderText()}
                <motion.span
                    style={{
                        display: 'inline-block',
                        width: 3,
                        height: '1.1em',
                        backgroundColor: colorValues[accent],
                        marginLeft: 3,
                        verticalAlign: 'text-bottom'
                    }}
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                />
            </div>

            {/* Controls */}
            <div style={{
                position: 'absolute',
                bottom: 40,
                display: 'flex',
                gap: 15,
                alignItems: 'center'
            }}>
                <motion.button
                    className={`btn btn-sm btn-${accent}`}
                    onClick={prevExample}
                    disabled={currentIndex === 0}
                    style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
                    whileHover={{ scale: currentIndex === 0 ? 1 : 1.05 }}
                >
                    ← Previous
                </motion.button>

                <motion.button
                    className={`btn btn-sm ${isAutoPlay ? `btn-solid-${accent}` : `btn-${accent}`}`}
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    whileHover={{ scale: 1.05 }}
                    style={{ minWidth: 140 }}
                >
                    {isAutoPlay ? 'Pause' : 'Auto Play'}
                </motion.button>

                <motion.button
                    className={`btn btn-sm btn-${accent}`}
                    onClick={nextExample}
                    disabled={currentIndex === unit8Examples.length - 1 && !isAutoPlay}
                    style={{ opacity: currentIndex === unit8Examples.length - 1 && !isAutoPlay ? 0.4 : 1 }}
                    whileHover={{ scale: currentIndex === unit8Examples.length - 1 && !isAutoPlay ? 1 : 1.05 }}
                >
                    Next →
                </motion.button>
            </div>
        </motion.div>
    )
}

// Unit 8 Grammar Questions Component - Matching QuestionDisplay UI
function Unit8GrammarQuestions({ onBack, onAccentChange }) {
    const [shuffledQuestions, setShuffledQuestions] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [showResult, setShowResult] = useState(false)
    const [score, setScore] = useState(0)
    const [showConfetti, setShowConfetti] = useState(false)
    const [questionColor, setQuestionColor] = useState('pink')

    useEffect(() => {
        setShuffledQuestions(shuffle(unit8Questions))
    }, [])

    useEffect(() => {
        onAccentChange?.(questionColor)
    }, [questionColor, onAccentChange])

    if (shuffledQuestions.length === 0) return null

    const currentQuestion = shuffledQuestions[currentIndex]
    const progress = ((currentIndex + 1) / shuffledQuestions.length) * 100
    const isComplete = currentIndex === shuffledQuestions.length - 1 && showResult

    const checkAnswer = (optionIndex) => {
        if (showResult) return
        setSelectedAnswer(optionIndex)
        setShowResult(true)

        if (optionIndex === currentQuestion.correct) {
            setScore(s => s + 1)
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 1800)
        }
    }

    const nextQuestion = () => {
        if (currentIndex < shuffledQuestions.length - 1) {
            setCurrentIndex(i => i + 1)
            setSelectedAnswer(null)
            setShowResult(false)
            setQuestionColor(getRandomAccentExcluding(questionColor))
        }
    }

    const prevQuestion = () => {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1)
            setSelectedAnswer(null)
            setShowResult(false)
            setQuestionColor(getRandomAccentExcluding(questionColor))
        }
    }

    const restartQuiz = () => {
        setShuffledQuestions(shuffle(unit8Questions))
        setCurrentIndex(0)
        setSelectedAnswer(null)
        setShowResult(false)
        setScore(0)
        setQuestionColor(getRandomAccentExcluding(questionColor))
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

            {/* Progress bar - same as QuestionDisplay */}
            <div className="progress-container">
                <div className="progress-bar">
                    <motion.div
                        className="progress-fill"
                        style={{ backgroundColor: colorValues[questionColor] }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
                <div className="progress-text">
                    Question {currentIndex + 1} of {shuffledQuestions.length} • Score: {score}
                </div>
            </div>

            <div className="question-container">
                <AnimatePresence mode="wait">
                    {!isComplete ? (
                        <motion.div
                            key={currentIndex}
                            initial={{ x: 40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -40, opacity: 0 }}
                            className="question-container"
                        >
                            {/* Question text with blank highlighting */}
                            <div className="question-text">
                                {currentQuestion.question.split('___').map((part, i, arr) => (
                                    <span key={i}>
                                        {part}
                                        {i < arr.length - 1 && <span className="blank" style={{ borderColor: colorValues[questionColor] }} />}
                                    </span>
                                ))}
                            </div>

                            {/* Options grid - matching QuestionDisplay */}
                            <div className="options-grid">
                                {currentQuestion.options.map((option, i) => {
                                    const isSelected = selectedAnswer === i
                                    const isCorrect = i === currentQuestion.correct
                                    let className = 'option-btn'

                                    if (showResult) {
                                        if (isCorrect) className += ' correct'
                                        else if (isSelected && !isCorrect) className += ' incorrect'
                                    } else if (isSelected) {
                                        className += ' selected'
                                    }

                                    return (
                                        <motion.button
                                            key={i}
                                            className={className}
                                            onClick={() => !showResult && checkAnswer(i)}
                                            whileHover={{ scale: showResult ? 1 : 1.02 }}
                                            whileTap={{ scale: showResult ? 1 : 0.98 }}
                                        >
                                            {option}
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 20
                            }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    backgroundColor: colorValues[questionColor],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 20
                                }}
                            >
                                <svg width="50" height="50" viewBox="0 0 24 24" fill="white">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                            </motion.div>
                            <h2 style={{ fontSize: 48, color: colorValues[questionColor] }}>Quiz Complete!</h2>
                            <p style={{ fontSize: 32 }}>
                                Your Score: <strong style={{ color: colorValues[questionColor] }}>{score}</strong> / {shuffledQuestions.length}
                            </p>
                            <p style={{ fontSize: 24, opacity: 0.8 }}>
                                {score === shuffledQuestions.length ? 'Perfect!' :
                                    score >= shuffledQuestions.length * 0.8 ? 'Excellent work!' :
                                        score >= shuffledQuestions.length * 0.6 ? 'Good job! Keep practicing!' :
                                            'Keep studying and try again!'}
                            </p>
                            <motion.button
                                className={`btn btn-${questionColor}`}
                                onClick={restartQuiz}
                                style={{ fontSize: 24, padding: '15px 50px' }}
                                whileHover={{ scale: 1.05 }}
                            >
                                Try Again
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation buttons - same as QuestionDisplay */}
                {!isComplete && (
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
                            disabled={currentIndex === shuffledQuestions.length - 1 || !showResult}
                            style={{ opacity: (currentIndex === shuffledQuestions.length - 1 || !showResult) ? 0.4 : 1 }}
                        >
                            Next →
                        </button>
                    </div>
                )}
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
                if (screen === 'idle' || screen === 'breathing' || screen === 'revise' || screen === 'info' || screen === 'unit8-grammar') {
                    setScreen('home')
                } else if (screen.startsWith('idle-')) {
                    setScreen('idle')
                } else if (screen === 'breathing-sigh' || screen === 'breathing-box') {
                    setScreen('breathing')
                } else if (screen === 'revise-questions') {
                    setScreen('revise-types')
                } else if (screen === 'revise-types') {
                    setScreen('revise')
                } else if (screen.startsWith('unit8-grammar-')) {
                    setScreen('unit8-grammar')
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

                {/* Unit 8 Grammar Routes */}
                {screen === 'unit8-grammar' && (
                    <Unit8GrammarMenu
                        key="unit8-grammar"
                        onNavigate={(type) => navigate(`unit8-grammar-${type}`)}
                        onBack={() => navigate('home')}
                        onAccentChange={setGlobalAccent}
                    />
                )}

                {screen === 'unit8-grammar-explain' && (
                    <Unit8GrammarExplain
                        key="unit8-explain"
                        onBack={() => navigate('unit8-grammar')}
                        onAccentChange={setGlobalAccent}
                    />
                )}

                {screen === 'unit8-grammar-examples' && (
                    <Unit8GrammarExamples
                        key="unit8-examples"
                        onBack={() => navigate('unit8-grammar')}
                        onAccentChange={setGlobalAccent}
                    />
                )}

                {screen === 'unit8-grammar-questions' && (
                    <Unit8GrammarQuestions
                        key="unit8-questions"
                        onBack={() => navigate('unit8-grammar')}
                        onAccentChange={setGlobalAccent}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
