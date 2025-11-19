<script lang="ts">
  import { onMount } from 'svelte';

  // Quiz data
  const questions = [
    {
      question: "When something unexpected happens, how do you respond?",
      answers: [
        { text: "I jump in and try to fix it.", score: { tim: 2 }},
        { text: "I stay calm and look for the right next step.", score: { shepherd: 2 }},
        { text: "I look for how it affects the people I love.", score: { maryJo: 2 }},
        { text: "Approach it steady and practical.", score: { allen: 2 }},
        { text: "Turn it into a community moment.", score: { mrsMinto: 2 }},
        { text: "Get flustered but power through.", score: { mrsMcClauslin: 2 }},
        { text: "Let the moment pull toward darkness.", score: { unChristmas: 3 }}
      ]
    },
    {
      question: "What role do you naturally play in your community?",
      answers: [
        { text: "The hero-in-training.", score: { tim: 2 }},
        { text: "The guide or moral compass.", score: { shepherd: 2 }},
        { text: "The nurturer and stabilizer.", score: { maryJo: 2 }},
        { text: "The dependable worker.", score: { allen: 2 }},
        { text: "The volunteer who knows everyone.", score: { mrsMinto: 2 }},
        { text: "The nervous but helpful neighbor.", score: { mrsMcClauslin: 2 }},
        { text: "The quiet pull toward negativity.", score: { unChristmas: 3 }}
      ]
    },
    {
      question: "Pick the Christmas tradition that feels most like you:",
      answers: [
        { text: "Fixing up decorations and helping things shine.", score: { tim: 2 }},
        { text: "Telling stories that hold meaning.", score: { shepherd: 2 }},
        { text: "Making the house warm and comforting.", score: { maryJo: 2 }},
        { text: "Doing the tough jobs without complaint.", score: { allen: 2 }},
        { text: "Hosting or organizing.", score: { mrsMinto: 2 }},
        { text: "Sending cards and hoping people show up.", score: { mrsMcClauslin: 2 }},
        { text: "Avoiding the season and withdrawing.", score: { unChristmas: 3 }}
      ]
    },
    {
      question: "Which emotion do you lead with?",
      answers: [
        { text: "Hopefulness.", score: { tim: 2 }},
        { text: "Wisdom.", score: { shepherd: 2 }},
        { text: "Love.", score: { maryJo: 2 }},
        { text: "Responsibility.", score: { allen: 2 }},
        { text: "Enthusiasm.", score: { mrsMinto: 2 }},
        { text: "Worry wrapped in sincerity.", score: { mrsMcClauslin: 2 }},
        { text: "Emptiness or numbness.", score: { unChristmas: 3 }}
      ]
    },
    {
      question: "How do you handle conflict?",
      answers: [
        { text: "Try to understand it and fix it.", score: { tim: 2 }},
        { text: "Guide others toward the right path.", score: { shepherd: 2 }},
        { text: "Protect the people you love.", score: { maryJo: 2 }},
        { text: "Stay grounded and handle logistics.", score: { allen: 2 }},
        { text: "Get the group together and sort it out.", score: { mrsMinto: 2 }},
        { text: "Worry a lot, but still help.", score: { mrsMcClauslin: 2 }},
        { text: "Withdraw and let things decay.", score: { unChristmas: 3 }}
      ]
    },
    {
      question: "Choose the object that resonates most:",
      answers: [
        { text: "A carved wooden box full of mysteries.", score: { tim: 2 }},
        { text: "A shepherd's staff.", score: { shepherd: 2 }},
        { text: "A warm knitted blanket.", score: { maryJo: 2 }},
        { text: "A heavy toolbox.", score: { allen: 2 }},
        { text: "A potluck casserole.", score: { mrsMinto: 2 }},
        { text: "A stack of carefully written lists.", score: { mrsMcClauslin: 2 }},
        { text: "A shadow spreading across a candle.", score: { unChristmas: 3 }}
      ]
    },
    {
      question: "How would others describe you?",
      answers: [
        { text: "Brave and earnest.", score: { tim: 2 }},
        { text: "Steady and wise.", score: { shepherd: 2 }},
        { text: "Warm and nurturing.", score: { maryJo: 2 }},
        { text: "Dependable and hardworking.", score: { allen: 2 }},
        { text: "Friendly and social.", score: { mrsMinto: 2 }},
        { text: "Anxious but kind.", score: { mrsMcClauslin: 2 }},
        { text: "A presence that dims the room.", score: { unChristmas: 3 }}
      ]
    },
    {
      question: "Pick a winter setting:",
      answers: [
        { text: "A snowy rooftop under fireworks.", score: { tim: 2 }},
        { text: "Quiet fields under starlight.", score: { shepherd: 2 }},
        { text: "A cozy kitchen filled with warmth.", score: { maryJo: 2 }},
        { text: "A workshop with sawdust on the floor.", score: { allen: 2 }},
        { text: "A bustling holiday market.", score: { mrsMinto: 2 }},
        { text: "A home filled with cluttered memories.", score: { mrsMcClauslin: 2 }},
        { text: "An empty street swallowed by shadows.", score: { unChristmas: 3 }}
      ]
    },
    {
      question: "What do you fear most?",
      answers: [
        { text: "Not doing enough.", score: { tim: 2 }},
        { text: "Failing those I guide.", score: { shepherd: 2 }},
        { text: "Losing the people I love.", score: { maryJo: 2 }},
        { text: "Letting down my family.", score: { allen: 2 }},
        { text: "Disappointing the community.", score: { mrsMinto: 2 }},
        { text: "Being overwhelmed.", score: { mrsMcClauslin: 2 }},
        { text: "The world going dark.", score: { unChristmas: 3 }}
      ]
    },
    {
      question: "What brings out the best in you?",
      answers: [
        { text: "Adventure and purpose.", score: { tim: 2 }},
        { text: "Quiet clarity.", score: { shepherd: 2 }},
        { text: "Family and connection.", score: { maryJo: 2 }},
        { text: "Responsibility and craft.", score: { allen: 2 }},
        { text: "Community spirit.", score: { mrsMinto: 2 }},
        { text: "Support from others.", score: { mrsMcClauslin: 2 }},
        { text: "Isolation and emptiness.", score: { unChristmas: 3 }}
      ]
    }
  ];

  let currentQuestion = 0;
  let scores = {
    tim: 0,
    shepherd: 0,
    maryJo: 0,
    allen: 0,
    mrsMinto: 0,
    mrsMcClauslin: 0,
    unChristmas: 0
  };
  let transitioning = false;
  let selectedAnswer = -1;

  function selectAnswer(answerIndex: number) {
    if (transitioning) return;

    selectedAnswer = answerIndex;
    const answer = questions[currentQuestion].answers[answerIndex];

    // Add scores
    Object.keys(answer.score).forEach(character => {
      scores[character] += answer.score[character];
    });

    // Trigger transition after a brief pause
    setTimeout(() => {
      transitioning = true;

      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          currentQuestion++;
          selectedAnswer = -1;
          transitioning = false;
        } else {
          // Quiz complete - navigate to result
          const result = calculateResult();
          window.location.href = `/works/battle-for-christmas/which-character-are-you/${result}`;
        }
      }, 500);
    }, 300);
  }

  function calculateResult(): string {
    let maxScore = 0;
    let resultCharacter = 'tim';

    Object.keys(scores).forEach(character => {
      if (scores[character] > maxScore) {
        maxScore = scores[character];
        resultCharacter = character;
      }
    });

    // Convert to URL-friendly format
    const urlMap = {
      'maryJo': 'mary-jo',
      'mrsMinto': 'mrs-minto',
      'mrsMcClauslin': 'mrs-mcclauslin',
      'unChristmas': 'unchristmas'
    };

    return urlMap[resultCharacter] || resultCharacter;
  }

  let snowflakes = [];

  onMount(() => {
    // Create snowfall
    for (let i = 0; i < 50; i++) {
      snowflakes.push({
        left: Math.random() * 100,
        animationDuration: 10 + Math.random() * 20,
        animationDelay: Math.random() * 20,
        size: 0.5 + Math.random() * 1.5
      });
    }
    snowflakes = snowflakes;
  });
</script>

<div class="quiz-container">
  <!-- Snowfall overlay -->
  <div class="snowfall">
    {#each snowflakes as flake}
      <div
        class="snowflake"
        style="left: {flake.left}%; animation-duration: {flake.animationDuration}s; animation-delay: {flake.animationDelay}s; font-size: {flake.size}em;"
      >
        ❄
      </div>
    {/each}
  </div>

  <!-- Progress indicator -->
  <div class="progress-indicator">
    {#each questions as _, index}
      <div class="progress-dot" class:active={index === currentQuestion} class:completed={index < currentQuestion}></div>
    {/each}
  </div>

  <!-- Question container -->
  <div class="question-wrapper" class:transitioning>
    <div class="question-card">
      <h2 class="question-header">Question {currentQuestion + 1} of {questions.length}</h2>
      <h3 class="question-text">{questions[currentQuestion].question}</h3>

      <div class="answers-container">
        {#each questions[currentQuestion].answers as answer, index}
          <button
            class="answer-button"
            class:selected={selectedAnswer === index}
            on:click={() => selectAnswer(index)}
            disabled={transitioning}
          >
            <span class="answer-text">{answer.text}</span>
            <div class="answer-glow"></div>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .quiz-container {
    position: relative;
    width: 100%;
    min-height: 80vh;
    background:
      linear-gradient(135deg, rgba(139, 35, 35, 0.05) 0%, rgba(46, 74, 54, 0.05) 100%),
      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23F7F3EC"/><circle cx="30" cy="30" r="3" fill="%23D4282D" opacity="0.3"/><circle cx="170" cy="60" r="3" fill="%23D4282D" opacity="0.3"/><circle cx="90" cy="140" r="3" fill="%232E4A36" opacity="0.3"/><circle cx="150" cy="170" r="3" fill="%23D9B05A" opacity="0.3"/><path d="M50 100 L55 95 L60 100 L55 105 Z" fill="%232E4A36" opacity="0.2"/><path d="M140 50 L145 45 L150 50 L145 55 Z" fill="%232E4A36" opacity="0.2"/></svg>');
    background-size: cover, 200px 200px;
    padding: 3em 2em;
    overflow: hidden;
  }

  .snowfall {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
    z-index: 1;
  }

  .snowflake {
    position: absolute;
    top: -20px;
    color: rgba(255, 255, 255, 0.8);
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
    animation: fall linear infinite;
  }

  @keyframes fall {
    to {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }

  .progress-indicator {
    display: flex;
    justify-content: center;
    gap: 1em;
    margin-bottom: 3em;
    position: relative;
    z-index: 2;
  }

  .progress-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(139, 35, 35, 0.3);
    transition: all 0.3s ease;
  }

  .progress-dot.active {
    background: #8B2323;
    box-shadow: 0 0 20px rgba(139, 35, 35, 0.8);
    transform: scale(1.3);
  }

  .progress-dot.completed {
    background: #2E4A36;
  }

  .question-wrapper {
    position: relative;
    z-index: 2;
    opacity: 1;
    transform: translateY(0);
    transition: all 0.5s ease;
  }

  .question-wrapper.transitioning {
    opacity: 0;
    transform: translateY(-20px);
  }

  .question-card {
    max-width: 800px;
    margin: 0 auto;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 243, 236, 0.98) 100%);
    border-radius: 24px;
    padding: 3em;
    box-shadow:
      0 20px 60px rgba(139, 35, 35, 0.2),
      0 0 0 1px rgba(139, 35, 35, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    position: relative;
    overflow: hidden;
  }

  .question-card::before {
    content: '🌲';
    position: absolute;
    top: 15px;
    left: 15px;
    font-size: 1.5em;
    opacity: 0.15;
  }

  .question-card::after {
    content: '🎁';
    position: absolute;
    top: 15px;
    right: 15px;
    font-size: 1.5em;
    opacity: 0.15;
  }

  .question-header {
    font-family: 'Georgia', serif;
    font-size: 1.2em;
    color: #8B2323;
    text-align: center;
    margin-bottom: 1em;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 600;
  }

  .question-text {
    font-family: 'Georgia', serif;
    font-size: 2em;
    color: #2E4A36;
    text-align: center;
    margin-bottom: 2em;
    line-height: 1.4;
    font-weight: 700;
  }

  .answers-container {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  .answer-button {
    position: relative;
    padding: 1.5em 2em 1.5em 3em;
    background:
      linear-gradient(135deg, rgba(247, 243, 236, 0.9) 0%, rgba(232, 224, 213, 0.9) 100%);
    border: 2px solid rgba(139, 35, 35, 0.2);
    border-radius: 16px;
    font-family: 'Arial', sans-serif;
    font-size: 1.1em;
    color: #2E4A36;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    text-align: left;
    overflow: hidden;
  }

  .answer-button::before {
    content: '❄️';
    position: absolute;
    left: 0.8em;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1em;
    opacity: 0.3;
    transition: all 0.3s ease;
  }

  .answer-button:hover:not(:disabled) {
    transform: translateY(-5px);
    border-color: #D9B05A;
    box-shadow:
      0 10px 30px rgba(217, 176, 90, 0.3),
      0 0 0 3px rgba(217, 176, 90, 0.2);
  }

  .answer-button:hover:not(:disabled)::before {
    opacity: 0.6;
    transform: translateY(-50%) scale(1.2);
  }

  .answer-button.selected {
    background: linear-gradient(135deg, #D9B05A 0%, #C4A053 100%);
    border-color: #8B2323;
    color: white;
    transform: translateY(-8px) scale(1.02);
    box-shadow:
      0 15px 40px rgba(139, 35, 35, 0.4),
      0 0 30px rgba(217, 176, 90, 0.6);
  }

  .answer-button.selected::before {
    content: '🎄';
    opacity: 1;
    transform: translateY(-50%) scale(1.3);
  }

  .answer-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .answer-text {
    position: relative;
    z-index: 2;
  }

  .answer-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(217, 176, 90, 0.4) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.6s ease;
    pointer-events: none;
  }

  .answer-button:hover .answer-glow {
    width: 500px;
    height: 500px;
  }

  @media (max-width: 768px) {
    .quiz-container {
      padding: 2em 1em;
    }

    .question-card {
      padding: 2em 1.5em;
    }

    .question-text {
      font-size: 1.5em;
    }

    .answer-button {
      padding: 1.2em 1.5em;
      font-size: 1em;
    }

    .progress-indicator {
      gap: 0.6em;
      margin-bottom: 2em;
    }

    .progress-dot {
      width: 10px;
      height: 10px;
    }
  }

  @media (max-width: 480px) {
    .question-text {
      font-size: 1.3em;
    }

    .answer-button {
      padding: 1em;
      font-size: 0.95em;
    }

    .question-header {
      font-size: 1em;
    }
  }
</style>
