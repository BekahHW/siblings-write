import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'one-word-story.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS story (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id TEXT NOT NULL,
    words TEXT NOT NULL,
    word_count INTEGER NOT NULL,
    last_contributor_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id TEXT NOT NULL,
    contributor_id TEXT NOT NULL,
    word TEXT NOT NULL,
    word_position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES story(story_id)
  );

  CREATE INDEX IF NOT EXISTS idx_story_active ON story(is_active);
  CREATE INDEX IF NOT EXISTS idx_contributions_story ON contributions(story_id);
  CREATE INDEX IF NOT EXISTS idx_contributions_contributor ON contributions(contributor_id);
`);

export interface Story {
  id: number;
  story_id: string;
  words: string;
  word_count: number;
  last_contributor_id: string | null;
  created_at: string;
  updated_at: string;
  is_active: number;
}

export interface Contribution {
  id: number;
  story_id: string;
  contributor_id: string;
  word: string;
  word_position: number;
  created_at: string;
}

export class StoryDatabase {
  /**
   * Get the current active story
   */
  static getCurrentStory(): Story | null {
    const stmt = db.prepare('SELECT * FROM story WHERE is_active = 1 ORDER BY id DESC LIMIT 1');
    const story = stmt.get() as Story | undefined;
    return story || null;
  }

  /**
   * Create a new story
   */
  static createNewStory(): Story {
    const storyId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO story (story_id, words, word_count, last_contributor_id, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);
    stmt.run(storyId, '', 0, null);

    return this.getCurrentStory()!;
  }

  /**
   * Add a word to the current story
   */
  static addWord(contributorId: string, word: string): { success: boolean; story?: Story; error?: string } {
    let currentStory = this.getCurrentStory();

    // If no active story exists, create one
    if (!currentStory) {
      currentStory = this.createNewStory();
    }

    // Check if the contributor is the same as the last contributor
    if (currentStory.last_contributor_id === contributorId) {
      return { success: false, error: 'You cannot submit two consecutive words' };
    }

    // Add the word to the story
    const newWords = currentStory.words ? `${currentStory.words} ${word}` : word;
    const newWordCount = currentStory.word_count + 1;

    // Update the story
    const updateStmt = db.prepare(`
      UPDATE story
      SET words = ?, word_count = ?, last_contributor_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE story_id = ?
    `);
    updateStmt.run(newWords, newWordCount, contributorId, currentStory.story_id);

    // Add contribution record
    const contributionStmt = db.prepare(`
      INSERT INTO contributions (story_id, contributor_id, word, word_position)
      VALUES (?, ?, ?, ?)
    `);
    contributionStmt.run(currentStory.story_id, contributorId, word, newWordCount);

    // Get updated story
    const updatedStory = this.getCurrentStory()!;

    return { success: true, story: updatedStory };
  }

  /**
   * Archive the current story and create a new one
   */
  static archiveCurrentStory(): Story | null {
    const currentStory = this.getCurrentStory();
    if (!currentStory) return null;

    // Mark current story as inactive
    const stmt = db.prepare('UPDATE story SET is_active = 0 WHERE story_id = ?');
    stmt.run(currentStory.story_id);

    return currentStory;
  }

  /**
   * Get all contributions for a story
   */
  static getContributions(storyId: string): Contribution[] {
    const stmt = db.prepare('SELECT * FROM contributions WHERE story_id = ? ORDER BY word_position ASC');
    return stmt.all(storyId) as Contribution[];
  }

  /**
   * Get story statistics
   */
  static getStats() {
    const totalStoriesStmt = db.prepare('SELECT COUNT(*) as count FROM story WHERE is_active = 0');
    const totalContributorsStmt = db.prepare('SELECT COUNT(DISTINCT contributor_id) as count FROM contributions');
    const totalWordsStmt = db.prepare('SELECT SUM(word_count) as count FROM story WHERE is_active = 0');

    const totalStories = (totalStoriesStmt.get() as { count: number }).count;
    const totalContributors = (totalContributorsStmt.get() as { count: number }).count;
    const totalWords = (totalWordsStmt.get() as { count: number | null }).count || 0;

    return {
      totalStories,
      totalContributors,
      totalWords
    };
  }
}

export default StoryDatabase;
