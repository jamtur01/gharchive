#!/usr/bin/env node
/**
 * GitHub Repository Archiver
 * A CLI tool to archive GitHub repositories
 *
 * Copyright (c) 2025 James Turnbull <james@ltl.so>
 * Licensed under the MIT License
 */

import { Command } from 'commander';
import { Octokit } from 'octokit';
import inquirer from 'inquirer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Define types
interface Repository {
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  language: string | null;
  archived: boolean;
}

interface ArchiveResult {
  name: string;
  success: boolean;
  error?: unknown;
}

// Load environment variables
dotenv.config();

// Initialize GitHub API client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const program = new Command();

program
  .name('gharchive')
  .description('A CLI tool to archive GitHub repositories')
  .version('1.0.0');

// Command to list repositories without archiving them
program
  .command('list')
  .description('List repositories for a specific GitHub user without archiving')
  .argument('<username>', 'GitHub username whose repositories to list')
  .action(async (username: string) => {
    try {
      // Check if token exists
      if (!process.env.GITHUB_TOKEN) {
        console.error('Error: GitHub token not found.');
        console.error('Please set your GITHUB_TOKEN in the .env file.');
        console.error('You can create a token at https://github.com/settings/tokens');
        process.exit(1);
      }

      console.log(`Fetching non-forked repositories for user ${username}...`);
      
      // Fetch repositories
      const repos = await fetchAllRepositories(username);
      
      if (repos.length === 0) {
        console.log('No repositories found for this user.');
        return;
      }
      
      console.log(`\nFound ${repos.length} repositories created by ${username}:\n`);
      
      // Display repos in a formatted table-like output
      repos.forEach((repo, index) => {
        console.log(`${index + 1}. ${repo.name}`);
        console.log(`   Visibility: ${repo.private ? 'Private' : 'Public'}`);
        console.log(`   Stars: ${repo.stargazers_count}`);
        console.log(`   Language: ${repo.language || 'Not specified'}`);
        console.log(`   Created: ${new Date(repo.created_at).toLocaleDateString()}`);
        console.log(`   URL: ${repo.html_url}`);
        if (repo.description) console.log(`   Description: ${repo.description}`);
        console.log('');
      });
    } catch (error) {
      console.error('An error occurred:', error instanceof Error ? error.message : String(error));
    }
  });

program
  .command('archive')
  .description('Archive repositories for a specific GitHub user')
  .argument('<username>', 'GitHub username whose repositories to list')
  .option('--force', 'Skip confirmation prompt', false)
  .action(async (username: string, options: { force: boolean }) => {
    try {
      // Check if token exists
      if (!process.env.GITHUB_TOKEN) {
        console.error('Error: GitHub token not found.');
        console.error('Please set your GITHUB_TOKEN in the .env file.');
        console.error('You can create a token at https://github.com/settings/tokens');
        process.exit(1);
      }

      console.log(`Fetching non-forked repositories for user ${username}...`);
      
      // Fetch repositories
      const repos = await fetchAllRepositories(username);
      
      if (repos.length === 0) {
        console.log('No repositories found for this user.');
        return;
      }
      
      console.log(`Found ${repos.length} repositories created by ${username}.`);
      
      // Let user select repositories to archive
      const selectedRepos = await selectRepositories(repos);
      
      if (selectedRepos.length === 0) {
        console.log('No repositories selected for archiving.');
        return;
      }
      
      // Confirm before archiving unless --force is used
      if (!options.force) {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `You're about to archive ${selectedRepos.length} repositories. This action cannot be easily undone. Continue?`,
            default: false
          }
        ]);
        
        if (!confirm) {
          console.log('Operation cancelled.');
          return;
        }
      }
      
      // Archive selected repositories
      const results = await archiveRepositories(username, selectedRepos);
      
      // Display summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log('\nArchiving complete!');
      console.log(`✅ Successfully archived: ${successful}`);
      if (failed > 0) {
        console.log(`❌ Failed to archive: ${failed}`);
      }
    } catch (error) {
      console.error('An error occurred:', error instanceof Error ? error.message : String(error));
    }
  });

// Fetch all repositories for a user (excluding forks)
async function fetchAllRepositories(username: string): Promise<Repository[]> {
  const repos = [];
  let page = 1;
  let hasNextPage = true;
  
  while (hasNextPage) {
    const response = await octokit.rest.repos.listForUser({
      username,
      per_page: 100,
      page,
      sort: 'updated',
      direction: 'desc'
    });
    
    repos.push(...response.data);
    
    hasNextPage = response.data.length === 100;
    page++;
  }
  
  // Filter out archived repositories and forks
  return repos.filter(repo => !repo.archived && !repo.fork);
}

// Let user select repositories to archive
async function selectRepositories(repos: Repository[]): Promise<string[]> {
  const { selectedRepos } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedRepos',
      message: 'Select repositories to archive:',
      choices: repos.map(repo => ({
        name: `${repo.name} (${repo.private ? 'Private' : 'Public'}, ${repo.stargazers_count} stars, created: ${new Date(repo.created_at).toLocaleDateString()})`,
        value: repo.name,
        short: repo.name
      })),
      pageSize: 20
    }
  ]);
  
  return selectedRepos;
}

// Archive selected repositories
async function archiveRepositories(owner: string, repoNames: string[]): Promise<ArchiveResult[]> {
  console.log('\nStarting archiving process...');
  console.log('-----------------------------');
  
  const results = [];
  
  for (const repoName of repoNames) {
    try {
      process.stdout.write(`Archiving ${repoName}... `);
      
      await octokit.rest.repos.update({
        owner,
        repo: repoName,
        archived: true
      });
      
      console.log('✅ Success');
      results.push({ name: repoName, success: true });
    } catch (error) {
      console.log('❌ Failed');
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      results.push({ name: repoName, success: false, error });
    }
  }
  
  return results;
}

// Start the program
program.parse();