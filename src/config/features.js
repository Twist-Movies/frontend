export function isEnabled(feature) {
  switch (feature) {
    case 'series':
      return import.meta.env.VITE_FEATURE_SERIES === 'true';
    default:
      return false;
  }
}

export function onlyEnabled(items) {
  return items.filter((item) => !item.feature || isEnabled(item.feature));
}
