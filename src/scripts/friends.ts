import { FOLLOW_KEY } from './browser-workspace.mjs';
const get = (id: string) => document.getElementById(id)!;
const message = (text: string) => { get('friends-status').textContent = text; get('friends-status').hidden = false; };
function render() {
  try {
    const following = localStorage.getItem(FOLLOW_KEY) === 'true';
    get('friends-empty').hidden = following;
    get('friend-mager').hidden = !following;
    get('discover-builder').hidden = following;
  } catch { message('Browser storage is unavailable. Allow storage to save follows.'); }
}
function follow(value: boolean) {
  try {
    value ? localStorage.setItem(FOLLOW_KEY, 'true') : localStorage.removeItem(FOLLOW_KEY);
    render();
    const target = get(value ? 'unfollow-mager' : 'follow-mager'); target.focus();
    message(value ? 'Following @mager. Saved in this browser.' : 'Removed @mager from your follows.');
  } catch { message('Could not save your follows. Check browser storage and try again.'); }
}
get('follow-mager').addEventListener('click', () => follow(true));
get('unfollow-mager').addEventListener('click', () => follow(false));
window.addEventListener('storage', render);
render();
