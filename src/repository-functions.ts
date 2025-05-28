import { Octokit } from "octokit";

// Define types
export interface Repository {
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

export interface OperationResult {
  name: string;
  success: boolean;
  error?: unknown;
}

// Initialize GitHub API client
const getOctokit = (): Octokit => {
  return new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });
};

// Fetch all repositories for a user (excluding forks)
export async function fetchAllRepositories(username: string): Promise<Repository[]> {
  const octokit = getOctokit();
  const repos = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await octokit.rest.repos.listForUser({
      username,
      per_page: 100,
      page,
      sort: "updated",
      direction: "desc",
    });

    repos.push(...response.data);

    hasNextPage = response.data.length === 100;
    page++;
  }

  // Filter out archived repositories and forks
  return repos.filter((repo) => !repo.archived && !repo.fork);
}

// Fetch all fork repositories for a user
export async function fetchForkRepositories(username: string): Promise<Repository[]> {
  const octokit = getOctokit();
  const repos = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await octokit.rest.repos.listForUser({
      username,
      per_page: 100,
      page,
      sort: "updated",
      direction: "desc",
    });

    repos.push(...response.data);

    hasNextPage = response.data.length === 100;
    page++;
  }

  // Filter to include only forks that are not archived
  return repos.filter((repo) => repo.fork && !repo.archived);
}

// Archive selected repositories
export async function archiveRepositories(
  owner: string,
  repoNames: string[]
): Promise<OperationResult[]> {
  const octokit = getOctokit();
  console.log("\nStarting archiving process...");
  console.log("-----------------------------");

  const results = [];

  for (const repoName of repoNames) {
    try {
      process.stdout.write(`Archiving ${repoName}... `);

      await octokit.rest.repos.update({
        owner,
        repo: repoName,
        archived: true,
      });

      console.log("✅ Success");
      results.push({ name: repoName, success: true });
    } catch (error) {
      console.log("❌ Failed");
      console.error(
        `   Error: ${error instanceof Error ? error.message : String(error)}`
      );
      results.push({ name: repoName, success: false, error });
    }
  }

  return results;
}

// Delete selected repositories
export async function deleteRepositories(
  owner: string,
  repoNames: string[]
): Promise<OperationResult[]> {
  const octokit = getOctokit();
  console.log("\nStarting deletion process...");
  console.log("---------------------------");

  const results = [];

  for (const repoName of repoNames) {
    try {
      process.stdout.write(`Deleting ${repoName}... `);

      await octokit.rest.repos.delete({
        owner,
        repo: repoName,
      });

      console.log("✅ Success");
      results.push({ name: repoName, success: true });
    } catch (error) {
      console.log("❌ Failed");
      console.error(
        `   Error: ${error instanceof Error ? error.message : String(error)}`
      );
      results.push({ name: repoName, success: false, error });
    }
  }

  return results;
}