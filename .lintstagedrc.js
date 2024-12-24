module.exports = {
  '**/*.{js,ts,jsx,tsx}': 'eslint --format=pretty --max-warnings=0',
  '**/*.{css,scss,sass,less}': 'stylelint',
  '**/*': ['prettier --write'],
};
