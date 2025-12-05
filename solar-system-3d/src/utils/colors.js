// Color palette from colors.csv
// Manually mapped for the shader to ensure performance (no texture lookup for simple palette)

// class_id is mapped in process_data.py based on alphabetical order of unique classes found.
// We need to ensure the shader knows which ID corresponds to which color.
// The easiest way is to pass the palette as a uniform array or hardcode if small.
// However, since class IDs are dynamic based on data, we should pass a texture or uniform array.
// For 18k asteroids, a uniform array of colors is best.

// Let's create a JS map first, then we'll pass it to the shader.

export const ASTEROID_COLORS = {
  'MBA': '#00ada7', // Main Belt
  'TJN': '#f38b8a', // Trojan
  'OMB': '#ffd393', // Outer Main Belt
  'GRK': '#cb2855', // Greek
  'CEN': '#c4bd6c', // Centaur
  'MCA': '#d73423', // Mars Crosser
  'AST': '#706353', // Unspecified
  'TNO': '#1f8a70', // Trans-Neptunian
  'AMO': '#979330', // Amor
  'IMB': '#e19222', // Inner Main Belt
  'APO': '#979330', // Apollo
  'ATE': '#979330', // Aten
  'IEO': '#979330', // Interior Earth
  'HYA': '#aec7b2', // Hyperbolic
  // Comets (grouped)
  'PAR': '#e6dfcf',
  'JFc': '#e6dfcf',
  'COM': '#e6dfcf',
  'HYP': '#e6dfcf',
  'HTC': '#e6dfcf',
  'Etc': '#e6dfcf',
  'JFC': '#e6dfcf',
  'CTc': '#e6dfcf',
  // Planets
  'Mercury': '#b6a965',
  'Venus': '#d05227',
  'Earth': '#7EBCE5',
  'Mars': '#cb2655',
  'Jupiter': '#e1d9c4',
  'Saturn': '#A73E5C',
  'Uranus': '#F34E52',
  'Neptune': '#738cc1',
  'default': '#706353'
};

