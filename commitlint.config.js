module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'docs', 'test', 'chore', 'perf', 'style', 'ci', 'revert'],
    ],
    'subject-case': [0], // Allow any case for subject
  },
};
