import rss from '@astrojs/rss';
import { SITE } from '@/lib/config';
import { getAllEssays, getAllPosts, getAllProjects, getAllPublications } from '@/lib/utils';

export async function GET(context: { site?: URL }) {
  const [posts, essays, projects, publications] = await Promise.all([
    getAllPosts(),
    getAllEssays(),
    getAllProjects(),
    getAllPublications(),
  ]);

  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.slug}/`,
      categories: post.data.tags,
    })),
    ...essays.map((essay) => ({
      title: essay.data.title,
      description: essay.data.description,
      pubDate: essay.data.date,
      link: `/essays/${essay.slug}/`,
    })),
    ...projects.map((project) => ({
      title: project.data.title,
      description: project.data.description,
      pubDate: project.data.date,
      link: `/projects/${project.slug}/`,
      categories: project.data.tags,
    })),
    ...publications.map((publication) => ({
      title: publication.data.title,
      description: publication.data.abstract,
      pubDate: new Date(Date.UTC(publication.data.year, 0, 1)),
      link: publication.data.doi ? `https://doi.org/${publication.data.doi}` : '/publications/',
      categories: publication.data.tags,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items,
  });
}
