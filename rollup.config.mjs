/* eslint-disable */

const outFolder = 'lib';

const inputs = [
  'background',
  'chat-content',
  'google-content',
];

export default inputs.map((d) => {
  return {
    input: `bin/${d}.js`,
    output: {
      file: `${outFolder}/${d}.js`,
      format: 'iife'
    },
    external: ['chrome-types']
  };
});