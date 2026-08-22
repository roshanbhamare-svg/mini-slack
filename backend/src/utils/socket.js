const Message = require('../models/Message');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a specific channel room
    socket.on('join_channel', ({ channelId }) => {
      // Leave all other rooms except the socket's own ID room
      Array.from(socket.rooms).forEach((room) => {
        if (room !== socket.id) socket.leave(room);
      });
      socket.join(channelId);
      console.log(`Socket ${socket.id} joined channel: ${channelId}`);
    });

    // Handle sending a new message
    socket.on('send_message', async (data) => {
      try {
        const { content, channelId, senderId, threadId } = data;
        const newMessage = new Message({
          content,
          channel: channelId,
          sender: senderId,
          threadId: threadId || undefined,
        });
        
        await newMessage.save();
        const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'username avatarUrl');
        
        // Broadcast to everyone in the channel
        io.to(channelId).emit('receive_message', populatedMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Handle message deletion
    socket.on('delete_message', async ({ messageId, channelId }) => {
      try {
        const message = await Message.findById(messageId);
        if (message) {
          message.isDeleted = true;
          message.content = 'This message was deleted.';
          await message.save();
          io.to(channelId).emit('message_deleted', messageId);
        }
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    });

    // Handle adding reaction
    socket.on('add_reaction', async ({ messageId, channelId, emoji, userId }) => {
      try {
        const message = await Message.findById(messageId);
        if (message) {
          const existingReaction = message.reactions.find(r => r.user.toString() === userId && r.emoji === emoji);
          if (!existingReaction) {
            message.reactions.push({ emoji, user: userId });
            await message.save();
            const populatedMessage = await Message.findById(message._id).populate('sender', 'username avatarUrl');
            io.to(channelId).emit('reaction_updated', populatedMessage);
          }
        }
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
