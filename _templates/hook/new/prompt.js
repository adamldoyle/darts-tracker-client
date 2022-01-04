module.exports = [
  {
    type: 'input',
    name: 'name',
    message: "What's the new hooks's name (include the prefix 'use' in the name, e.g. useSample)?",
  },
  {
    type: 'select',
    name: 'Subfolder',
    message: 'Which feature subfolder should the new component go in?',
    choices: [
      '',
      'scoreboard',
      'shared',
      'layout',
      'auth',
      'leagues',
      'form',
      // leave this line - injected features automatically inserted above this line
    ],
  },
];
