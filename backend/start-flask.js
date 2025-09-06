const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🐍 Starting Flask AI/ML Server...');

// Path to the Flask server
const flaskPath = path.resolve(__dirname, '..', 'flaskServer');
const appPath = path.join(flaskPath, 'app.py');

// Check if Flask app exists
if (!fs.existsSync(appPath)) {
    console.error(`❌ Flask app not found at: ${appPath}`);
    console.log('📝 Make sure the flaskServer directory exists with app.py');
    process.exit(1);
}

// Check if Python is available
function checkPython() {
    return new Promise((resolve) => {
        const pythonCommands = ['python', 'python3', 'py'];
        let pythonCmd = null;
        let tested = 0;

        pythonCommands.forEach(cmd => {
            const testProcess = spawn(cmd, ['--version'], { stdio: 'pipe' });
            
            testProcess.on('close', (code) => {
                tested++;
                if (code === 0 && !pythonCmd) {
                    pythonCmd = cmd;
                }
                
                if (tested === pythonCommands.length) {
                    resolve(pythonCmd);
                }
            });
            
            testProcess.on('error', () => {
                tested++;
                if (tested === pythonCommands.length) {
                    resolve(pythonCmd);
                }
            });
        });
    });
}

async function startFlaskServer() {
    try {
        // Check for Python
        const pythonCmd = await checkPython();
        
        if (!pythonCmd) {
            console.error('❌ Python not found. Please install Python and ensure it\'s in your PATH.');
            console.log('📥 Download Python from: https://www.python.org/downloads/');
            process.exit(1);
        }

        console.log(`✅ Found Python: ${pythonCmd}`);
        console.log(`📂 Flask server directory: ${flaskPath}`);

        // Check if virtual environment exists
        const venvPath = path.join(flaskPath, 'venv');
        const venvPython = process.platform === 'win32' 
            ? path.join(venvPath, 'Scripts', 'python.exe')
            : path.join(venvPath, 'bin', 'python');

        let pythonToUse = pythonCmd;
        if (fs.existsSync(venvPython)) {
            pythonToUse = venvPython;
            console.log('✅ Using virtual environment Python');
        } else {
            console.log('⚠️  Virtual environment not found, using system Python');
        }

        // Start Flask server
        const flaskProcess = spawn(pythonToUse, ['app.py'], {
            cwd: flaskPath,
            stdio: 'inherit',
            shell: false
        });

        console.log('🚀 Flask server starting...');
        console.log('🔗 Expected URL: http://localhost:8000');

        flaskProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`❌ Flask server exited with code: ${code}`);
            } else {
                console.log('✅ Flask server stopped gracefully');
            }
        });

        flaskProcess.on('error', (error) => {
            console.error('❌ Failed to start Flask server:', error.message);
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Ensure Python is installed and in PATH');
            console.log('2. Install Flask requirements: pip install -r requirements.txt');
            console.log('3. Check if port 5000 is available');
            console.log('4. Verify Flask app.py exists and is runnable');
        });

        // Handle process termination
        process.on('SIGINT', () => {
            console.log('\n🛑 Stopping Flask server...');
            flaskProcess.kill('SIGINT');
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log('\n🛑 Stopping Flask server...');
            flaskProcess.kill('SIGTERM');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Error starting Flask server:', error.message);
        process.exit(1);
    }
}

// Start the Flask server
startFlaskServer();
