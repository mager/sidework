import { ImageResponse } from '@vercel/og';

const WIDTH = 1200;
const HEIGHT = 630;
const node = (type, style, children) => ({ type, props: { style, children } });

// Accept an already published projection. Do not read drafts or fetch project URLs.
export function showcaseImageTree(content) {
  const { project, handle } = content;
  const name = String(project.name || '').slice(0, 60);
  const description = String(project.tagline || project.description || '').slice(0, 180);
  return node('div', { width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    background: '#fff', color: '#111', padding: '52px 64px', justifyContent: 'space-between' }, [
    node('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 26 }, [
      node('div', { display: 'flex', letterSpacing: '-1px' }, 'sidework.'),
      node('div', { display: 'flex', color: '#606060', fontSize: 20 }, 'Personal software, in view.'),
    ]),
    node('div', { display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24, marginBottom: 24 }, [
      node('div', { display: 'flex', fontSize: 26, color: '#606060' }, `Built by ${String(handle).slice(0, 40)}`),
      node('div', { display: 'flex', fontSize: name.length > 36 ? 62 : 80, lineHeight: 1.08,
        letterSpacing: '-3px', overflowWrap: 'anywhere' }, name),
      node('div', { display: 'flex', fontSize: 30, lineHeight: 1.35, color: '#606060' }, description),
    ]),
    node('div', { display: 'flex', borderTop: '1px solid #d4d4d4', paddingTop: 20,
      fontSize: 20, justifyContent: 'space-between', color: '#606060' }, [
      node('div', { display: 'flex' }, 'A project worth sharing.'),
      node('div', { display: 'flex', color: '#111' }, 'sidework.dev'),
    ]),
  ]);
}

export async function showcaseImageResponse(content, method = 'GET') {
  const headers = { 'Content-Type': 'image/png', 'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow' };
  if (!content?.project?.name || !content?.handle) return new Response('Showcase not found.', { status: 404 });
  if (method === 'HEAD') return new Response(null, { headers });
  try {
    const image = new ImageResponse(showcaseImageTree(content), { width: WIDTH, height: HEIGHT, headers });
    // Finish rendering before sending headers, so failures return a real 503.
    return new Response(await image.arrayBuffer(), { headers });
  } catch {
    return new Response('Showcase image is temporarily unavailable.', { status: 503,
      headers: { 'Cache-Control': 'private, no-store' } });
  }
}
