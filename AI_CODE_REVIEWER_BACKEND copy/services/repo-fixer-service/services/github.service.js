// services/github.service.js
const { Octokit } = require('@octokit/rest');

class GitHubService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    console.log('🔧 Initializing GitHub with token:', accessToken.substring(0, 15) + '...');
    
    this.octokit = new Octokit({ 
      auth: accessToken,
      userAgent: 'AI-Repo-Fixer v1.0'
    });
  }

  // Test token validity
  async testToken() {
    try {
      const { data } = await this.octokit.users.getAuthenticated();
      console.log('✅ Authenticated as:', data.login);
      return true;
    } catch (error) {
      console.error('❌ Token test failed:', error.message);
      return false;
    }
  }

  // Extract owner and repo from URL
  parseRepoUrl(url) {
    const cleanUrl = url.replace(/\.git$/, '');
    const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error('Invalid GitHub URL');
    
    return { 
      owner: match[1], 
      repo: match[2].replace(/[^a-zA-Z0-9_-]/g, '')
    };
  }

  // Get all code files from repo
  async getAllFiles(owner, repo) {
    const files = [];
    
    // Get default branch
    const { data: repoData } = await this.octokit.repos.get({ owner, repo });
    const defaultBranch = repoData.default_branch;
    
    // Get entire repo tree
    const { data: tree } = await this.octokit.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: true
    });
    
    // Filter for code files
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.go', '.rb', '.php'];
    
    for (const item of tree.tree) {
      if (item.type === 'blob' && codeExtensions.some(ext => item.path.endsWith(ext))) {
        try {
          const { data: fileData } = await this.octokit.repos.getContent({
            owner,
            repo,
            path: item.path
          });
          
          files.push({
            path: item.path,
            content: Buffer.from(fileData.content, 'base64').toString('utf-8'),
            sha: fileData.sha,
            size: item.size
          });
          
          console.log(`📄 Loaded: ${item.path} (${fileData.sha.substring(0, 7)})`);
        } catch (err) {
          console.log(`⚠️ Could not fetch ${item.path}:`, err.message);
        }
      }
    }
    
    return { files, branch: defaultBranch };
  }

  // Create new branch
  async createBranch(owner, repo, baseBranch, newBranchName) {
    const { data: ref } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`
    });
    
    await this.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranchName}`,
      sha: ref.object.sha
    });
    
    console.log(`🌿 Created branch: ${newBranchName} from ${baseBranch}`);
    return newBranchName;
  }

  // Commit fixed file with verification
  async commitFile(owner, repo, branch, path, content, sha, message) {
    console.log(`📝 Committing ${path} to ${branch}...`);
    
    // Check if file exists in branch and compare content
    let currentContent = null;
    let currentSha = null;
    
    try {
      const { data: currentFile } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch
      });
      
      currentContent = Buffer.from(currentFile.content, 'base64').toString('utf-8');
      currentSha = currentFile.sha;
      
      console.log(`📄 Current file: ${path} (${currentFile.sha.substring(0, 7)})`);
      console.log(`📄 New content length: ${content.length} chars`);
      
      // Show what changed (first 200 chars)
      if (currentContent !== content) {
        console.log('🔍 Changes detected:');
        
        // Simple diff preview
        const oldPreview = currentContent.substring(0, 200).replace(/\n/g, '\\n');
        const newPreview = content.substring(0, 200).replace(/\n/g, '\\n');
        
        if (oldPreview !== newPreview) {
          console.log('   OLD:', oldPreview.substring(0, 100) + '...');
          console.log('   NEW:', newPreview.substring(0, 100) + '...');
        }
      }
      
      // If content hasn't changed, skip commit
      if (currentContent === content) {
        console.log(`⚠️ No changes detected in ${path}, skipping commit`);
        return { content: { html_url: currentFile.html_url } };
      }
      
    } catch (err) {
      console.log(`📝 New file or error checking: ${path}`);
    }
    
    // Commit the changes
    const { data } = await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      sha: sha || currentSha,
      branch
    });
    
    console.log(`✅ Committed ${path} (${data.commit.sha.substring(0, 7)})`);
    
    // Verify the commit actually changed the file
    setTimeout(async () => {
      try {
        const { data: verifyFile } = await this.octokit.repos.getContent({
          owner,
          repo,
          path,
          ref: branch
        });
        const verifyContent = Buffer.from(verifyFile.content, 'base64').toString('utf-8');
        
        if (verifyContent === content) {
          console.log(`✅ Verified: ${path} was updated successfully`);
        } else {
          console.log(`❌ Verification failed: ${path} content mismatch`);
        }
      } catch (err) {
        console.log(`⚠️ Could not verify ${path}:`, err.message);
      }
    }, 2000);
    
    return data;
  }

  // Create Pull Request
  async createPullRequest(owner, repo, title, head, base, body) {
    console.log(`🚀 Creating PR: ${title}`);
    
    const { data } = await this.octokit.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body
    });
    
    console.log(`✅ PR created: ${data.html_url}`);
    return data;
  }
}

module.exports = GitHubService;