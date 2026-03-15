/**
 * E2B Template Definition — n8n Sandbox
 *
 * Defines a custom sandbox template with n8n pre-installed.
 * Uses the programmatic Template builder (no Docker required).
 */

import { Template, waitForPort } from 'e2b';

export const template = Template()
  // Use Node.js 20 base image (includes node, npm, build tools)
  .fromNodeImage('20')

  // Install extra system deps needed for native addons
  .aptInstall(['python3', 'make', 'g++', 'git'])

  // Install n8n globally
  .npmInstall('n8n', { g: true })

  // Set environment variables for n8n
  .setEnvs({
    N8N_HOST: '0.0.0.0',
    N8N_PORT: '5678',
    N8N_PROTOCOL: 'https',
    GENERIC_TIMEZONE: 'Asia/Kolkata',
  })

  // Set the start command — n8n launches on port 5678
  // waitForPort checks that port 5678 is ready before marking sandbox as ready
  .setStartCmd('n8n start', waitForPort(5678));
