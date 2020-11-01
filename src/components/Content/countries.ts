import countryList from 'react-select-country-list';

export default [
	...countryList().getData(),
	{ value: 'EU', label: 'European Union' },
	{ value: 'CIS', label: 'CIS' },
	{ value: 'XK', label: 'Kosovo' }
].sort((a, b) => {
	if (a.label.toUpperCase() < b.label.toUpperCase()) return -1;
	if (a.label.toUpperCase() > b.label.toUpperCase()) return 1;
	return 0;
});
