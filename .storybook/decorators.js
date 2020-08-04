import { makeDecorator } from '@storybook/addons';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';

export const customWrapperStyle = makeDecorator({
  name: 'customWrapperStyle',
  parameterName: 'customWrapperStyle',
  wrapper: (getStory, context, { parameters }) => {
    const defaultStyle = {
      alignItems: 'center',
      boxSizing: 'border-box',
      display: 'flex',
      justifyContent: 'center',
      margin: '0 auto',
      minHeight: '100vh',
      padding: '1rem',
      position: 'relative',
      width: '100vw',
    };
    const style =
      (parameters &&
        parameters.style &&
        (parameters.defaultStyle === false
          ? parameters.style
          : { ...defaultStyle, ...parameters.style })) ||
      defaultStyle;

    if (parameters && parameters.disable) {
      return getStory(context);
    }

    return React.createElement(
      'section',
      { style, className: 'wrapper-section' },
      [
        React.createElement('style', {
          children: `section.wrapper-section > div {max-width: 100%;}`,
        }),

        getStory(context),
      ]
    );
  },
});

export const reactRouterWrapper = makeDecorator({
  name: 'reactRouterWrapper',
  wrapper: (getStory, context) =>
    React.createElement(
      Router,
      { history: createMemoryHistory() },
      getStory(context)
    ),
});
