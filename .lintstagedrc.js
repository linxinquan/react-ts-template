module.exports = {
  '**/*.{js,ts,jsx,tsx}': 'eslint --no-warn-ignored --format=pretty --max-warnings=0',
  '**/*.{css,scss,sass,less}': 'stylelint',
  '**/*': ['prettier --write'],
};
