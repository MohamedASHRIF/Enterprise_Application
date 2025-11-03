/**
 * Next.js configuration for local/dev builds.
 * - Ignore ESLint errors during build (so lint warnings/errors won't block production build)
 * - Ignore TypeScript build errors (useful for local/dev when TS types are not strict yet)
 *
 * Important: These settings are for development or CI debugging only. For staging/production
 * you should fix lint and type errors and remove these options.
 */
module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
