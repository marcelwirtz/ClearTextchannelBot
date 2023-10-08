const { token, channelIds, textChannelId, roleName } = require('./config.json')
const { Client, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildVoiceStates] });

client.once('ready', () =>{
    console.log(`Bot ready, logged in as ${client.user.tag}!`);
})

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {

    if(newState.channel && channelIds.includes(newState.channel.id)) {
        let role = newState.guild.roles.cache.find(r => r.name == roleName);
        oldState.member.roles.add(role).catch(console.error);
    }

    if(oldState.channel && channelIds.includes(oldState.channel.id)) {
        let role = newState.guild.roles.cache.find(r => r.name == roleName);
        newState.member.roles.remove(role).catch(console.error);
    }

    if(newState.channel == null && channelIds.includes(oldState.channel.id)) {
        // Delete Messages from Text Channel
        oneIsInVoice = false;

        channelIds.forEach(channel => {
            let chan = client.channels.cache.find(c => c.id == channel)
            if(chan && !oneIsInVoice) {
               oneIsInVoice = chan.members.size > 0
            }
        })

        if(!oneIsInVoice) {
            let textChannel = client.channels.cache.find(c => c.id == textChannelId);
            if(textChannel) {
                textChannel.messages.fetch()
                    .then(collected => {
                        textChannel.bulkDelete(collected)
                    })
                    .catch(console.error)
            }
        }
    }
});

client.login(token)
