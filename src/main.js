// ===== Start =====
let restartArmed = false, restartTimer = null;
function disarm() { restartArmed = false; clearTimeout(restartTimer); restartBtn.textContent = t('startOver'); restartBtn.classList.remove('armed'); }
restartBtn.addEventListener('click', () => {
  if (!restartArmed) {
    restartArmed = true;
    restartBtn.textContent = t('startOverArmed');
    restartBtn.classList.add('armed');
    restartTimer = setTimeout(disarm, 2600);
    return;
  }
  disarm();
  go('welcome');
});

themeBtn.addEventListener('click', () => { setTheme(isDark() ? 'light' : 'dark'); paintTheme(); });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintTheme);

let savedLang = null;
try { savedLang = localStorage.getItem(LANG_KEY); } catch (e) { /* storage unavailable */ }
applyLang(Object.keys(LANGS).includes(savedLang) ? savedLang : phoneLang());
disarm();
loadSetup();
restore();
render(false);
