# Quorum Coding Challenge - Working with Legislative Data

A lightweight web tool for analyzing legislative bills and count votes. This project is a coding challenge for a Senior Fullstack Software Engineer position at Quorum.
You can find the original challenge description [here](https://github.com/Samukeras/legislative-data-analyzer/blob/main/challenge.pdf).

## Tech Stack

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://www.ecma-international.org/publications-and-standards/standards/ecma-262/)
[![ECMAScript 6+](https://img.shields.io/badge/ECMAScript_6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://www.ecma-international.org/publications-and-standards/standards/ecma-262/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

The project was intentionally built with pure JavaScript and minimal dependencies to ensure ease of setup and local development. This approach eliminates the need for complex build processes, package installations, or framework-specific knowledge.

### Why This Approach?
- **Easy to Run**: Just open the HTML file in a browser - no build step required;
- **Easy to Deploy**: Deploy anywhere that can serve static files - no special server requirements;
- **Zero Config**: No need for complex bundlers or transpilers for development;
- **Lightweight**: Minimal dependencies means faster loading and better performance;
- **Maintainable**: Clean, standard code that any developer can understand.

## Features

- Upload and parse CSV files containing legislative data;
- Count votes for and against bills by legislator;
- Count supporting and opposing votes for each bill;
- Simple web interface for data processing.

## Setup and Running

1. Clone this repository
2. Open index.html in a modern web browser
   - Due to CORS restrictions, you may need to serve the files through a local server
   - You can use Python's built-in server: `python -m http.server 8000`
   - Or Node's http-server: `npx http-server`
3. Upload the required CSV files through the web interface
4. Click "Analyze Data" to process the files
5. Download the results using the "Download CSV" buttons

## Testing

The project includes automated tests for critical functions using Jest:

```bash
npm install
npm test
```

## Development Principles

1. **Core Principles**
   - No framework dependencies;
   - Modern JavaScript features (ES6+);
   - Browser native APIs;
   - Minimal external dependencies.

2. **Clean Code Practices**
   - SOLID principles;
   - DRY (Don't Repeat Yourself);
   - Single Responsibility;
   - Immutable data patterns;
   - Descriptive naming.

3. **Modern Development Patterns**
   - ES6 Modules;
   - Async/Await;
   - Event-driven architecture;
   - Functional programming concepts.

## Architecture Decisions

1. **Modular Design**
   - Separate modules for CSV parsing, data analysis, and UI;
   - Clear separation of concerns;
   - Easy to test and maintain.

2. **Performance Optimization**
   - Efficient data structures;
   - Minimal data copying;
   - Optimized algorithms.