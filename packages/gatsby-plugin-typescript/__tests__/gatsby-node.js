"use strict";

jest.mock(`../resolve`, () => module => `/resolved/path/${module}`);

const {
  resolvableExtensions,
  modifyWebpackConfig,
  preprocessSource
} = require(`../gatsby-node`);

describe(`gatsby-plugin-typescript`, () => {
  it(`returns correct extensions`, () => {
    expect(resolvableExtensions()).toMatchSnapshot();
  });

  it(`modifies webpack config`, () => {
    const boundActionCreators = {
      setWebpackConfig: jest.fn()
    };
    const loaders = { js: () => `babel-loader` };

    modifyWebpackConfig({ boundActionCreators, loaders }, { compilerOptions: {} });

    expect(boundActionCreators.setWebpackConfig).toHaveBeenCalledTimes(1);
    const lastCall = boundActionCreators.setWebpackConfig.mock.calls.pop();
    expect(lastCall).toMatchSnapshot();
  });

  describe(`pre-processing`, () => {
    const opts = { compilerOptions: {} };
    it(`leaves non-tsx? files alone`, () => {
      expect(preprocessSource({
        contents: `alert('hello');`,
        filename: `test.js`
      }, opts)).toBeNull();
    });

    it(`transforms .ts files`, () => {
      const js = preprocessSource({
        filename: `index.ts`,
        contents: `
          declare let moment: any;

          const now: string = moment().format('HH:MM:ss');
        `
      }, opts);
      expect(js).not.toBeNull();
      expect(js).toMatchSnapshot();
    });

    it(`transforms JSX files`, () => {
      const js = preprocessSource({
        filename: `tags.ts`,
        contents: `
          import * as React from 'react';

          export default () => <h1>Hello World</h1>;
        `
      }, opts);

      expect(js).not.toBeNull();
      expect(js).toMatchSnapshot();
    });
  });
});