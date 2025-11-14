import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const blog = await getCollection('blog', ({ data }) => data.hidden !== true);
  const authors = await getCollection('authors');

  // Helper to get author names
  const getAuthorNames = (authorRefs) => {
    if (!authorRefs || authorRefs.length === 0) return '';
    const names = authorRefs.map(ref => {
      const author = authors.find(a => a.id === ref.id);
      return author ? author.data.name : ref.id;
    });
    return names.join(', ');
  };

  return rss({
    title: 'Siblings Write',
    description: 'Young adult fiction, middle grade adventures, and Christmas novels by the Hawrot Siblings. Original short stories and creative writing featuring adventure, family, and wonder.',
    site: context.site,
    items: blog
      .sort((a, b) => new Date(b.data.publishDate) - new Date(a.data.publishDate))
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: new Date(post.data.publishDate),
        author: getAuthorNames(post.data.authors),
        link: `/blog/${post.id}/`,
        categories: ['Fiction', 'Short Stories', 'Creative Writing'],
        customData: `
          <content:encoded><![CDATA[${post.data.description}]]></content:encoded>
          <dc:creator>${getAuthorNames(post.data.authors)}</dc:creator>
        `,
      })),
    customData: `
      <language>en-us</language>
      <category>Fiction</category>
      <category>Young Adult Fiction</category>
      <category>Middle Grade Fiction</category>
      <category>Christmas Fiction</category>
      <category>Short Stories</category>
      <generator>Astro</generator>
      <docs>https://www.rssboard.org/rss-specification</docs>
      <ttl>60</ttl>
      <atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml" />
    `,
    xmlns: {
      content: 'http://purl.org/rss/1.0/modules/content/',
      dc: 'http://purl.org/dc/elements/1.1/',
      atom: 'http://www.w3.org/2005/Atom',
    },
  });
}
