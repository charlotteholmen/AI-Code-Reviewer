// controllers/repo.controller.js
const Analysis = require('../models/analysis.model')
const GitHubService = require('../services/github.service')
const aiService = require('../services/ai.service.js')



// const aiService = require('../services/ai.service');  // This is the local one!

// 📥 Step 1: Import and Analyze Repository
exports.analyzeRepo = async (req, res) => {
  try {
    const { repoUrl, accessToken } = req.body
    const userId = req.user.userId

    console.log(
      '🔑 Received GitHub token:',
      accessToken ? accessToken.substring(0, 15) + '...' : 'MISSING'
    )
    console.log('👤 User ID:', userId)

    if (!accessToken) {
      return res.status(400).json({ error: 'GitHub access token required' })
    }

    // Initialize GitHub service with token
    const github = new GitHubService(accessToken)

    // Test the token first
    const isValid = await github.testToken()
    if (!isValid) {
      return res.status(403).json({ error: 'Invalid GitHub token' })
    }

    // Parse repo URL
    const { owner, repo } = github.parseRepoUrl(repoUrl)
    console.log(`📦 Analyzing ${owner}/${repo}`)

    // Get all files
    const { files, branch } = await github.getAllFiles(owner, repo)
    console.log(`📁 Found ${files.length} files`)

    // Create analysis record in DB
    const analysis = new Analysis({
      userId,
      repoUrl,
      owner,
      repo,
      branch,
      filesAnalyzed: files.length,
      bugsFound: 0,
      files: files.map(f => ({
        path: f.path,
        content: f.content,
        sha: f.sha,
        issues: []
      })),
      status: 'analyzing'
    })
    await analysis.save()

    // Analyze each file with AI
    let totalBugs = 0

    for (let i = 0; i < analysis.files.length; i++) {
      const file = analysis.files[i]

      // Find bugs using AI
      const issues = await aiService.findBugs(file.content, file.path)

      analysis.files[i].issues = issues
      totalBugs += issues.length

      // Update progress every 5 files
      if (i % 5 === 0) {
        analysis.bugsFound = totalBugs
        await analysis.save()
        console.log(
          `📊 Progress: ${i}/${analysis.files.length} files, ${totalBugs} bugs found`
        )
      }
    }

    // Final update
    analysis.bugsFound = totalBugs
    analysis.status = 'analyzed'
    await analysis.save()

    res.json({
      success: true,
      analysisId: analysis._id,
      files: files.length,
      bugs: totalBugs,
      details: analysis.files.map(f => ({
        path: f.path,
        issues: f.issues.length
      }))
    })
  } catch (error) {
    console.error('❌ Analysis error:', error)
    res.status(500).json({ error: error.message })
  }
}

// ✨ Step 2: Fix All Bugs and Create PR
// In your fixRepo function, add better error logging

exports.fixRepo = async (req, res) => {
  try {
    const { analysisId, accessToken } = req.body
    const userId = req.user.userId

    const analysis = await Analysis.findById(analysisId)
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' })
    }

    if (analysis.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const totalBugs = analysis.files.reduce(
      (sum, file) => sum + file.issues.length,
      0
    )

    if (totalBugs === 0) {
      return res.status(400).json({
        error: 'No bugs found to fix',
        message: '✨ No issues detected.'
      })
    }

    analysis.status = 'fixing'
    await analysis.save()

    const github = new GitHubService(accessToken)
    const { owner, repo } = analysis

    const branchName = `ai-fix-${Date.now()}`
    await github.createBranch(owner, repo, analysis.branch, branchName)

    let fixedCount = 0
    const fixedFiles = []

    for (const file of analysis.files) {
      if (file.issues.length > 0) {
        try {
          console.log(`\n🔧 Fixing ${file.path}...`)
          console.log('Issues:', JSON.stringify(file.issues, null, 2))

          const fixedCode = await aiService.generateFix(
            file.content,
            file.issues,
            file.path
          )

          if (fixedCode === file.content) {
            console.log(`⚠️ No changes for ${file.path}`)
            fixedFiles.push({
              path: file.path,
              status: 'skipped',
              reason: 'No changes generated'
            })
            continue
          }

          const commitResult = await github.commitFile(
            owner,
            repo,
            branchName,
            file.path,
            fixedCode,
            file.sha,
            `🤖 AI Fix: ${file.path} - Fixed ${file.issues.length} issues`
          )

          fixedCount++
          fixedFiles.push({
            path: file.path,
            status: 'fixed',
            url: commitResult.content?.html_url
          })
          console.log(`✅ Fixed ${file.path}`)
        } catch (fileError) {
          console.error(`❌ Failed to fix ${file.path}:`, fileError.message)
          fixedFiles.push({
            path: file.path,
            status: 'failed',
            error: fileError.message
          })
        }
      }
    }

    if (fixedCount === 0) {
      return res.status(400).json({
        error: 'No files were fixed',
        details: fixedFiles
      })
    }

    const pr = await github.createPullRequest(
      owner,
      repo,
      `🤖 AI Auto-Fixed ${fixedCount} Bug${fixedCount > 1 ? 's' : ''}`,
      branchName,
      analysis.branch,
      `## 🤖 AI-Generated Fixes\n\n` +
        `- Files fixed: ${fixedCount}\n` +
        `- Total bugs: ${totalBugs}\n\n` +
        fixedFiles
          .filter(f => f.status === 'fixed')
          .map(f => `- ✅ ${f.path}`)
          .join('\n')
    )

    analysis.prUrl = pr.html_url
    analysis.status = 'fixed'
    await analysis.save()

    res.json({
      success: true,
      prUrl: pr.html_url,
      fixedFiles: fixedCount
    })
  } catch (error) {
    console.error('❌ Fix error:', error)
    res.status(500).json({ error: error.message })
  }
}

// 📊 Get analysis status
exports.getAnalysis = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const analysis = await Analysis.findOne({ _id: id, userId })

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' })
    }

    // Count total issues
    const totalIssues = analysis.files.reduce(
      (sum, file) => sum + file.issues.length,
      0
    )

    res.json({
      success: true,
      id: analysis._id,
      repoUrl: analysis.repoUrl,
      owner: analysis.owner,
      repo: analysis.repo,
      status: analysis.status,
      files: analysis.files.length,
      bugs: totalIssues,
      prUrl: analysis.prUrl,
      createdAt: analysis.createdAt,
      details: analysis.files.map(f => ({
        path: f.path,
        issues: f.issues.length,
        issuesList: f.issues
      }))
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 📋 Get user's analyses
exports.getUserAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20)

    res.json({
      success: true,
      count: analyses.length,
      analyses: analyses.map(a => {
        const totalIssues = a.files.reduce((sum, f) => sum + f.issues.length, 0)
        return {
          id: a._id,
          repoUrl: a.repoUrl,
          repoName: `${a.owner}/${a.repo}`,
          files: a.filesAnalyzed,
          bugs: totalIssues,
          status: a.status,
          prUrl: a.prUrl,
          date: a.createdAt
        }
      })
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🗑️ Delete analysis
exports.deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const analysis = await Analysis.findOne({ _id: id, userId })

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' })
    }

    await analysis.deleteOne()

    res.json({
      success: true,
      message: 'Analysis deleted successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
