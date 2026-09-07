// Universal production entrypoint
try {
  require('./dist/src/main');
} catch (err) {
  try {
    require('./dist/main');
  } catch (innerErr) {
    console.error('Failed to locate main entrypoint:', err, innerErr);
    process.exit(1);
  }
}
