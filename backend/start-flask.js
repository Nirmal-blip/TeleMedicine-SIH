const { spawn } = require('child_process');
const path = require('path');

// Start Flask server
const flaskPath = path.join(__dirname, '..', 'flaskServer');
const pythonProcess = spawn('python', ['app.py'], {
  cwd: flaskPath,
  stdio: 'inherit',
  shell: true
});

pythonProcess.on('error', (error) => {
  console.error('Failed to start Flask server:', error);
});

pythonProcess.on('close', (code) => {
  console.log(`Flask server exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  pythonProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  pythonProcess.kill('SIGTERM');
  process.exit(0);
});
