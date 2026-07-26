# Automatic publishing

The Music Literacy Hub is prepared for automatic publishing with GitHub Pages.

## One-time GitHub setting

In the GitHub repository, open **Settings**, then **Pages**. Under **Build and deployment**, choose **GitHub Actions** as the source.

## What happens after that

Every push to the `main` branch will:

1. Run the Hub's checks.
2. Compile JSX and Tailwind for production.
3. Publish the prepared website to GitHub Pages.

The website source files remain the files you edit normally. The temporary `dist` folder is created only for publishing and is not committed.

To test the production build on your computer, run:

```sh
pnpm run build:site
```

The build automatically includes the audio and PDFs used by the available Digital Past Papers, without copying the older exam archive that the website does not use.
