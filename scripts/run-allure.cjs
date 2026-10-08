const { spawnSync } = require('node:child_process');
const { rm } = require('node:fs/promises');

const generatedDirectories = ['allure-results', 'allure-report'];
Promise.all(generatedDirectories.map((directory) =>
  rm(directory, { recursive: true, force: true }),
)).then(() => {
  const commandOptions = {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  };
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const testResult = spawnSync(npmCommand, ['run', 'test:ci'], commandOptions);

  if (testResult.error) {
    console.error(`Unable to run Playwright tests: ${testResult.error.message}`);
    process.exitCode = testResult.status ?? 1;
    return;
  }

  const allureCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const reportResult = spawnSync(
    allureCommand,
    ['allure', 'generate', 'allure-results', '--output', 'allure-report'],
    commandOptions,
  );

  if (reportResult.error) {
    console.error(`Unable to generate the Allure report: ${reportResult.error.message}`);
    process.exitCode = testResult.status || reportResult.status || 1;
    return;
  }

  process.exitCode = testResult.status || reportResult.status || 0;
}).catch((error) => {
  console.error(`Unable to prepare Allure output directories: ${error.message}`);
  process.exitCode = 1;
});