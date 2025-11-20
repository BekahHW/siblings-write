import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Story {
  id: number;
  story_id: string;
  words: string;
  word_count: number;
  last_contributor_id: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Contributor {
  contributor_id: string;
  name: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contribution {
  id: number;
  story_id: string;
  contributor_id: string;
  word: string;
  word_position: number;
  created_at: string;
}

export interface ContributionWithContributor extends Contribution {
  contributor_name: string | null;
  contributor_url: string | null;
}

export class StoryDatabase {
  /**
   * Get the current active story
   */
  static async getCurrentStory(): Promise<Story | null> {
    const { data, error } = await supabase
      .from('story')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - this is expected when there's no active story
        return null;
      }
      console.error('Error fetching current story:', error);
      return null;
    }

    return data;
  }

  /**
   * Create a new story
   */
  static async createNewStory(): Promise<Story> {
    const { data, error } = await supabase
      .from('story')
      .insert({
        words: '',
        word_count: 0,
        last_contributor_id: null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating new story:', error);
      throw new Error('Failed to create new story');
    }

    return data;
  }

  /**
   * Add or update a contributor
   */
  static async upsertContributor(contributorId: string, name?: string, url?: string): Promise<void> {
    // Check if contributor exists
    const { data: existing } = await supabase
      .from('contributors')
      .select('contributor_id')
      .eq('contributor_id', contributorId)
      .single();

    if (existing) {
      // Update if name or url is provided
      if (name || url) {
        const updates: any = {};
        if (name) updates.name = name;
        if (url) updates.url = url;

        const { error } = await supabase
          .from('contributors')
          .update(updates)
          .eq('contributor_id', contributorId);

        if (error) {
          console.error('Error updating contributor:', error);
        }
      }
    } else {
      // Insert new contributor
      const { error } = await supabase
        .from('contributors')
        .insert({
          contributor_id: contributorId,
          name: name || null,
          url: url || null
        });

      if (error) {
        console.error('Error inserting contributor:', error);
      }
    }
  }

  /**
   * Add a word to the current story
   */
  static async addWord(
    contributorId: string,
    word: string,
    contributorName?: string,
    contributorUrl?: string
  ): Promise<{ success: boolean; story?: Story; error?: string }> {
    let currentStory = await this.getCurrentStory();

    // If no active story exists, create one
    if (!currentStory) {
      currentStory = await this.createNewStory();
    }

    // Check if the contributor is the same as the last contributor
    if (currentStory.last_contributor_id === contributorId) {
      return { success: false, error: 'You cannot submit two consecutive words' };
    }

    // Add or update contributor info
    await this.upsertContributor(contributorId, contributorName, contributorUrl);

    // Add the word to the story
    const newWords = currentStory.words ? `${currentStory.words} ${word}` : word;
    const newWordCount = currentStory.word_count + 1;

    // Update the story
    const { error: updateError } = await supabase
      .from('story')
      .update({
        words: newWords,
        word_count: newWordCount,
        last_contributor_id: contributorId
      })
      .eq('story_id', currentStory.story_id);

    if (updateError) {
      console.error('Error updating story:', updateError);
      return { success: false, error: 'Failed to update story' };
    }

    // Add contribution record
    const { error: contributionError } = await supabase
      .from('contributions')
      .insert({
        story_id: currentStory.story_id,
        contributor_id: contributorId,
        word: word,
        word_position: newWordCount
      });

    if (contributionError) {
      console.error('Error adding contribution:', contributionError);
      return { success: false, error: 'Failed to add contribution' };
    }

    // Get updated story
    const updatedStory = await this.getCurrentStory();
    if (!updatedStory) {
      return { success: false, error: 'Failed to fetch updated story' };
    }

    return { success: true, story: updatedStory };
  }

  /**
   * Archive the current story and create a new one
   */
  static async archiveCurrentStory(): Promise<Story | null> {
    const currentStory = await this.getCurrentStory();
    if (!currentStory) return null;

    // Mark current story as inactive
    const { error } = await supabase
      .from('story')
      .update({ is_active: false })
      .eq('story_id', currentStory.story_id);

    if (error) {
      console.error('Error archiving story:', error);
      return null;
    }

    return currentStory;
  }

  /**
   * Get all contributions for a story
   */
  static async getContributions(storyId: string): Promise<Contribution[]> {
    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .eq('story_id', storyId)
      .order('word_position', { ascending: true });

    if (error) {
      console.error('Error fetching contributions:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get unique contributors for a story with their info
   */
  static async getStoryContributors(storyId: string): Promise<Contributor[]> {
    const { data, error } = await supabase
      .from('contributions')
      .select(`
        contributor_id,
        contributors (
          contributor_id,
          name,
          url,
          created_at,
          updated_at
        )
      `)
      .eq('story_id', storyId);

    if (error) {
      console.error('Error fetching story contributors:', error);
      return [];
    }

    // Extract unique contributors
    const contributorsMap = new Map<string, Contributor>();
    data?.forEach((contribution: any) => {
      if (contribution.contributors) {
        const contributor = contribution.contributors;
        contributorsMap.set(contributor.contributor_id, contributor);
      }
    });

    // Sort by name
    const contributors = Array.from(contributorsMap.values());
    contributors.sort((a, b) => {
      if (!a.name && !b.name) return 0;
      if (!a.name) return 1;
      if (!b.name) return -1;
      return a.name.localeCompare(b.name);
    });

    return contributors;
  }

  /**
   * Get contributor count for a story
   */
  static async getStoryContributorCount(storyId: string): Promise<number> {
    const { count, error } = await supabase
      .from('contributions')
      .select('contributor_id', { count: 'exact', head: true })
      .eq('story_id', storyId);

    if (error) {
      console.error('Error fetching contributor count:', error);
      return 0;
    }

    // Get distinct count using RPC or by fetching all and counting unique
    const { data } = await supabase
      .from('contributions')
      .select('contributor_id')
      .eq('story_id', storyId);

    const uniqueContributors = new Set(data?.map(c => c.contributor_id));
    return uniqueContributors.size;
  }

  /**
   * Get story statistics
   */
  static async getStats(): Promise<{ totalStories: number; totalContributors: number; totalWords: number }> {
    // Get total archived stories
    const { count: totalStories } = await supabase
      .from('story')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false);

    // Get total unique contributors
    const { data: allContributions } = await supabase
      .from('contributions')
      .select('contributor_id');

    const uniqueContributors = new Set(allContributions?.map(c => c.contributor_id));
    const totalContributors = uniqueContributors.size;

    // Get total words from archived stories
    const { data: stories } = await supabase
      .from('story')
      .select('word_count')
      .eq('is_active', false);

    const totalWords = stories?.reduce((sum, story) => sum + story.word_count, 0) || 0;

    return {
      totalStories: totalStories || 0,
      totalContributors,
      totalWords
    };
  }
}

export default StoryDatabase;
