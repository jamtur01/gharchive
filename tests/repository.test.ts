import * as dotenv from 'dotenv';

// Create mocks for octokit module
const mockListForUser = jest.fn();

jest.mock('octokit', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        listForUser: mockListForUser,
        update: mockUpdateRepo,
        delete: mockDeleteRepo
      }
    }
  }))
}));

jest.mock('dotenv');

// Sample repository data for tests
const mockRepoData = [
  {
    name: 'test-repo-1',
    full_name: 'testuser/test-repo-1',
    private: false,
    html_url: 'https://github.com/testuser/test-repo-1',
    description: 'Test repository 1',
    fork: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
    pushed_at: '2025-01-03T00:00:00Z',
    stargazers_count: 5,
    language: 'TypeScript',
    archived: false,
  },
  {
    name: 'test-repo-2',
    full_name: 'testuser/test-repo-2',
    private: true,
    html_url: 'https://github.com/testuser/test-repo-2',
    description: 'Test repository 2',
    fork: false,
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-02T00:00:00Z',
    pushed_at: '2025-02-03T00:00:00Z',
    stargazers_count: 10,
    language: 'JavaScript',
    archived: false,
  },
  {
    name: 'test-fork-1',
    full_name: 'testuser/test-fork-1',
    private: false,
    html_url: 'https://github.com/testuser/test-fork-1',
    description: 'Test fork 1',
    fork: true,
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-02T00:00:00Z',
    pushed_at: '2025-03-03T00:00:00Z',
    stargazers_count: 3,
    language: 'Python',
    archived: false,
  },
  {
    name: 'test-archived',
    full_name: 'testuser/test-archived',
    private: false,
    html_url: 'https://github.com/testuser/test-archived',
    description: 'Test archived repository',
    fork: false,
    created_at: '2025-04-01T00:00:00Z',
    updated_at: '2025-04-02T00:00:00Z',
    pushed_at: '2025-04-03T00:00:00Z',
    stargazers_count: 2,
    language: 'TypeScript',
    archived: true,
  },
];

// Create a second page of mock data for pagination testing
const mockRepoDataPage2 = [
  {
    name: 'test-repo-3',
    full_name: 'testuser/test-repo-3',
    private: false,
    html_url: 'https://github.com/testuser/test-repo-3',
    description: 'Test repository 3',
    fork: false,
    created_at: '2025-05-01T00:00:00Z',
    updated_at: '2025-05-02T00:00:00Z',
    pushed_at: '2025-05-03T00:00:00Z',
    stargazers_count: 7,
    language: 'TypeScript',
    archived: false,
  }
];

// Mock for repo update and delete operations
const mockUpdateRepo = jest.fn();
const mockDeleteRepo = jest.fn();

// Import the functions after mocking
import {
  fetchAllRepositories,
  fetchForkRepositories,
  archiveRepositories,
  deleteRepositories
} from '../src/repository-functions';

describe('Repository Functions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset all the mock implementations
    mockListForUser.mockReset();
    mockUpdateRepo.mockReset();
    mockDeleteRepo.mockReset();
    
    // Default setup - single page of results
    mockListForUser.mockResolvedValue({
      data: mockRepoData
    });
  });

  describe('fetchAllRepositories', () => {
    it('should fetch non-forked and non-archived repositories', async () => {
      const repositories = await fetchAllRepositories('testuser');
      
      // Should return only non-forked and non-archived repos
      expect(repositories).toHaveLength(2);
      expect(repositories[0].name).toBe('test-repo-1');
      expect(repositories[1].name).toBe('test-repo-2');
      expect(repositories.every(repo => !repo.fork && !repo.archived)).toBe(true);
      
      // Verify the API was called with correct parameters
      expect(mockListForUser).toHaveBeenCalledWith({
        username: 'testuser',
        per_page: 100,
        page: 1,
        sort: 'updated',
        direction: 'desc',
      });
    });
    
    it('should handle pagination correctly', async () => {
      // Setup pagination mock - first call returns page 1, second call returns page 2
      mockListForUser
        .mockResolvedValueOnce({
          data: Array(100).fill(mockRepoData[0]) // Return 100 items to trigger pagination
        })
        .mockResolvedValueOnce({
          data: mockRepoDataPage2
        });
      
      const repositories = await fetchAllRepositories('testuser');
      
      // Should have called the API twice (for both pages)
      expect(mockListForUser).toHaveBeenCalledTimes(2);
      expect(mockListForUser).toHaveBeenNthCalledWith(1, {
        username: 'testuser',
        per_page: 100,
        page: 1,
        sort: 'updated',
        direction: 'desc',
      });
      expect(mockListForUser).toHaveBeenNthCalledWith(2, {
        username: 'testuser',
        per_page: 100,
        page: 2,
        sort: 'updated',
        direction: 'desc',
      });
      
      // Should have combined results from both pages
      expect(repositories.length).toBeGreaterThan(100);
    });
    
    it('should handle API errors gracefully', async () => {
      // Setup mock to throw an error
      mockListForUser.mockRejectedValue(new Error('API error'));
      
      // The function should propagate the error
      await expect(fetchAllRepositories('testuser')).rejects.toThrow('API error');
    });
  });

  describe('fetchForkRepositories', () => {
    it('should fetch only fork repositories that are not archived', async () => {
      const repositories = await fetchForkRepositories('testuser');
      
      // Should return only forked repos that are not archived
      expect(repositories).toHaveLength(1);
      expect(repositories[0].name).toBe('test-fork-1');
      expect(repositories.every(repo => repo.fork && !repo.archived)).toBe(true);
      
      // Verify the API was called with correct parameters
      expect(mockListForUser).toHaveBeenCalledWith({
        username: 'testuser',
        per_page: 100,
        page: 1,
        sort: 'updated',
        direction: 'desc',
      });
    });
  });
  
  describe('archiveRepositories', () => {
    it('should archive the specified repositories', async () => {
      // Setup successful archiving
      mockUpdateRepo.mockResolvedValue({ status: 200 });
      
      const results = await archiveRepositories('testuser', ['test-repo-1', 'test-repo-2']);
      
      // Should have called the update API twice
      expect(mockUpdateRepo).toHaveBeenCalledTimes(2);
      expect(mockUpdateRepo).toHaveBeenNthCalledWith(1, {
        owner: 'testuser',
        repo: 'test-repo-1',
        archived: true
      });
      expect(mockUpdateRepo).toHaveBeenNthCalledWith(2, {
        owner: 'testuser',
        repo: 'test-repo-2',
        archived: true
      });
      
      // Should return success results
      expect(results).toHaveLength(2);
      expect(results.every(result => result.success)).toBe(true);
    });
    
    it('should handle errors when archiving repositories', async () => {
      // First call succeeds, second fails
      mockUpdateRepo
        .mockResolvedValueOnce({ status: 200 })
        .mockRejectedValueOnce(new Error('API error'));
      
      const results = await archiveRepositories('testuser', ['test-repo-1', 'test-repo-2']);
      
      // Should return mixed results
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeDefined();
    });
  });
  
  describe('deleteRepositories', () => {
    it('should delete the specified repositories', async () => {
      // Setup successful deletion
      mockDeleteRepo.mockResolvedValue({ status: 204 });
      
      const results = await deleteRepositories('testuser', ['test-fork-1']);
      
      // Should have called the delete API
      expect(mockDeleteRepo).toHaveBeenCalledWith({
        owner: 'testuser',
        repo: 'test-fork-1'
      });
      
      // Should return success results
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
    });
    
    it('should handle errors when deleting repositories', async () => {
      // Setup failed deletion
      mockDeleteRepo.mockRejectedValue(new Error('Not found'));
      
      const results = await deleteRepositories('testuser', ['non-existent-repo']);
      
      // Should return failure results
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBeDefined();
    });
  });
});