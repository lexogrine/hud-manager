import countryList from 'react-select-country-list';
import { availableCountries } from '../../api/countries';

export default [
	...countryList().getData(),
	{ value: 'EU', label: 'European Union' },
	{ value: 'CIS', label: 'CIS' },
	{ value: 'XK', label: 'Kosovo' }
].filter(country => Object.keys(availableCountries).includes(country.value)).sort((a, b) => {
	if (a.label.toUpperCase() < b.label.toUpperCase()) return -1;
	if (a.label.toUpperCase() > b.label.toUpperCase()) return 1;
	return 0;
});
