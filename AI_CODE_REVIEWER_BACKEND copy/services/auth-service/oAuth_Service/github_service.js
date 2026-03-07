// const passport = require('passport')
// const GitHubStrategy = require('passport-github2').Strategy
// const axios = require('axios')
// const bcrypt = require('bcryptjs')
// const User = require('../models/User')
// require('dotenv').config()

// passport.use(
//   new GitHubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: process.env.GITHUB_CALLBACK_URL
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email =
//           profile.emails?.[0]?.value || `${profile.id}@github.com`

//         const reposResponse = await axios.get(
//           'https://api.github.com/user/repos',
//           { headers: { Authorization: `token ${accessToken}` } }
//         )

//         const repoNames = reposResponse.data.map(repo => repo.name)

//         const githubData = {
//           username: profile.displayName || profile.username,
//           login: profile.username,
//           email,
//           avatar_url: profile._json.avatar_url,
//           bio: profile._json.bio,
//           blog: profile._json.blog,
//           company: profile._json.company,
//           location: profile._json.location,
//           github_id: profile.id,
//           followers: profile._json.followers,
//           following: profile._json.following,
//           created_at: profile._json.created_at,
//           repos: repoNames
//         }

//         let user = await User.findOne({ oauth_token: profile.id })

//         if (!user) {
//           user = new User({
//             ...githubData,
//             password: await bcrypt.hash('oauth', 10),
//             oauth_token: profile.id,
//             role: 'participant'
//           })
//           await user.save()
//         } else {
//           Object.assign(user, githubData)
//           await user.save()
//         }

//         done(null, user)
//       } catch (err) {
//         done(err)
//       }
//     }
//   )
// )

// passport.serializeUser((user, done) => done(null, user.id))
// passport.deserializeUser(async (id, done) => {
//   const user = await User.findById(id)
//   done(null, user)
// })

// module.exports = passport





// upadting because only for mcp integration


// auth-service/oAuth_Service/github_service.js
// oAuth_Service/github_service.js - FIXED VERSION
const passport = require('passport')
const GitHubStrategy = require('passport-github2').Strategy
const axios = require('axios')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
require('dotenv').config()

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('✅ GitHub OAuth successful for:', profile.username);
        console.log('🔑 Access Token received:', accessToken.substring(0, 15) + '...');
        console.log('📏 Access Token length:', accessToken.length);
        console.log('🔰 Token format:', accessToken.startsWith('gho_') ? 'Valid GitHub OAuth token' : 'Unknown format');
        
        const email = profile.emails?.[0]?.value || `${profile.id}@github.com`

        // Fetch user's repositories using the access token
        let repoNames = [];
        try {
          const reposResponse = await axios.get(
            'https://api.github.com/user/repos',
            { 
              headers: { 
                Authorization: `token ${accessToken}`,
                Accept: 'application/json'
              },
              timeout: 5000
            }
          )
          repoNames = reposResponse.data.map(repo => repo.name)
          console.log(`📚 Fetched ${repoNames.length} repositories`);
        } catch (repoError) {
          console.error('❌ Failed to fetch repos:', repoError.message);
          // Continue even if repos fail - not critical
        }

        // GitHub user data from profile
        const githubData = {
          username: profile.displayName || profile.username,
          login: profile.username,
          email,
          avatar_url: profile._json.avatar_url,
          bio: profile._json.bio,
          blog: profile._json.blog,
          company: profile._json.company,
          location: profile._json.location,
          github_id: profile.id,           // Store GitHub ID here
          followers: profile._json.followers,
          following: profile._json.following,
          created_at: profile._json.created_at,
          repos: repoNames,
          // ⚠️ CRITICAL: Store the ACTUAL access token in multiple fields
          oauth_token: accessToken,        // REAL GitHub access token
          github_token: accessToken,       // Backup field
          github_access_token: accessToken // Another backup field
        }

        // Find user by GitHub ID
        let user = await User.findOne({ github_id: profile.id })

        if (!user) {
          // Create new user
          user = new User({
            ...githubData,
            password: await bcrypt.hash('oauth', 10),
            role: 'participant'
          })
          await user.save()
          console.log('✅ New GitHub user created:', user.username);
          console.log('🔐 Access token saved to database (length:', accessToken.length, ')');
          console.log('🔑 Token preview:', accessToken.substring(0, 20) + '...');
        } else {
          // Update existing user
          Object.assign(user, githubData);
          await user.save();
          console.log('✅ Existing GitHub user updated:', user.username);
          console.log('🔐 Access token updated in database (length:', accessToken.length, ')');
        }

        done(null, user)
      } catch (err) {
        console.error('❌ GitHub OAuth error:', err);
        done(err)
      }
    }
  )
)

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err)
  }
})

module.exports = passport