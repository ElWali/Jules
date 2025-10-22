# RQpedia Project Guide for AI Agents

Welcome to RQpedia, a lightweight, open-source platform for exploring archaeological data. This guide provides instructions and conventions for AI agents working on this repository.

## 1. Project Overview

RQpedia is a simplified alternative to complex databases. Its goal is to provide a simple, intuitive, and open-source interface for archaeological data, making it easy for both users and developers to adopt and contribute.

- **Project Name:** RQpedia
- **Primary Data Source:** `VX/output.json`
- **Core Technologies:** HTML, CSS, JavaScript, Leaflet.js
- **Key Files:**
    - `VX/index.html`: The main landing page with an interactive map and search functionality.
    - `VX/sites.html`: A page for browsing and filtering all sites in a tabular format.
    - `VX/profile.html`: The detailed profile page for an individual archaeological site.
    - `VX/parser.js`: Contains utility functions for parsing malformed JSON data from `output.json`.

## 2. Development Workflow

The project is a static web application. All files are located in the `VX/` directory.

### Local Development Server

Due to browser CORS restrictions, you must use a local HTTP server to view and test the application. You can start a server from the root of the repository with the following command:

```bash
python3 -m http.server 8000 --directory VX &
```

This will serve the files at `http://localhost:8000`.

### Data Handling

The application's data is stored in `VX/output.json`. Some fields in this file, such as `periods` and `c14`, may contain malformed or doubly-stringified JSON. The `parseMalformedJson` function in `VX/parser.js` is designed to handle these inconsistencies. When working with data from `output.json`, use this function to ensure it is parsed correctly.

## 3. Coding Conventions

- **File Structure:** All project files must be located within the `VX/` directory.
- **Styling:** The project uses a dark theme. Key CSS variables are defined in `VX/theme.css`. Maintain a consistent look and feel by using these variables.
- **JavaScript:** Write clean, readable JavaScript. The project does not use any frameworks, so all code is vanilla JS.
- **HTML:** Use semantic HTML and ensure that all pages are responsive.

## 4. Testing and Verification

Automated testing is crucial for maintaining the quality of the project.

- **Frontend Verification:** Use Playwright for frontend verification. Create a temporary Python script in a scratch directory (e.g., `jules-scratch`) to automate browser interactions and take screenshots.
- **Assertions:** Your verification scripts must include assertions to programmatically confirm the expected outcome. For example, use `expect(page.locator("text=...")).to_be_visible()` to check for the presence of elements.
- **Cleanup:** Always remove any temporary files or directories created during testing before submitting your changes.

## 5. Pre-commit Workflow

Before submitting any changes, you must follow this pre-commit workflow:

1.  **Run Tests:** Ensure that all existing tests pass and that you have added a new, permanent test case for any bug you have fixed.
2.  **Verify Frontend Changes:** Run your Playwright script and provide "before" and "after" screenshots to validate visual changes.
3.  **Request Code Review:** Request a code review for your changes.
4.  **Record Learnings:** Record any new information or techniques you have learned.
