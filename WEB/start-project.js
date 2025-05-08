const concurrently = require('concurrently');
const path = require('path');
const fs = require('fs');

// Paths to the frontend and backend directories
const frontendPath = path.join(__dirname, 'frontend');
const backendPath = path.join(__dirname, 'backend');

// Check if directories exist
if (!fs.existsSync(frontendPath)) {
    console.error(`Frontend directory not found at: ${frontendPath}`);
    process.exit(1);
}

if (!fs.existsSync(backendPath)) {
    console.error(`Backend directory not found at: ${backendPath}`);
    process.exit(1);
}

// Start both servers concurrently
console.log('---------------------------------------');
console.log('STARTING SIGNIFY APPLICATION');
console.log('---------------------------------------');

const { result } = concurrently([
    {
        command: 'npm run dev',
        name: 'backend',
        cwd: backendPath,
        prefixColor: 'blue',
    },
    {
        command: 'npm start',
        name: 'frontend',
        cwd: frontendPath,
        prefixColor: 'green',
    }
], {
    prefix: 'name',
    killOthers: ['failure', 'success'],
    restartTries: 3,
});

result.then(
    () => {
        console.log('All processes completed successfully');
    },
    (error) => {
        console.error('One or more processes failed', error);
    }
); 