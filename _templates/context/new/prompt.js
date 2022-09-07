module.exports = [
  {
    type: 'input',
    name: 'Name',
    message: "What's the new contexts's name?",
  },
  {
    type: 'select',
    name: 'Subfolder',
    message: 'Which feature subfolder should the context provider component go in?',
    choices: [
      '',
      'scoreboard',
      'shared',
      'layout',
      'auth',
      'leagues',
      'form',
      'games',
      'stats',
      // leave this line - injected features automatically inserted above this line
    ],
  },
];
