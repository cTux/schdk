import type { Preview } from '@storybook/react-vite';
import { LocaleProvider } from '../src/localization';
import '../src/styles/dark.scss';
import '../src/styles/light.scss';

const preview: Preview = {
  globalTypes: {
    locale: {
      description: 'Component language',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'uk', title: 'Українська' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: 'Component theme',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    locale: 'uk',
    theme: 'dark',
  },
  parameters: {
    controls: { expanded: true },
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale === 'en' ? 'en' : 'uk';
      const theme = context.globals.theme === 'light' ? 'light' : 'dark';
      document.documentElement.dataset.theme = theme;

      return (
        <LocaleProvider locale={locale} onLocaleChange={() => undefined}>
          <div
            style={{
              boxSizing: 'border-box',
              minHeight: '100vh',
              padding: '1rem',
              color: 'var(--schdk-text)',
              background: 'var(--schdk-background)',
            }}
          >
            <Story />
          </div>
        </LocaleProvider>
      );
    },
  ],
};

export default preview;
