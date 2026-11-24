import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const skillRoot = new URL('./skills/', import.meta.url);
const skillNames = ['sidework-story', 'sidework-init', 'sidework-pr-watch'];

export default {
  id: 'sidework',
  async setup(ctx) {
    const skills = await Promise.all(skillNames.map(async id => {
      const path = fileURLToPath(new URL(`${id}/SKILL.md`, skillRoot));
      const [, frontmatter, content] = (await readFile(path, 'utf8')).split(/^---\s*$/m, 3);
      const description = frontmatter.match(/^description: (.+)$/m)?.[1];
      if (!description || !content) throw new Error(`Sidework skill ${id} is incomplete.`);
      return { id, name: id, description, path, content: content.trim() };
    }));
    const registration = await ctx.skill.transform(editor => {
      for (const skill of skills) editor.add(skill);
    });
    return () => registration.dispose();
  },
};
