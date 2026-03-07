// const { WebSocketServer } = require('ws');

// const wss = new WebSocketServer({ port: 8080 });
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

// // Function to send messages to specific users
// function sendToUser(userId, data) {
//   const client = clients.get(userId);
//   if (client && client.readyState === 1) { // 1 = OPEN
//     client.send(JSON.stringify(data));
//     return true;
//   }
//   console.log(`⚠️ User ${userId} not connected via WebSocket`);
//   return false;
// }

// module.exports = { sendToUser };