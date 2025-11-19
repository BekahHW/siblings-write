<script lang="ts">
  interface Slide {
    type: 'before-after' | 'plot' | 'character' | 'insight' | 'media';
    title: string;
    content: string;
    before?: string;
    after?: string;
    videoUrl?: string;
    audioUrl?: string;
    image?: string;
    duration?: number;
  }

  interface Props {
    slides: Slide[];
    title: string;
  }

  let { slides, title }: Props = $props();

  // State
  let currentSlide = $state(0);
  let isPaused = $state(false);
  let isCompleted = $state(false);
  let touchStartX = $state(0);
  let touchEndX = $state(0);
  let progress = $state(0);
  let progressInterval: number | null = null;

  // Navigation functions
  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      resetProgress();
    } else {
      isCompleted = true;
      clearProgressInterval();
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      currentSlide--;
      resetProgress();
    }
  }

  function goToSlide(index: number) {
    if (index >= 0 && index < slides.length) {
      currentSlide = index;
      resetProgress();
      isCompleted = false;
    }
  }

  function resetStory() {
    currentSlide = 0;
    isCompleted = false;
    isPaused = false;
    resetProgress();
  }

  // Progress bar management
  function resetProgress() {
    progress = 0;
    clearProgressInterval();
    startProgress();
  }

  function clearProgressInterval() {
    if (progressInterval !== null) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  function startProgress() {
    const slide = slides[currentSlide];
    const duration = slide.duration || 5; // Default 5 seconds
    const increment = 100 / (duration * 10); // Update every 100ms

    clearProgressInterval();

    progressInterval = setInterval(() => {
      if (!isPaused && !isCompleted) {
        progress += increment;
        if (progress >= 100) {
          nextSlide();
        }
      }
    }, 100) as unknown as number;
  }

  // Touch/swipe handling
  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.changedTouches[0].screenX;
  }

  function handleTouchEnd(e: TouchEvent) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next slide
        nextSlide();
      } else {
        // Swipe right - previous slide
        prevSlide();
      }
    }
  }

  // Click/tap zones (left third = prev, right two-thirds = next)
  function handleTap(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) {
      prevSlide();
    } else {
      nextSlide();
    }
  }

  // Pause on hold
  function handlePauseStart() {
    isPaused = true;
  }

  function handlePauseEnd() {
    isPaused = false;
  }

  // Cleanup on component unmount
  $effect(() => {
    startProgress();

    return () => {
      clearProgressInterval();
    };
  });

  // Restart progress when slide changes
  $effect(() => {
    // This runs when currentSlide changes
    currentSlide; // Access to trigger reactivity
    if (!isCompleted) {
      resetProgress();
    }
  });

  // Helper to get YouTube embed URL
  function getYouTubeEmbedUrl(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1`;
    }
    return null;
  }
</script>

<div class="story-container"
     ontouchstart={handleTouchStart}
     ontouchend={handleTouchEnd}
     onmousedown={handlePauseStart}
     onmouseup={handlePauseEnd}
     onmouseleave={handlePauseEnd}>

  {#if !isCompleted}
    <!-- Progress bars -->
    <div class="progress-bars">
      {#each slides as _, index}
        <div class="progress-bar-container">
          <div
            class="progress-bar"
            class:active={index === currentSlide}
            class:completed={index < currentSlide}
            style="width: {index === currentSlide ? progress : (index < currentSlide ? 100 : 0)}%"
          ></div>
        </div>
      {/each}
    </div>

    <!-- Header -->
    <div class="story-header">
      <h2 class="story-title">{title}</h2>
      <div class="slide-counter">{currentSlide + 1} / {slides.length}</div>
    </div>

    <!-- Current slide content -->
    <div class="slide-content" onclick={handleTap}>
      {#if slides[currentSlide]}
        {@const slide = slides[currentSlide]}

        <div class="slide-type-badge {slide.type}">
          {#if slide.type === 'before-after'}
            Before & After
          {:else if slide.type === 'plot'}
            Plot Evolution
          {:else if slide.type === 'character'}
            Character Development
          {:else if slide.type === 'insight'}
            Behind the Scenes
          {:else if slide.type === 'media'}
            Media
          {/if}
        </div>

        <h3 class="slide-title">{slide.title}</h3>

        <!-- Media content -->
        {#if slide.videoUrl}
          <div class="media-container">
            {#if slide.videoUrl.includes('youtube.com') || slide.videoUrl.includes('youtu.be')}
              {@const embedUrl = getYouTubeEmbedUrl(slide.videoUrl)}
              {#if embedUrl}
                <iframe
                  src={embedUrl}
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  class="video-embed"
                ></iframe>
              {/if}
            {:else}
              <video src={slide.videoUrl} controls class="video-player"></video>
            {/if}
          </div>
        {/if}

        {#if slide.audioUrl}
          <div class="audio-container">
            <audio src={slide.audioUrl} controls class="audio-player"></audio>
          </div>
        {/if}

        {#if slide.image}
          <div class="image-container">
            <img src={slide.image} alt={slide.title} class="slide-image" />
          </div>
        {/if}

        <!-- Before/After comparison -->
        {#if slide.type === 'before-after' && slide.before && slide.after}
          <div class="before-after">
            <div class="comparison-section before">
              <h4>Before</h4>
              <div class="comparison-text">{slide.before}</div>
            </div>
            <div class="comparison-arrow">→</div>
            <div class="comparison-section after">
              <h4>After</h4>
              <div class="comparison-text">{slide.after}</div>
            </div>
          </div>
        {/if}

        <!-- Main content -->
        <div class="slide-text">
          {@html slide.content.replace(/\n/g, '<br>')}
        </div>
      {/if}
    </div>

    <!-- Navigation hints -->
    <div class="navigation-hints">
      <div class="hint-left">
        {#if currentSlide > 0}
          <span>← Tap to go back</span>
        {/if}
      </div>
      <div class="hint-right">
        <span>Tap to continue →</span>
      </div>
    </div>
  {:else}
    <!-- Completion screen -->
    <div class="completion-screen">
      <div class="completion-content">
        <h2>That's All!</h2>
        <p>Thanks for exploring the story behind "{title}"</p>
        <button class="restart-button" onclick={resetStory}>
          Watch Again
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .story-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    min-height: 80vh;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 168, 212, 0.15));
    border-radius: 20px;
    overflow: hidden;
    box-shadow:
      0 20px 60px rgba(124, 58, 237, 0.15),
      0 8px 20px rgba(0, 0, 0, 0.1);
    user-select: none;
    cursor: pointer;
  }

  /* Progress bars */
  .progress-bars {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    gap: 4px;
    padding: 12px;
    z-index: 10;
  }

  .progress-bar-container {
    flex: 1;
    height: 3px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #fff, rgba(255, 255, 255, 0.9));
    transition: width 0.1s linear;
    border-radius: 2px;
  }

  .progress-bar.completed {
    background: #fff;
  }

  /* Header */
  .story-header {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 9;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, transparent 100%);
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .story-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    font-family: var(--font-family-display);
    margin: 0;
  }

  .slide-counter {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  }

  /* Slide content */
  .slide-content {
    padding: 120px 24px 80px;
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .slide-type-badge {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  }

  .slide-type-badge.before-after {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .slide-type-badge.plot {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  .slide-type-badge.character {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }

  .slide-type-badge.insight {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .slide-type-badge.media {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    color: #333;
  }

  .slide-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 24px;
    font-family: var(--font-family-display);
    line-height: 1.3;
  }

  .slide-text {
    font-size: 1.1rem;
    line-height: 1.7;
    color: var(--text-main);
    margin-top: 16px;
  }

  /* Media containers */
  .media-container,
  .image-container {
    margin: 20px 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .video-embed,
  .video-player {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
  }

  .slide-image {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 12px;
  }

  .audio-container {
    margin: 20px 0;
  }

  .audio-player {
    width: 100%;
    border-radius: 8px;
  }

  /* Before/After comparison */
  .before-after {
    display: flex;
    gap: 16px;
    margin: 24px 0;
    align-items: center;
  }

  .comparison-section {
    flex: 1;
    padding: 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
  }

  .comparison-section.before {
    border: 2px solid rgba(245, 87, 108, 0.3);
  }

  .comparison-section.after {
    border: 2px solid rgba(102, 126, 234, 0.3);
  }

  .comparison-section h4 {
    font-size: 0.85rem;
    text-transform: uppercase;
    font-weight: 700;
    margin: 0 0 8px 0;
    letter-spacing: 0.5px;
  }

  .comparison-section.before h4 {
    color: #f5576c;
  }

  .comparison-section.after h4 {
    color: #667eea;
  }

  .comparison-text {
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--text-main);
  }

  .comparison-arrow {
    font-size: 2rem;
    color: var(--primary-color);
    font-weight: 700;
    flex-shrink: 0;
  }

  /* Navigation hints */
  .navigation-hints {
    position: absolute;
    bottom: 20px;
    left: 24px;
    right: 24px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    z-index: 9;
  }

  .hint-left,
  .hint-right {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    backdrop-filter: blur(10px);
  }

  /* Completion screen */
  .completion-screen {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: linear-gradient(135deg, rgba(249, 168, 212, 0.2), rgba(103, 232, 249, 0.2));
  }

  .completion-content {
    text-align: center;
  }

  .completion-content h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-family: var(--font-family-display);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .completion-content p {
    font-size: 1.15rem;
    margin-bottom: 2rem;
    color: var(--text-main);
  }

  .restart-button {
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
  }

  .restart-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .story-container {
      border-radius: 0;
      max-width: 100%;
    }

    .story-title {
      font-size: 1rem;
    }

    .slide-title {
      font-size: 1.5rem;
    }

    .slide-text {
      font-size: 1rem;
    }

    .before-after {
      flex-direction: column;
      gap: 12px;
    }

    .comparison-arrow {
      transform: rotate(90deg);
    }

    .navigation-hints {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .slide-content {
      padding: 100px 16px 60px;
    }

    .completion-content h2 {
      font-size: 2rem;
    }

    .restart-button {
      padding: 0.875rem 2rem;
      font-size: 1rem;
    }
  }
</style>
