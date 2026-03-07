// const WebSocket = require('ws');

// const wss = new WebSocket.Server({ port: 8080 });
// const clients = new Map();

// console.log('🚀 WebSocket Server started on port 8080');

// wss.on('connection', (ws, request) => {
//   console.log('🔗 New WebSocket connection attempt');
  
//   // Extract userId from query parameters
//   const urlParams = new URLSearchParams(request.url?.split('?')[1]);
//   const userId = urlParams.get('userId');
  
//   if (userId) {
//     clients.set(userId, ws);
//     console.log(`✅ User ${userId} connected to WebSocket`);
    
//     // Send immediate confirmation
//     ws.send(JSON.stringify({
//       type: 'connected',
//       message: 'WebSocket connected successfully'
//     }));
//   } else {
//     console.log('❌ No userId provided in connection');
//     ws.close();
//     return;
//   }

//   ws.on('close', () => {
//     if (userId) {
//       clients.delete(userId);
//       console.log(`❌ User ${userId} disconnected from WebSocket`);
//     }
//   });

//   ws.on('error', (error) => {
//     console.error('WebSocket error for user', userId, ':', error);
//   });
// });

// function sendToUser(userId, data) {
//   const client = clients.get(userId);
//   if (client && client.readyState === WebSocket.OPEN) {
//     client.send(JSON.stringify(data));
//     return true;
//   }
//   console.log(`⚠️ User ${userId} not connected via WebSocket`);
//   return false;
// }

// module.exports = { sendToUser };







// In your code_editor.routes.js
router.post('/execute', async (req, res) => {
  try {
    const { code, language } = req.body;
    const user = req.user; // From JWT
    
    console.log('=== DEBUG: EXECUTE ROUTE ===');
    console.log('User:', user);
    console.log('Language:', language);
    console.log('Code received:', code ? `Length: ${code.length} chars` : 'EMPTY');
    console.log('Code preview:', code?.substring(0, 100) || 'NONE');
    
    if (!code || code.trim() === '') {
      return res.status(400).json({ error: 'Code cannot be empty' });
    }
    
    // Send to RabbitMQ
    await sendToQueue(code, language, user.userId, user.username);
    
    res.json({ 
      success: true, 
      message: 'Code sent for execution',
      userId: user.userId
    });
    
  } catch (error) {
    console.error('❌ Error in execute route:', error);
    res.status(500).json({ error: error.message });
  }
});