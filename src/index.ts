#!/usr/bin/env node
/**
 * GitHub Repository Archiver
 * A CLI tool to archive GitHub repositories
 *
 * Copyright (c) 2025 James Turnbull <james@ltl.so>
 * Licensed under the MIT License
 */

import { Command } from "commander";
import inquirer from "inquirer";
import dotenv from "dotenv";
import {
  Repository,
  OperationResult,
  fetchAllRepositories,
  fetchForkRepositories,
  archiveRepositories,
  deleteRepositories
} from "./repository-functions";

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name("gharchive")
  .description("A CLI tool to archive GitHub repositories (v1.1.0)")
  .version("1.1.0");

// Command to list repositories without archiving them
program
  .command("list")
  .description("List repositories for a specific GitHub user without archiving")
  .argument("<username>", "GitHub username whose repositories to list")
  .action(async (username: string) => {
    try {
      // Check if token exists
      if (!process.env.GITHUB_TOKEN) {
        console.error("Error: GitHub token not found.");
        console.error("Please set your GITHUB_TOKEN in the .env file.");
        console.error(
          "You can create a token at https://github.com/settings/tokens"
        );
        process.exit(1);
      }

      console.log(`Fetching non-forked repositories for user ${username}...`);

      // Fetch repositories
      const repos = await fetchAllRepositories(username);

      if (repos.length === 0) {
        console.log("No repositories found for this user.");
        return;
      }

      console.log(
        `\nFound ${repos.length} repositories created by ${username}:\n`
      );

      // Display repos in a formatted table-like output
      repos.forEach((repo, index) => {
        console.log(`${index + 1}. ${repo.name}`);
        console.log(`   Visibility: ${repo.private ? "Private" : "Public"}`);
        console.log(`   Stars: ${repo.stargazers_count}`);
        console.log(`   Language: ${repo.language || "Not specified"}`);
        console.log(
          `   Created: ${new Date(repo.created_at).toLocaleDateString()}`
        );
        console.log(`   URL: ${repo.html_url}`);
        if (repo.description)
          console.log(`   Description: ${repo.description}`);
        console.log("");
      });
    } catch (error) {
      console.error(
        "An error occurred:",
        error instanceof Error ? error.message : String(error)
      );
    }
  });

// Command to list fork repositories without deleting them
program
  .command("list-forks")
  .description("List fork repositories for a specific GitHub user without deleting")
  .argument("<username>", "GitHub username whose fork repositories to list")
  .action(async (username: string) => {
    try {
      // Check if token exists
      if (!process.env.GITHUB_TOKEN) {
        console.error("Error: GitHub token not found.");
        console.error("Please set your GITHUB_TOKEN in the .env file.");
        console.error(
          "You can create a token at https://github.com/settings/tokens"
        );
        process.exit(1);
      }

      console.log(`Fetching fork repositories for user ${username}...`);

      // Fetch fork repositories
      const repos = await fetchForkRepositories(username);

      if (repos.length === 0) {
        console.log("No fork repositories found for this user.");
        return;
      }

      console.log(
        `\nFound ${repos.length} fork repositories created by ${username}:\n`
      );

      // Display repos in a formatted table-like output
      repos.forEach((repo, index) => {
        console.log(`${index + 1}. ${repo.name}`);
        console.log(`   Forked from: ${repo.full_name.split('/')[0]}`);
        console.log(`   Visibility: ${repo.private ? "Private" : "Public"}`);
        console.log(`   Stars: ${repo.stargazers_count}`);
        console.log(`   Language: ${repo.language || "Not specified"}`);
        console.log(
          `   Created: ${new Date(repo.created_at).toLocaleDateString()}`
        );
        console.log(`   URL: ${repo.html_url}`);
        if (repo.description)
          console.log(`   Description: ${repo.description}`);
        console.log("");
      });
    } catch (error) {
      console.error(
        "An error occurred:",
        error instanceof Error ? error.message : String(error)
      );
    }
  });

program
  .command("archive")
  .description("Archive repositories for a specific GitHub user")
  .argument("<username>", "GitHub username whose repositories to list")
  .option("--force", "Skip confirmation prompt", false)
  .action(async (username: string, options: { force: boolean }) => {
    try {
      // Check if token exists
      if (!process.env.GITHUB_TOKEN) {
        console.error("Error: GitHub token not found.");
        console.error("Please set your GITHUB_TOKEN in the .env file.");
        console.error(
          "You can create a token at https://github.com/settings/tokens"
        );
        process.exit(1);
      }

      console.log(`Fetching non-forked repositories for user ${username}...`);

      // Fetch repositories
      const repos = await fetchAllRepositories(username);

      if (repos.length === 0) {
        console.log("No repositories found for this user.");
        return;
      }

      console.log(`Found ${repos.length} repositories created by ${username}.`);

      // Let user select repositories to archive
      const selectedRepos = await selectRepositories(repos);

      if (selectedRepos.length === 0) {
        console.log("No repositories selected for archiving.");
        return;
      }

      // Confirm before archiving unless --force is used
      if (!options.force) {
        const { confirm } = await inquirer.prompt([
          {
            type: "confirm",
            name: "confirm",
            message: `You're about to archive ${selectedRepos.length} repositories. This action cannot be easily undone. Continue?`,
            default: false,
          },
        ]);

        if (!confirm) {
          console.log("Operation cancelled.");
          return;
        }
      }

      // Archive selected repositories
      const results = await archiveRepositories(username, selectedRepos);

      // Display summary
      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      console.log("\nArchiving complete!");
      console.log(`✅ Successfully archived: ${successful}`);
      if (failed > 0) {
        console.log(`❌ Failed to archive: ${failed}`);
      }
    } catch (error) {
      console.error(
        "An error occurred:",
        error instanceof Error ? error.message : String(error)
      );
    }
  });


// Let user select repositories to archive or delete
async function selectRepositories(repos: Repository[], message: string = "Select repositories to archive:"): Promise<string[]> {
  const { selectedRepos } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedRepos",
      message,
      choices: repos.map((repo) => ({
        name: `${repo.name} (${repo.private ? "Private" : "Public"}, ${
          repo.stargazers_count
        } stars, created: ${new Date(repo.created_at).toLocaleDateString()})`,
        value: repo.name,
        short: repo.name,
      })),
      pageSize: 20,
    },
  ]);

  return selectedRepos;
}


// Command to delete fork repositories
program
  .command("delete-forks")
  .description("Delete fork repositories for a specific GitHub user")
  .argument("<username>", "GitHub username whose fork repositories to list")
  .option("--force", "Skip confirmation prompt", false)
  .action(async (username: string, options: { force: boolean }) => {
    try {
      // Check if token exists
      if (!process.env.GITHUB_TOKEN) {
        console.error("Error: GitHub token not found.");
        console.error("Please set your GITHUB_TOKEN in the .env file.");
        console.error(
          "You can create a token at https://github.com/settings/tokens"
        );
        process.exit(1);
      }

      console.log(`Fetching fork repositories for user ${username}...`);

      // Fetch fork repositories
      const repos = await fetchForkRepositories(username);

      if (repos.length === 0) {
        console.log("No fork repositories found for this user.");
        return;
      }

      console.log(`Found ${repos.length} fork repositories created by ${username}.`);

      // Let user select repositories to delete
      const selectedRepos = await selectRepositories(repos, "Select fork repositories to delete:");

      if (selectedRepos.length === 0) {
        console.log("No repositories selected for deletion.");
        return;
      }

      // Confirm before deleting unless --force is used
      if (!options.force) {
        const { confirm } = await inquirer.prompt([
          {
            type: "confirm",
            name: "confirm",
            message: `You're about to delete ${selectedRepos.length} repositories. This action CANNOT be undone. Continue?`,
            default: false,
          },
        ]);

        if (!confirm) {
          console.log("Operation cancelled.");
          return;
        }
      }

      // Delete selected repositories
      const results = await deleteRepositories(username, selectedRepos);

      // Display summary
      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      console.log("\nDeletion complete!");
      console.log(`✅ Successfully deleted: ${successful}`);
      if (failed > 0) {
        console.log(`❌ Failed to delete: ${failed}`);
      }
    } catch (error) {
      console.error(
        "An error occurred:",
        error instanceof Error ? error.message : String(error)
      );
    }
  });

// Start the program
program.parse();
