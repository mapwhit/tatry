try {
  process.loadEnvFile('/etc/default/tatry');
} catch (err) {
  console.error('Failed to load environment variables:', err.message);
}
