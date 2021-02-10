import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import config from '../api/config';
import resources from './translations';

const i18n = i18next
	// Init React bindings for i18next
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: 'en',
		debug: config.isDev,
		interpolation: {
			escapeValue: false
		},
		react: {
			useSuspense: false // TODO: Use React Suspense to handle async loading
		},
		backend: {
			overrideMimeType: true
		}
	});

export default i18n;
