// Reviewed 2026-11-22. Emergency numbers route to police (some via a shared dispatcher).
// Child helplines come from Child Helpline International unless noted otherwise.
const childSource = 'https://childhelplineinternational.org/members/helplines/';
const euSource = 'https://europa.eu/youreurope/citizens/travel/security-and-emergencies/emergency/index_en.htm';
const travelSource = slug => `https://www.gov.uk/foreign-travel-advice/${slug}/getting-help`;

const entries = [
  // European Union: 112 reaches police in every member state.
  ['AT', 'Austria', '112', '147', euSource],
  ['BG', 'Bulgaria', '112', '116111', euSource],
  ['HR', 'Croatia', '112', '116111', euSource],
  ['CY', 'Cyprus', '112', '116111', euSource],
  ['CZ', 'Czechia', '112', '116111', euSource],
  ['DK', 'Denmark', '112', '116111', euSource],
  ['EE', 'Estonia', '112', '116111', euSource],
  ['FI', 'Finland', '112', '116111', euSource],
  ['FR', 'France', '112', '119', euSource],
  ['DE', 'Germany', '112', '116111', euSource],
  ['GR', 'Greece', '112', '1056', euSource],
  ['HU', 'Hungary', '112', '116111', euSource],
  ['IE', 'Ireland', '112', '1800666666', euSource],
  ['IT', 'Italy', '112', '19696', euSource],
  ['LV', 'Latvia', '112', '116111', euSource],
  ['LT', 'Lithuania', '112', '116111', euSource],
  ['LU', 'Luxembourg', '112', '116111', euSource],
  ['NL', 'Netherlands', '112', '08000432', euSource],
  ['PL', 'Poland', '112', '116111', euSource],
  ['PT', 'Portugal', '112', '116111', euSource],
  ['RO', 'Romania', '112', '116111', euSource],
  ['SK', 'Slovakia', '112', '116111', euSource],
  ['SI', 'Slovenia', '112', '116111', euSource],
  ['ES', 'Spain', '112', '116111', euSource],
  ['SE', 'Sweden', '112', '116111', euSource],

  // Other countries: police/emergency numbers checked against current FCDO guidance.
  ['IN', 'India', '112', '1098', travelSource('india')],
  ['US', 'United States', '911', '18004224453', travelSource('usa')],
  ['CA', 'Canada', '911', '18006686868', travelSource('canada')],
  ['CO', 'Colombia', '123', '141', travelSource('colombia')],
  ['CL', 'Chile', '133', '1515', travelSource('chile')],
  ['CR', 'Costa Rica', '911', '1147', travelSource('costa-rica')],
  ['JM', 'Jamaica', '119', '8887233776', travelSource('jamaica')],
  ['UY', 'Uruguay', '911', '08005050', travelSource('uruguay')],
  ['GB', 'United Kingdom', '999', '08001111', 'https://www.gov.uk/contact-police'],
  ['AU', 'Australia', '000', '1800551800', travelSource('australia')],
  ['NZ', 'New Zealand', '111', '08009428787', travelSource('new-zealand')],
  ['BD', 'Bangladesh', '999', '1098', travelSource('bangladesh')],
  ['PK', 'Pakistan', '15', '1098', travelSource('pakistan')],
  ['NP', 'Nepal', '100', '1098', travelSource('nepal')],
  ['LK', 'Sri Lanka', '119', '1929', travelSource('sri-lanka')],
  ['JP', 'Japan', '110', '0120997777', travelSource('japan')],
  ['SG', 'Singapore', '999', '18002744788', travelSource('singapore')],
  ['TH', 'Thailand', '191', '1387', travelSource('thailand')],
  ['PH', 'Philippines', '911', '163', travelSource('philippines')],
  ['ID', 'Indonesia', '110', '1500771', travelSource('indonesia')],
  ['VN', 'Vietnam', '113', '111', travelSource('vietnam')],
  ['KE', 'Kenya', '999', '116', travelSource('kenya')],
  ['ZA', 'South Africa', '10111', '116', travelSource('south-africa')],
  ['NG', 'Nigeria', '112', '08008008001', travelSource('nigeria')],
  ['UG', 'Uganda', '999', '116', travelSource('uganda')],
  ['TZ', 'Tanzania', '112', '116', travelSource('tanzania')],
  ['EG', 'Egypt', '122', '16000', travelSource('egypt')],
  ['NO', 'Norway', '112', '116111', travelSource('norway')],
  ['CH', 'Switzerland', '117', '147', travelSource('switzerland')],
  ['QA', 'Qatar', '999', '919', travelSource('qatar')]
];

export const contactsByCountry = Object.fromEntries(entries.map(([code, country, police, childHelpline, policeSource]) => [code, {
  country, police, childHelpline, policeSource,
  childSource: code === 'IN' ? 'https://www.india.gov.in/directory/helpline' : childSource
}]));

export function crisisContacts(countryCode) {
  const code = typeof countryCode === 'string' ? countryCode.toUpperCase() : '';
  const known = contactsByCountry[code];
  const detected = known?.country || (/^[A-Z]{2}$/.test(code) ? new Intl.DisplayNames(['en'], { type: 'region' }).of(code) : null);
  const country = detected && detected !== code && detected !== 'Unknown Region' ? detected : null;
  const search = !known && country
    ? `child safety helpline and police emergency number in ${country}`
    : 'child safety helpline and police emergency number in my country';
  return { ...known, country, searchUrl: `https://www.google.com/search?q=${encodeURIComponent(search)}` };
}
