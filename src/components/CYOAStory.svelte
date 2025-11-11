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

  function makeChoice(choiceId: string, content: string) {
    selectedChoices.push(choiceId);
    revealedContent.push(content);
    currentStep++;
  }

  function reset() {
    currentStep = 0;
    selectedChoices = [];
    revealedContent = [];
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
    <div class="story-content revealed">
      <div class="choice-indicator">
        <strong>You chose:</strong> {selectedChoices[index]}
      </div>
      {@html content.replace(/\n/g, '<br>')}
    </div>
  {/each}

  <!-- Current choice buttons or completion message -->
  {#if currentStep < choiceSections.length}
    <div class="choices">
      <h3 class="choice-prompt">What do you do?</h3>
      <div class="choice-buttons">
        {#each choiceSections[currentStep].choices as choice}
          <button
            class="choice-button"
            onclick={() => makeChoice(choice.id, choice.content)}
          >
            <span class="choice-id">{choice.id}</span>
            <span class="choice-title">{choice.title}</span>
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
    background: rgba(84, 142, 155, 0.05);
    border-radius: 8px;
  }

  .story-content.revealed {
    border-left: 4px solid var(--primary-color);
  }

  .choice-indicator {
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: rgba(84, 142, 155, 0.15);
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .choices {
    margin: 2rem 0;
  }

  .choice-prompt {
    text-align: center;
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
    color: var(--text-main);
  }

  .choice-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .choice-button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem 1.5rem;
    background: rgba(84, 142, 155, 0.05);
    border: 2px solid rgba(107, 111, 114, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
    color: var(--text-main);
  }

  .choice-button:hover {
    border-color: var(--primary-color);
    background: rgba(84, 142, 155, 0.1);
    transform: translateX(4px);
  }

  .choice-id {
    font-weight: bold;
    color: var(--primary-color);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .choice-title {
    font-size: 1.1rem;
    color: var(--text-main);
  }

  .completion {
    text-align: center;
    padding: 2rem;
    background: rgba(84, 142, 155, 0.05);
    border-radius: 8px;
    margin: 2rem 0;
  }

  .completion h3 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
  }

  .completion p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    color: var(--text-main);
  }

  .reset-button {
    padding: 0.75rem 2rem;
    background: var(--primary-color);
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reset-button:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    .cyoa-container {
      padding: 1rem 0.5rem;
    }

    .story-content {
      padding: 1rem;
      font-size: 1rem;
    }

    .choice-button {
      padding: 1rem;
    }

    .choice-title {
      font-size: 1rem;
    }
  }
</style>
