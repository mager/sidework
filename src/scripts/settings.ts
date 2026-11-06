import { RESET_BACKUP_KEY, resetWorkspace, restoreWorkspace } from './browser-workspace.mjs';
const status = document.getElementById('settings-status')!;
const restore = document.getElementById('restore-workspace')!;
function message(text: string) { status.textContent = text; status.hidden = false; }
function render() {
 try { restore.hidden = !localStorage.getItem(RESET_BACKUP_KEY); }
 catch { message('Browser storage is unavailable. Allow storage to reset or restore your workspace.'); }
}
document.getElementById('reset-workspace')!.addEventListener('click', () => {
 try { resetWorkspace(localStorage); location.assign('/friends/'); }
 catch { render(); message('The reset could not finish. Your restore copy is kept if it was saved. Check browser storage and try again.'); }
});
restore.addEventListener('click', () => {
 try { restoreWorkspace(localStorage); location.assign('/friends/'); }
 catch { render(); message('Could not restore the previous workspace. The restore copy is still kept in this browser.'); }
});
window.addEventListener('storage', render);
render();
