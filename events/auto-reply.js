module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        try {
            // Auto-reply logic here
            const content = message.content.toLowerCase();
            
            // Example auto-replies
            if (content.includes('hello') || content.includes('hi')) {
                message.reply('Hello! How can I help you?');
            }
            
            if (content.includes('thanks') || content.includes('thank you')) {
                message.reply('You\'re welcome!');
            }
            
            if (content.includes('help')) {
                message.reply('Type `!help` to see available commands!');
            }
            
        } catch (error) {
            console.error('Auto-reply error:', error);
        }
    }
};