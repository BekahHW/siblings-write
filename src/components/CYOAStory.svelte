<script lang="ts">
  interface Choice {
    id: string;
    title: string;
    content: string;
  }

  interface ChoiceSection {
    number: number;
    choices: Choice[];
  }

  interface Props {
    rawContent: string;
  }

  let { rawContent }: Props = $props();

  // Parse the markdown content into structured data
  function parseContent(content: string) {
    const lines = content.split('\n');
    let initialContent = '';
    let choiceSections: ChoiceSection[] = [];
    let currentSection: ChoiceSection | null = null;
    let currentChoice: Choice | null = null;
    let inChoice = false;
    let inInitial = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for choice section header (## CHOICE_1, ## CHOICE_2, etc.)
      const choiceSectionMatch = line.match(/^##\s+CHOICE_(\d+)\s*$/);
      if (choiceSectionMatch) {
        inInitial = false;
        if (currentSection && currentChoice) {
          currentSection.choices.push(currentChoice);
        }
        if (currentSection) {
          choiceSections.push(currentSection);
        }
        currentSection = {
          number: parseInt(choiceSectionMatch[1]),
          choices: []
        };
        currentChoice = null;
        continue;
      }

      // Check for choice option (### 1a: Title, ### 1b: Title, etc.)
      const choiceMatch = line.match(/^###\s+(\d+[a-c]):\s+(.+)$/);
      if (choiceMatch && currentSection) {
        if (currentChoice) {
          currentSection.choices.push(currentChoice);
        }
        currentChoice = {
          id: choiceMatch[1],
          title: choiceMatch[2].trim(),
          content: ''
        };
        inChoice = true;
        continue;
      }

      // Add content to appropriate place
      if (inInitial) {
        initialContent += line + '\n';
      } else if (currentChoice && inChoice) {
        currentChoice.content += line + '\n';
      }
    }

    // Don't forget to add the last choice and section
    if (currentSection && currentChoice) {
      currentSection.choices.push(currentChoice);
    }
    if (currentSection) {
      choiceSections.push(currentSection);
    }

    return { initialContent, choiceSections };
  }

  const { initialContent, choiceSections } = parseContent(rawContent);

  // Track current progress
  let currentStep = $state(0);
  let selectedChoices = $state<string[]>([]);
  let revealedContent = $state<string[]>([]);
  let isAnimating = $state(false);
  let showingConfetti = $state(false);

  // Confetti effect
  function createConfetti(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    const colors = ['#7c3aed', '#c084fc', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#fa709a', '#fee140'];

    // Create particles
    for (let i = 0; i < 80; i++) {
      const angle = (Math.PI * 2 * i) / 80;
      const velocity = 3 + Math.random() * 8;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3
      });
    }

    let frameCount = 0;
    const gravity = 0.3;

    function animate() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;

      particles.forEach(p => {
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (frameCount < 180) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(canvas);
      }
    }

    animate();
  }

  async function makeChoice(choiceId: string, content: string, event: MouseEvent) {
    if (isAnimating) return;

    isAnimating = true;
    showingConfetti = true;

    // Create confetti effect
    createConfetti(event);

    // Wait for confetti animation
    await new Promise(resolve => setTimeout(resolve, 1000));

    selectedChoices.push(choiceId);
    revealedContent.push(content);
    currentStep++;

    showingConfetti = false;
    isAnimating = false;
  }

  function reset() {
    currentStep = 0;
    selectedChoices = [];
    revealedContent = [];
    isAnimating = false;
    showingConfetti = false;
  }

  // Get the current choice section to display
  $effect(() => {
    // This effect runs when currentStep changes
    // We can use it for any side effects if needed
  });
</script>

<div class="cyoa-container">
  <!-- Initial Content -->
  <div class="story-content">
    {@html initialContent.replace(/\n/g, '<br>')}
  </div>

  <!-- Revealed content from previous choices -->
  {#each revealedContent as content, index}
    <div class="story-content revealed" style="animation: fadeSlideIn 0.8s ease-out;">
      {@html content.replace(/\n/g, '<br>')}
    </div>
  {/each}

  <!-- Current choice buttons or completion message -->
  {#if currentStep < choiceSections.length}
    <div class="choices">
      <h3 class="choice-prompt">What do you do?</h3>
      <div class="choice-cards">
        {#each choiceSections[currentStep].choices as choice, index}
          <button
            class="choice-card"
            class:disabled={isAnimating}
            onclick={(e) => makeChoice(choice.id, choice.content, e)}
            style="animation: cardEntrance 0.6s ease-out {index * 0.1}s backwards;"
          >
            <div class="card-glow"></div>
            <div class="card-content">
              <span class="choice-title">{choice.title}</span>
              <div class="card-arrow">→</div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {:else if currentStep > 0}
    <div class="completion">
      <h3>The End</h3>
      <p>Thank you for reading! Would you like to start over and make different choices?</p>
      <button class="reset-button" onclick={reset}>
        Start Over
      </button>
    </div>
  {/if}
</div>

<style>
  .cyoa-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .story-content {
    font-size: 1.1rem;
    line-height: 1.8;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(249, 168, 212, 0.08), rgba(139, 92, 246, 0.08));
    border-radius: 12px;
    border: 1px solid rgba(124, 58, 237, 0.15);
    backdrop-filter: blur(10px);
  }

  .story-content.revealed {
    border-left: 4px solid transparent;
    border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1;
    position: relative;
    overflow: hidden;
  }

  .story-content.revealed::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.05), transparent);
    pointer-events: none;
  }

  .choices {
    margin: 3rem 0;
  }

  .choice-prompt {
    text-align: center;
    font-size: 1.5rem;
    margin-bottom: 2rem;
    color: var(--text-main);
    font-family: var(--font-family-display);
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .choice-cards {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .choice-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(249, 168, 212, 0.1));
    border: 2px solid rgba(124, 58, 237, 0.2);
    border-radius: 16px;
    cursor: pointer;
    text-align: left;
    width: 100%;
    color: var(--text-main);
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px rgba(124, 58, 237, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .choice-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  .card-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  .choice-card:hover .card-glow {
    opacity: 1;
    animation: glowPulse 2s ease-in-out infinite;
  }

  @keyframes glowPulse {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.1);
    }
  }

  .choice-card:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: var(--primary-color);
    box-shadow:
      0 20px 40px rgba(124, 58, 237, 0.25),
      0 10px 20px rgba(124, 58, 237, 0.15),
      0 0 0 1px rgba(124, 58, 237, 0.1);
  }

  .choice-card:hover::before {
    opacity: 1;
  }

  .choice-card:active {
    transform: translateY(-4px) scale(1.01);
  }

  .choice-card.disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  .card-content {
    position: relative;
    z-index: 1;
    padding: 1.5rem 2rem;
    width: 100%;
    display: flex;
    align-items: center;
  }

  .choice-title {
    flex: 1;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-main);
    line-height: 1.4;
    font-family: var(--font-family-sans);
  }

  .card-arrow {
    position: absolute;
    right: 2rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.5rem;
    color: var(--primary-color);
    transition: transform 0.3s ease;
  }

  .choice-card:hover .card-arrow {
    transform: translateY(-50%) translateX(5px);
  }

  .completion {
    text-align: center;
    padding: 3rem 2rem;
    background: linear-gradient(135deg, rgba(249, 168, 212, 0.1), rgba(103, 232, 249, 0.1));
    border-radius: 16px;
    margin: 2rem 0;
    border: 2px solid rgba(124, 58, 237, 0.2);
    position: relative;
    overflow: hidden;
  }

  .completion::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.1), transparent 70%);
    animation: glowPulse 3s ease-in-out infinite;
  }

  .completion h3 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-family: var(--font-family-display);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
    z-index: 1;
  }

  .completion p {
    font-size: 1.15rem;
    margin-bottom: 2rem;
    color: var(--text-main);
    position: relative;
    z-index: 1;
  }

  .reset-button {
    position: relative;
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    font-family: var(--font-family-sans);
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
    z-index: 1;
    overflow: hidden;
  }

  .reset-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .reset-button:hover::before {
    opacity: 1;
  }

  .reset-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
  }

  .reset-button:active {
    transform: translateY(-1px);
  }

  /* Animations */
  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes cardEntrance {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .cyoa-container {
      padding: 1rem 0.5rem;
    }

    .story-content {
      padding: 1.25rem;
      font-size: 1rem;
    }

    .choice-prompt {
      font-size: 1.3rem;
    }

    .card-content {
      padding: 1.25rem 1.5rem;
    }

    .choice-title {
      font-size: 1.05rem;
    }

    .card-arrow {
      right: 1.5rem;
      font-size: 1.25rem;
    }

    .completion h3 {
      font-size: 2rem;
    }

    .completion p {
      font-size: 1rem;
    }

    .reset-button {
      padding: 0.875rem 2rem;
      font-size: 1rem;
    }
  }

  @media (max-width: 480px) {
    .choice-cards {
      gap: 1rem;
    }

    .card-content {
      padding: 1rem 1.25rem;
    }

    .choice-card:hover {
      transform: translateY(-4px) scale(1.01);
    }
  }
</style>
