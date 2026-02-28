# Terminal Roast 🔥

**Terminal Roast** is a VS Code extension designed for developers who don't take themselves too seriously. It monitors your terminal and "roasts" you with a random meme sound whenever a command fails.



## How it Works
This extension uses VS Code's native Shell Integration to detect "Exit Codes." 
- If a command finishes with **Exit Code 0** (Success), it stays quiet.
- If a command finishes with **any other code** (Failure), it triggers a random `.mp3` from your media folder.

## Features
- **Zero Lag**: Uses native system players (`PowerShell`, `afplay`, or `aplay`) so it doesn't slow down your editor.
- **Mute Toggle**: A handy megaphone icon in the Status Bar lets you silence the roasts during meetings or screen shares.
- **Lightweight**: No heavy external dependencies.

## Requirements
- **VS Code 1.80.0+**
- **Shell Integration**: Make sure your terminal has shell integration enabled (look for the blue/red dots next to your commands).

## Usage
1. Open your terminal.
2. Type a command that will fail (e.g., `git pushh`).
3. Enjoy the roast. 💀