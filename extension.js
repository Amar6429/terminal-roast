const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

/**
 * State Management
 * We keep track of these outside functions so they persist while VS Code is open.
 */
let isMuted = false;           // Tracks if the user silenced the roasts
let isCurrentlyPlaying = false; // Prevents overlapping sounds (cooldown)
let roastButton;               // Reference to the UI button in the status bar

/**
 * ACTIVATION
 * This is the entry point. VS Code calls this when the extension starts up.
 */
function activate(context) {
    console.log('Terminal Roast: Monitoring for failures... 🔥');

    // 1. Setup the Mute/Unmute Button in the bottom right corner
    createStatusBarInterface(context);

    // 2. Setup the Listener
    // This watches every terminal command. If it ends in an error, we roast.
    const terminalListener = vscode.window.onDidEndTerminalShellExecution((event) => {
        const commandFailed = event.exitCode !== undefined && event.exitCode !== 0;
        
        if (commandFailed && !isMuted) {
            triggerRandomRoast(context);
        }
    });

    // Clean up: Add to subscriptions so VS Code closes the listener when disabled
    context.subscriptions.push(terminalListener);
}

/**
 * USER INTERFACE
 * Creates the clickable button in the status bar.
 */
function createStatusBarInterface(context) {
    // Create the button
    roastButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    roastButton.command = 'terminal-roast.toggleMute';
    
    // Register the action that happens when the button is clicked
    const toggleAction = vscode.commands.registerCommand('terminal-roast.toggleMute', () => {
        isMuted = !isMuted;
        updateUIAppearance();
        
        // Brief notification using built-in icons
        const status = isMuted ? "$(mute) Muted" : "$(megaphone) Active";
        vscode.window.setStatusBarMessage(`Terminal Roast: ${status}`, 2000);
    });

    updateUIAppearance();
    roastButton.show();
    context.subscriptions.push(roastButton, toggleAction);
}

/**
 * UI REFRESH
 * Updates the button text and color based on the muted state.
 */
function updateUIAppearance() {
    if (isMuted) {
        roastButton.text = `$(mute) Muted`;
        roastButton.tooltip = "Click to allow roasting sounds again";
        roastButton.color = '#aaaaaa'; // Greyed out
    } else {
        roastButton.text = `$(megaphone) Roasting`;
        roastButton.tooltip = "Click to silence the roasts";
        roastButton.color = '#ffcc00'; // "Gold" active color
    }
}

/**
 * THE ROAST LOGIC
 * Picks a sound and plays it via the computer's native audio system.
 */
function triggerRandomRoast(context) {
    // Cooldown check: Don't play if a sound is already running
    if (isCurrentlyPlaying) return;

    const mediaFolder = path.join(context.extensionPath, 'media');
    
    // Verify files exist before trying to play
    if (!fs.existsSync(mediaFolder)) return;
    const soundFiles = fs.readdirSync(mediaFolder).filter(file => file.endsWith('.mp3'));
    if (soundFiles.length === 0) return;

    // Pick a random meme sound
    const randomSound = soundFiles[Math.floor(Math.random() * soundFiles.length)];
    const soundPath = path.join(mediaFolder, randomSound);

    // Prepare the command for the user's Operating System
    let audioCommand = "";
    if (process.platform === 'win32') {
        // Windows: Uses a hidden PowerShell player that supports MP3
        audioCommand = `powershell -c "Add-Type -AssemblyName PresentationCore; $m = New-Object System.Windows.Media.MediaPlayer; $m.Open('${soundPath}'); $m.Play(); Start-Sleep -s 5"`;
    } else if (process.platform === 'darwin') {
        // Mac: Uses the built-in 'afplay' tool
        audioCommand = `afplay "${soundPath}"`;
    } else {
        // Linux: Uses 'aplay'
        audioCommand = `aplay "${soundPath}"`;
    }

    // Execute the sound
    isCurrentlyPlaying = true;
    vscode.window.setStatusBarMessage(`💀 Roasted by ${randomSound}`, 4000);

    exec(audioCommand, (error) => {
        if (error) console.error("Audio Player Error:", error);
        
        // Reset the cooldown after 3 seconds so we can roast again
        setTimeout(() => {
            isCurrentlyPlaying = false;
        }, 3000);
    });
}

function deactivate() {
    // Logic to run when the extension is turned off (clean up if needed)
}

module.exports = { activate, deactivate };