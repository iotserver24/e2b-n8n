/**
 * E2B Template Definition — OpenClaw Sandbox
 *
 * Defines a custom sandbox template with OpenClaw pre-installed.
 */

import { Template, defaultBuildLogger } from 'e2b';

export const template = Template()
  // Use Node.js 22 base image as required by OpenClaw
  .fromNodeImage('22')

  // Install system deps
  .aptInstall(['git', 'curl', 'gnupg', 'ca-certificates', 'python3', 'make', 'g++'])

  // Install OpenClaw globally
  .npmInstall('openclaw', { g: true })

  // Ensure default environment uses the right shell
  .setEnvs({
    SHELL: '/bin/bash',
  });
