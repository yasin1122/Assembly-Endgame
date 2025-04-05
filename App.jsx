import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { languages } from './languages'
import { getFarewellText, getRandomWord } from './utils'
import Confetti from 'react-confetti'

export default function AssemblyEndgame() {
  const [currentWord, setCurrentWord] = useState(getRandomWord)
  const [guessedLetters, setGuessedLetters] = useState([])
  const [timeLeft, setTimeLeft] = useState(60) // 1-minute timer

  // Derived values
  const maxWrongGuesses = languages.length - 1
  const wrongGuessCount = guessedLetters.filter(
    letter => !currentWord.includes(letter)
  ).length

  // Remaining guesses
  const remainingGuesses = maxWrongGuesses - wrongGuessCount

  // Win/Loss conditions
  const isGameWon = currentWord
    .split('')
    .every(letter => guessedLetters.includes(letter))
  const isGameLost = wrongGuessCount >= maxWrongGuesses || timeLeft <= 0
  const isGameOver = isGameWon || isGameLost

  // For "Farewell message" logic
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]
  const isLastGuessIncorrect =
    lastGuessedLetter && !currentWord.includes(lastGuessedLetter)

  // Countdown effect
  useEffect(() => {
    if (isGameOver) return
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timerId)
  }, [isGameOver])

  // Handle letter guesses
  function addGuessedLetter(letter) {
    setGuessedLetters(prevLetters =>
      prevLetters.includes(letter) ? prevLetters : [...prevLetters, letter]
    )
  }

  // New Game
  function startNewGame() {
    setCurrentWord(getRandomWord())
    setGuessedLetters([])
    setTimeLeft(60)
  }

  // Render language "chips" (lives)
  const languageElements = languages.map((lang, index) => {
    const isLanguageLost = index < wrongGuessCount
    const className = clsx('chip', isLanguageLost && 'lost')

    return (
      <span
        key={lang.name}
        className={className}
        style={{
          backgroundColor: lang.backgroundColor,
          color: lang.color
        }}>
        {lang.name}
      </span>
    )
  })

  // Render word letters (blanks or revealed)
  const letterElements = currentWord.split('').map((letter, i) => {
    const shouldReveal = isGameLost || guessedLetters.includes(letter)
    const letterClass = clsx(
      isGameLost && !guessedLetters.includes(letter) && 'missed-letter'
    )
    return (
      <span
        key={i}
        className={letterClass}>
        {shouldReveal ? letter.toUpperCase() : ''}
      </span>
    )
  })

  // Render keyboard
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  const keyboardElements = alphabet.split('').map(letter => {
    const isGuessed = guessedLetters.includes(letter)
    const isCorrect = isGuessed && currentWord.includes(letter)
    const isWrong = isGuessed && !currentWord.includes(letter)
    const className = clsx({ correct: isCorrect, wrong: isWrong })

    return (
      <button
        key={letter}
        className={className}
        disabled={isGameOver || isGuessed}
        onClick={() => addGuessedLetter(letter)}>
        {letter.toUpperCase()}
      </button>
    )
  })

  // Conditional styling in status bar
  const gameStatusClass = clsx('game-status', {
    won: isGameWon,
    lost: isGameLost,
    farewell: !isGameOver && isLastGuessIncorrect
  })

  // “Farewell message” or Win/Lose message
  function renderGameStatus() {
    if (!isGameOver && isLastGuessIncorrect) {
      // farewell message
      return (
        <p className='farewell-message'>
          {getFarewellText(languages[wrongGuessCount - 1].name)}
        </p>
      )
    } else if (isGameWon) {
      return (
        <>
          <h2>You win!</h2>
          <p>Well done! 🎉</p>
        </>
      )
    } else if (isGameLost) {
      return (
        <>
          <h2>Game Over!</h2>
          <p>You lose! Better brush up on Assembly. 😭</p>
        </>
      )
    }
    return null
  }

  // Anti-confetti (simplified) for losing
  function AntiConfetti() {
    return (
      <div className='anti-confetti-container'>
        {Array.from({ length: 10 }).map((_, i) => {
          const randomLeft = Math.random() * 100 // 0-100%
          const delay = Math.random() * 1.5 // 0-1.5s
          return (
            <div
              key={i}
              className='anti-confetti-piece'
              style={{
                left: `${randomLeft}%`,
                animationDelay: `${delay}s`
              }}>
              😵
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <main>
      {/* Confetti for winning */}
      {isGameWon && (
        <Confetti
          recycle={false}
          numberOfPieces={600}
        />
      )}
      {/* Anti-confetti for losing */}
      {isGameLost && <AntiConfetti />}

      <header>
        <h1>Assembly: Endgame</h1>
        <p>Guess the word within 8 attempts to defeat Assembly!</p>
      </header>

      <section
        aria-live='polite'
        role='status'
        className={gameStatusClass}>
        {renderGameStatus()}
      </section>

      {/* Scoreboard (time + guesses) */}
      {!isGameOver && (
        <section className='scoreboard'>
          <span>Time Left: {timeLeft}s</span>
          <span>Remaining Guesses: {remainingGuesses}</span>
        </section>
      )}

      {/* Language “lives” */}
      <section className='language-chips'>{languageElements}</section>

      {/* Word blanks */}
      <section className='word'>{letterElements}</section>

      {/* ARIA updates (screen-reader only) */}
      <section
        className='sr-only'
        aria-live='polite'
        role='status'>
        <p>
          {currentWord.includes(lastGuessedLetter)
            ? `Correct! The letter ${lastGuessedLetter} is in the word.`
            : `Sorry, the letter ${lastGuessedLetter} is not in the word.`}
          You have {remainingGuesses} attempts left.
        </p>
      </section>

      {/* On-screen keyboard */}
      <section className='keyboard'>{keyboardElements}</section>

      {/* New Game button only if game ended */}
      {isGameOver && (
        <button
          className='new-game'
          onClick={startNewGame}>
          New Game
        </button>
      )}
    </main>
  )
}
