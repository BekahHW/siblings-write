<script lang="ts">
  import { user, profile } from '../stores/authStore';

  interface Upgrade {
    type: string;
    name: string;
    description: string;
    price: number;
    priceId: string;
    icon: string;
    features: string[];
  }

  const upgrades: Upgrade[] = [
    {
      type: 'multi_word',
      name: 'Multi-Word Submission',
      description: 'Submit up to 3 words at once in your turn',
      price: 1.00,
      priceId: import.meta.env.STRIPE_MULTI_WORD_PRICE_ID || '',
      icon: '✍️',
      features: [
        'Submit 2-3 words per turn',
        'One-time purchase per game',
        'Speed up story creation'
      ]
    },
    {
      type: 'story_extension',
      name: 'Story Extension',
      description: 'Extend the current story by 100 words',
      price: 1.00,
      priceId: import.meta.env.STRIPE_STORY_EXTENSION_PRICE_ID || '',
      icon: '📖',
      features: [
        'Add 100 words to max length',
        'Per story purchase',
        'Give more space for creativity'
      ]
    },
    {
      type: 'word_edit',
      name: 'Word Edit Access',
      description: 'Edit or delete your submitted words',
      price: 5.00,
      priceId: import.meta.env.STRIPE_WORD_EDIT_PRICE_ID || '',
      icon: '✏️',
      features: [
        'Edit previously submitted words',
        'Delete your contributions',
        'One-time purchase, use forever'
      ]
    },
    {
      type: 'membership',
      name: 'Premium Membership',
      description: 'Get all features and exclusive perks',
      price: 9.99,
      priceId: import.meta.env.STRIPE_MEMBERSHIP_PRICE_ID || '',
      icon: '👑',
      features: [
        'All upgrade features included',
        'Special badge and avatar border',
        'Early access to new themes',
        'Priority voting weight (2x)',
        'Monthly subscription'
      ]
    }
  ];

  let purchasing = false;
  let error = '';

  async function purchaseUpgrade(upgrade: Upgrade) {
    if (!$user) {
      error = 'Please sign in to purchase upgrades';
      return;
    }

    if (!upgrade.priceId) {
      error = 'Upgrade not configured. Please contact support.';
      return;
    }

    purchasing = true;
    error = '';

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceId: upgrade.priceId,
          userId: $user.id,
          upgradeType: upgrade.type
        })
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        error = data.error || 'Failed to create checkout session';
        purchasing = false;
      }
    } catch (e) {
      error = 'Failed to process purchase. Please try again.';
      purchasing = false;
      console.error('Purchase error:', e);
    }
  }
</script>

<div class="upgrades-shop">
  <div class="shop-header">
    <h2>💎 Upgrades Shop</h2>
    <p class="subtitle">Enhance your storytelling experience</p>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <div class="upgrades-grid">
    {#each upgrades as upgrade}
      <div class="upgrade-card">
        <div class="upgrade-icon">{upgrade.icon}</div>
        <h3>{upgrade.name}</h3>
        <p class="description">{upgrade.description}</p>
        
        <ul class="features-list">
          {#each upgrade.features as feature}
            <li>{feature}</li>
          {/each}
        </ul>

        <div class="upgrade-footer">
          <div class="price">${upgrade.price.toFixed(2)}</div>
          <button
            class="btn-purchase"
            on:click={() => purchaseUpgrade(upgrade)}
            disabled={purchasing || !$user}
          >
            {purchasing ? 'Processing...' : 'Purchase'}
          </button>
        </div>
      </div>
    {/each}
  </div>

  {#if !$user}
    <div class="sign-in-prompt">
      <p>Sign in to purchase upgrades and unlock premium features!</p>
    </div>
  {/if}
</div>

<style>
  .upgrades-shop {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .shop-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .shop-header h2 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-main);
  }

  .subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
  }

  .error-message {
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    margin-bottom: 2rem;
    text-align: center;
  }

  .upgrades-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .upgrade-card {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    background: rgba(128, 128, 128, 0.05);
    border: 2px solid rgba(128, 128, 128, 0.2);
    border-radius: 12px;
    transition: all 0.3s;
  }

  .upgrade-card:hover {
    border-color: var(--primary-color);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .upgrade-icon {
    font-size: 3rem;
    text-align: center;
    margin-bottom: 1rem;
  }

  .upgrade-card h3 {
    margin: 0 0 0.5rem 0;
    color: var(--text-main);
    text-align: center;
  }

  .description {
    color: var(--text-secondary);
    text-align: center;
    margin-bottom: 1.5rem;
    flex-grow: 1;
  }

  .features-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem 0;
  }

  .features-list li {
    padding: 0.5rem 0;
    color: var(--text-secondary);
    position: relative;
    padding-left: 1.5rem;
  }

  .features-list li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--primary-color);
    font-weight: 700;
  }

  .upgrade-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 2px solid rgba(128, 128, 128, 0.2);
  }

  .price {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--primary-color);
  }

  .btn-purchase {
    padding: 0.75rem 1.5rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .btn-purchase:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-purchase:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .sign-in-prompt {
    text-align: center;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(74, 158, 255, 0.1), rgba(123, 44, 191, 0.1));
    border: 2px solid var(--primary-color);
    border-radius: 12px;
    margin-top: 2rem;
  }

  .sign-in-prompt p {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-main);
  }

  @media (max-width: 600px) {
    .upgrades-grid {
      grid-template-columns: 1fr;
    }

    .shop-header h2 {
      font-size: 2rem;
    }

    .upgrade-footer {
      flex-direction: column;
      gap: 1rem;
    }

    .btn-purchase {
      width: 100%;
    }
  }
</style>
