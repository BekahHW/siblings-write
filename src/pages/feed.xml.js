import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('blog', ({ data }) => data.hidden !== true);
  const authors = await getCollection('authors');
  
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.publishDate).valueOf() - new Date(a.data.publishDate).valueOf()
  );
  
  const getAuthorName = (authorId) => {
    const author = authors.find(a => a.id === authorId);
    return author ? author.data.name : 'Hawrot Siblings';
  };
  
  const getGenre = (title, description) => {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('christmas') || text.includes('holiday')) return 'Christmas Fiction';
    if (text.includes('magic') || text.includes('fantasy') || text.includes('mysterious')) return 'Magical Realism';
    if (text.includes('young') || text.includes('teen') || text.includes('school')) return 'Young Adult Fiction';
    if (text.includes('children') || text.includes('kid')) return 'Middle Grade Fiction';
    return 'Contemporary Fiction';
  };
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Siblings Write - Christmas Novels, YA Fiction &amp; Magical Realism</title>
    <description>Original Christmas novels, young adult fiction, and magical realism stories from the Hawrot siblings. Tales of wonder, family, and childhood magic.</description>
    <link>https://www.siblingswrite.com/</link>
    <language>en-US</language>
    <managingEditor>hello@siblingswrite.com (Hawrot Siblings)</managingEditor>
    <webMaster>hello@siblingswrite.com (Hawrot Siblings)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://www.siblingswrite.com/feed.xml" rel="self" type="application/rss+xml"/>
    <category>Christmas Fiction</category>
    <category>Young Adult Fiction</category>
    <category>Middle Grade Stories</category>
    <category>Magical Realism</category>
    <category>Family Stories</category>
    
    ${sortedPosts.slice(0, 20).map(post => {
      const authorName = getAuthorName(post.data.author.id);
      const genre = post.data.genre || getGenre(post.data.title, post.data.description);
      const pubDate = new Date(post.data.publishDate).toUTCString();
      const url = `https://www.siblingswrite.com/blog/${post.id}/`;
      
      return `
    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <description><![CDATA[${post.data.description}]]></description>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${authorName}]]></dc:creator>
      <category><![CDATA[${genre}]]></category>
      ${post.data.keywords ? post.data.keywords.split(',').map(keyword => 
        `<category><![CDATA[${keyword.trim()}]]></category>`
      ).join('') : ''}
    </item>`;
    }).join('')}
  </channel>
</rss>`;

  return new Response(rss.trim(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}