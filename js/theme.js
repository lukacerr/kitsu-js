const THEME_STORAGE = 'kitsu2-theme';

const root = $(':root');
let theme = localStorage.getItem(THEME_STORAGE) ?? 'PRIMARY';

function toggleTheme() {
  root.toggleClass('secondary-theme');
  theme = theme == 'PRIMARY' ? 'SECONDARY' : 'PRIMARY';
  localStorage.setItem(THEME_STORAGE, theme);
}

function themeInit() {
  if (theme == 'SECONDARY') root.toggleClass('secondary-theme');
}
