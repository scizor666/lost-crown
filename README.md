# Lost Crown

A Phaser-based web game where the player helps Princess May search for her lost crown in a dynamically generated castle maze.

## Features

- **Dynamic Maze Generation**: The game generates a 5x5 maze with different themed rooms each time the game is played.
- **Interactive Rooms**: Each room contains search spots with various objects to interact with.
- **Audio Feedback**: Sound effects for various actions like opening doors, searching, and finding the crown.
- **Progress Tracking**: The game tracks the number of turns taken to find the crown.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lost-crown.git
   cd lost-crown
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Game

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000` to play the game.

## Project Structure

- `src/`: Contains the source code for the game.
  - `audio.ts`: Handles audio playback for various game actions.
  - `main.ts`: The main entry point for the game.
  - `maze.ts`: Generates the maze and handles game logic.
- `public/`: Contains static assets like images and icons.
- `package.json`: Contains project metadata and dependencies.

## Contributing

Feel free to contribute to the project by opening issues or submitting pull requests. Make sure to follow the existing code style and conventions.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
