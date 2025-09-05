const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Start Flask server
const flaskPath = path.join(__dirname, '..', 'flaskServer');

// Determine the correct Python command based on system
let pythonCmd = 'python3';
if (os.platform() === 'win32') {
  pythonCmd = 'python';
}

console.log(`Starting Flask server using ${pythonCmd} in ${flaskPath}`);

const pythonProcess = spawn(pythonCmd, ['app.py'], {
  cwd: flaskPath,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PYTHONPATH: flaskPath
  }
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
