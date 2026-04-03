import composeESLint from '@esphome/compose-eslint';

export default [
  { ignores: ['.espcompose-sim/**'] },
  ...composeESLint.recommended,
];
