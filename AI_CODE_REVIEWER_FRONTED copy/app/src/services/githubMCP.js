// src/services/githubMCP.js
// Complete MCP service for GitHub operations

class GitHubMCPService {
  constructor() {
    this.user = null;
    this.jwtToken = null;
    this.githubToken = null;
  }

  // Initialize with GitHub user data
  init(user, jwtToken) {
    this.user = user;
    this.jwtToken = jwtToken;
    
    // Get GitHub access token - it's stored in oauth_token from your JWT
    this.githubToken = user?.oauth_token || user?.github_token;
    
    console.log('✅ MCP Service initialized for:', user?.username || user?.login);
    
    if (this.githubToken) {
      console.log('🔑 GitHub Token:', this.githubToken.substring(0, 15) + '...');
      console.log('📏 Token Length:', this.githubToken.length);
      console.log('🔰 Token Format Valid:', this.githubToken.startsWith('ghp_') ? 'Yes (GitHub PAT)' : 'No (May be invalid)');
    } else {
      console.log('❌ No GitHub token found in user object');
    }
  }

  // Check if user has valid GitHub token
  isGitHubUser() {
    return !!(this.githubToken && this.githubToken.length > 20);
  }

  // Test GitHub token validity
  async testGitHubToken() {
    if (!this.githubToken) {
      return { valid: false, error: 'No GitHub token found' };
    }

    try {
      console.log('🔍 Testing GitHub token...');
      
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'Accept': 'application/json',
          'User-Agent': 'AI-Code-Reviewer-App'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ GitHub token is VALID for:', userData.login);
        return { valid: true, user: userData.login };
      } else {
        const error = await response.json();
        console.error('❌ GitHub token INVALID:', error.message);
        return { valid: false, error: error.message };
      }
    } catch (error) {
      console.error('❌ Error testing token:', error.message);
      return { valid: false, error: error.message };
    }
  }

  // Generate repository name
  getRepoName() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6);
    return `ai-code-${year}${month}${day}-${random}`;
  }

  // ONE CLICK - Push code to GitHub
  async pushToGitHub(code, language, customFileName = null) {
    // Check if we have GitHub token
    if (!this.githubToken) {
      throw new Error('GitHub token not found. Please login with GitHub again.');
    }

    console.log('🚀 MCP: Starting GitHub push...');

    // Get GitHub username
    const username = this.user?.login || this.user?.username;
    
    if (!username) {
      throw new Error('Could not determine GitHub username');
    }

    // File extension mapping
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      typescript: 'ts',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      swift: 'swift',
      kotlin: 'kt'
    };

    const ext = extensions[language] || 'txt';
    
    // Generate filename
    const timestamp = Date.now();
    const fileName = customFileName || `code-review-${timestamp}`;
    const fullFileName = fileName.includes('.') ? fileName : `${fileName}.${ext}`;

    // Generate repo name
    const repoName = this.getRepoName();

    try {
      // STEP 1: Check if repository exists
      console.log(`🔍 Checking repository: ${username}/${repoName}`);
      
      const checkRepoResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'Accept': 'application/json',
          'User-Agent': 'AI-Code-Reviewer-App'
        }
      });

      // STEP 2: Create repository if it doesn't exist
      if (checkRepoResponse.status === 404) {
        console.log('📦 Creating new repository:', repoName);
        
        const createRepoResponse = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'AI-Code-Reviewer-App'
          },
          body: JSON.stringify({
            name: repoName,
            description: `🤖 AI Code Review - ${new Date().toLocaleString()}`,
            private: false,
            auto_init: true,
            has_issues: true,
            has_projects: true,
            has_wiki: true
          })
        });

        const repoData = await createRepoResponse.json();
        
        if (!createRepoResponse.ok) {
          if (createRepoResponse.status === 401) {
            throw new Error('GitHub authentication failed. Please re-login.');
          }
          throw new Error(repoData.message || 'Failed to create repository');
        }
        
        console.log('✅ Repository created:', repoData.html_url);
        
        // Wait a moment for GitHub to initialize the repo
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } else if (!checkRepoResponse.ok) {
        const errorData = await checkRepoResponse.json();
        throw new Error(errorData.message || 'Failed to check repository');
      } else {
        console.log('✅ Repository already exists');
      }

      // STEP 3: Check if file exists to get SHA (for update)
      console.log(`📝 Checking file: ${fullFileName}`);
      
      let sha = null;
      const checkFileResponse = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/contents/${fullFileName}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/json',
            'User-Agent': 'AI-Code-Reviewer-App'
          }
        }
      );

      if (checkFileResponse.ok) {
        const fileData = await checkFileResponse.json();
        sha = fileData.sha;
        console.log('📝 File exists, will update (SHA:', sha.substring(0, 7) + '...)');
      }

      // STEP 4: Create/Update file via GitHub API
      console.log('📤 Uploading file:', fullFileName);
      
      // Convert code to base64
      const encoder = new TextEncoder();
      const codeBytes = encoder.encode(code);
      let base64Code;
      
      try {
        base64Code = btoa(String.fromCharCode(...codeBytes));
      } catch (e) {
        // Fallback for Unicode characters
        base64Code = btoa(unescape(encodeURIComponent(code)));
      }

      const fileResponse = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/contents/${fullFileName}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'AI-Code-Reviewer-App'
          },
          body: JSON.stringify({
            message: `🤖 Add ${fullFileName} via MCP - ${new Date().toLocaleString()}`,
            content: base64Code,
            branch: 'main',
            sha: sha // Include SHA if updating existing file
          })
        }
      );

      const fileData = await fileResponse.json();

      if (!fileResponse.ok) {
        if (fileResponse.status === 401) {
          throw new Error('GitHub authentication failed. Please re-login.');
        }
        if (fileResponse.status === 403) {
          throw new Error('Permission denied. Check your GitHub token permissions.');
        }
        throw new Error(fileData.message || 'Failed to push code');
      }

      console.log('✅ File uploaded successfully:', fileData.content?.html_url);

      // STEP 5: Create/Update README.md
      try {
        const readmeContent = `# ${repoName}

## 🤖 AI Code Review

This code was pushed using **MCP (Model Context Protocol)** from the AI Code Reviewer.

### 📝 Code Details
- **Language:** ${language}
- **File:** \`${fullFileName}\`
- **Date:** ${new Date().toLocaleString()}
- **User:** [${username}](https://github.com/${username})

### 📋 Code Content
\`\`\`${language}
${code.split('\n').slice(0, 10).join('\n')}
${code.split('\n').length > 10 ? '...' : ''}
\`\`\`

### 🔗 Links
- [View Code](${fileData.content?.html_url})
- [Repository](https://github.com/${username}/${repoName})

---
*Pushed with ❤️ using [AI Code Reviewer](https://github.com) MCP*
`;

        // Check if README exists
        const readmeCheckResponse = await fetch(
          `https://api.github.com/repos/${username}/${repoName}/contents/README.md`,
          {
            headers: {
              'Authorization': `token ${this.githubToken}`,
              'Accept': 'application/json',
              'User-Agent': 'AI-Code-Reviewer-App'
            }
          }
        );

        let readmeSha = null;
        if (readmeCheckResponse.ok) {
          const readmeData = await readmeCheckResponse.json();
          readmeSha = readmeData.sha;
        }

        // Encode README content
        const encoder2 = new TextEncoder();
        const readmeBytes = encoder2.encode(readmeContent);
        let encodedReadme;
        
        try {
          encodedReadme = btoa(String.fromCharCode(...readmeBytes));
        } catch (e) {
          encodedReadme = btoa(unescape(encodeURIComponent(readmeContent)));
        }

        await fetch(
          `https://api.github.com/repos/${username}/${repoName}/contents/README.md`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `token ${this.githubToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'AI-Code-Reviewer-App'
            },
            body: JSON.stringify({
              message: `📚 Update README via MCP - ${new Date().toLocaleString()}`,
              content: encodedReadme,
              branch: 'main',
              sha: readmeSha
            })
          }
        );
        
        console.log('✅ README updated');
      } catch (readmeError) {
        console.log('README update skipped (non-critical):', readmeError.message);
      }

      return {
        success: true,
        repoUrl: `https://github.com/${username}/${repoName}`,
        fileUrl: fileData.content?.html_url,
        repoName,
        username,
        fileName: fullFileName,
        language,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ MCP Push failed:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('401') || error.message.includes('authentication')) {
        throw new Error('GitHub authentication failed. Please logout and login again with GitHub.');
      } else if (error.message.includes('403')) {
        throw new Error('Permission denied. Make sure your GitHub token has "repo" scope.');
      } else if (error.message.includes('422')) {
        throw new Error('Repository already exists with different ownership.');
      }
      
      throw error;
    }
  }

  // Get user's repositories
  async getUserRepos(limit = 10) {
    if (!this.githubToken) {
      throw new Error('No GitHub token found');
    }

    const username = this.user?.login || this.user?.username;

    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=${limit}`, {
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'Accept': 'application/json',
          'User-Agent': 'AI-Code-Reviewer-App'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const repos = await response.json();
      
      return repos.map(repo => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        updatedAt: repo.updated_at,
        language: repo.language,
        private: repo.private
      }));
    } catch (error) {
      console.error('❌ Failed to fetch repos:', error);
      throw error;
    }
  }
}

export default new GitHubMCPService();