import React from 'react';
import {
  DEFAULT_NIGERIA_LOCATION,
  NIGERIA_ALL_LOCATION_LABEL,
  NIGERIA_MAJOR_CITIES,
  NIGERIA_STATES,
} from '@/lib/locations';

/**
 * Shared nationwide Nigeria `<option>` and `<optgroup>` elements for search and filter dropdowns.
 */
export function NigeriaLocationOptions() {
  return (
    <>
      <option value={DEFAULT_NIGERIA_LOCATION}>{NIGERIA_ALL_LOCATION_LABEL}</option>
      <optgroup label="Major Cities &amp; Districts">
        {NIGERIA_MAJOR_CITIES.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </optgroup>
      <optgroup label="All 36 States &amp; FCT">
        {NIGERIA_STATES.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </optgroup>
    </>
  );
}
