# Life Quest Website

The official public website for [Life Quest](https://lifequestapp.ca), the real-life RPG from Simic Solutions.

## Purpose

- Introduce the Life Quest world and product promise
- Direct visitors toward the app, updates, and community
- Answer common questions
- Collect launch-interest submissions through Netlify Forms

## Publishing workflow

1. Make and visually verify changes locally.
2. Run `python3 scripts/check_site.py`.
3. Commit only approved files to `main`.
4. Push `main` through GitHub Desktop.
5. Confirm the production deployment and affected URLs.

## Working conventions

- Keep unfinished app and website experiments out of production commits.
- Never commit credentials, ZIP exports, or `.DS_Store` files.
- Use issues to preserve bugs and ideas beyond the current work session.
- Treat Life Quest as its own world while crediting Simic Solutions as its builder.

## Repository boundary

This repository contains the public website, not the Life Quest application source code.
