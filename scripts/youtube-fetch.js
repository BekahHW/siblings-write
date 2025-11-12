import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHANNEL_ID = 'UCd8nQv9HKBFJzZqCRJZgZVw'; // The Hawrot Siblings channel
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'youtube-videos.json');

/**
 * Parses XML feed from YouTube
 */
function parseXMLFeed(xmlText) {
  const videos = [];

  // Match all entry blocks
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  const entries = xmlText.match(entryRegex) || [];

  for (const entry of entries) {
    // Extract video ID
    const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    // Extract title
    const titleMatch = entry.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : null;

    // Extract published date
    const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
    const publishedAt = publishedMatch ? publishedMatch[1] : null;

    // Extract description (media:description)
    const descMatch = entry.match(/<media:description>(.*?)<\/media:description>/);
    let description = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : '';

    // Thumbnail URL
    const thumbnailMatch = entry.match(/<media:thumbnail url="(.*?)"/);
    const thumbnail = thumbnailMatch ? thumbnailMatch[1] : `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

    if (videoId && title && publishedAt) {
      videos.push({
        id: videoId,
        title: title,
        publishedAt: publishedAt,
        thumbnail: thumbnail,
        description: description
      });
    }
  }

  return videos;
}

/**
 * Fetches videos from YouTube RSS feed
 */
async function fetchYouTubeVideos() {
  try {
    console.log('Fetching YouTube videos from RSS feed...');

    const response = await fetch(RSS_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const videos = parseXMLFeed(xmlText);

    console.log(`Found ${videos.length} videos`);

    // Ensure data directory exists
    const dataDir = path.dirname(OUTPUT_FILE);
    await fs.mkdir(dataDir, { recursive: true });

    // Write to file
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(videos, null, 2));
    console.log(`Saved video data to ${OUTPUT_FILE}`);

    // Display video titles
    console.log('\nLatest videos:');
    videos.slice(0, 5).forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   Published: ${new Date(video.publishedAt).toLocaleDateString()}`);
      console.log(`   ID: ${video.id}`);
    });

    return videos;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchYouTubeVideos()
    .then(() => {
      console.log('\n✅ YouTube videos fetched successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed to fetch YouTube videos:', error.message);
      process.exit(1);
    });
}

export { fetchYouTubeVideos };
