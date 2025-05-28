#!/bin/bash

# Install dependencies
npm install

# Build the project
npm run build

# Create symbolic link to use the command globally
npm link

echo "Installation complete!"
echo "Remember to create a .env file with your GitHub token:"
echo "GITHUB_TOKEN=your_github_personal_access_token_here"
echo ""
echo "Usage:"
echo "gharchive archive <username>"