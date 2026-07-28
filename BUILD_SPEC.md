# Scroll Calculator Build Spec

## Parser Product Decisions

- Scroll time is category-based when a screenshot exposes category tiles. Included categories are Social, Video, Entertainment, and Games, plus localized zh/thai equivalents.
- Messaging apps counted inside the platform's Social category are included by design. The parser counts the platform category, not individual messaging intent.
- Productivity & Finance, Travel/Navigation, Creativity, Information & Reading, Utilities, and Communication-as-category are excluded from scroll-time category sums.
- TODO: source scroll-specific benchmarks. For now, scroll-time results compare against the existing published screen-time benchmark set.
