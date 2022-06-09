const Discord = require("discord.js");
const { mongo_host, mongo_port, mongo_user, mongo_pass, mongo_db, discord_prefix, discord_token, discord_activity_message, email_domain, logs_channel, ux_contact_username, ux_contact_id, ux_bot_name } = require("./config.json");
const client = new Discord.Client();

var fs = require('fs');
var readline = require('readline');
// verified-users , login-attempts
var MongoClient = require('mongodb').MongoClient;
var url = `mongodb://${mongo_user}:${mongo_pass}@${mongo_host}:${mongo_port}/admin`;
var mongoDB;
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    mongoDB = db.db(mongo_db);
})

client.once("ready", () => {
    console.log("Ready!");
    client.user.setActivity(discord_activity_message, {
        type: "PLAYING"
    });
});

client.once("reconnecting", () => {
    console.log("Reconnecting!");
});

client.once("disconnect", () => {
    console.log("Disconnect!");
});

client.on('guildMemberAdd', member => {
    onFirstJoin(member);
});

client.on("message", async(message) => {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') {
        message.channel.send(`>>> For **support** please contact **${ux_contact_username}**!`);
        return;
    }
    if (!await message.member.guild.channels.cache.find(channel => channel.name === "verification") && !message.content.startsWith(`${discord_prefix}`)) {
        message.channel.send(">>> Thank you for using **Saints Verify**.  To get started, please run '!svSetup'!");
        return;
    }
    if (await message.member.roles.cache.find(r => r.name === "Unverified")) {
        if (message.channel.id == message.member.guild.channels.cache.find(channel => channel.name === "verification").id) {
            if (message.content.startsWith(`${discord_prefix}email`)) {
                verificationSyntaxCheck(message);
                return;
            } else {
                message.reply(`This channel is only for verifications!  Please use the !email command. Example "!email example@${email_domain}"`)
                    .then(msg => {
                        msg.delete({ timeout: 6000 })
                    })
                message.delete({ timeout: 100 });
            }
        }
    }
    if (message.content == `${discord_prefix}help`) {
        const HelpMenu = new Discord.MessageEmbed()
            .setColor('#7100FF')
            .setTitle('SaintsVerify')
            .setURL('https://www.tgmstudios.net/')
            .setAuthor('SaintsVerify - Bot by TGMstudios', 'https://downloads.tgmstudios.net/icons/discord-bots/Saints-Verify.png', 'https://www.tgmstudios.net')
            .setDescription('Custom verification bot created by TGMstudios. If you have any problems email the developer at aiden@tgmstudios.net')
            .setThumbnail('https://downloads.tgmstudios.net/icons/discord-bots/Saints-Verify.png')
            .addFields({ name: 'User Commands', value: 'Commands that can be run by anyone:' }, { name: '\u200B', value: '\u200B' }, { name: '!help', value: 'Shows list of commands', inline: true }, { name: '!email (SAHS email)', value: 'Verifies you with the email you provided', inline: true }, { name: '\u200B', value: '\u200B' }, { name: 'Other Catagories', value: 'Commands that can be run by moderators:' }, { name: '\u200B', value: '\u200B' }, { name: '!help ServerAdmin', value: 'Shows a list of commands for Server Admins', inline: true }, { name: '!help BotAdmin', value: 'Shows a list of commands for Bot Admins', inline: true }, )
            .setTimestamp()
            .setFooter('aiden@tgmstudios.net || SaintsVerify', 'https://downloads.tgmstudios.net/icons/discord-bots/Saints-Verify.png');

        message.channel.send(HelpMenu);
    } else if (message.content == `${discord_prefix}help ServerAdmin`) {
        const HelpMenu = new Discord.MessageEmbed()
            .setColor('#7100FF')
            .setTitle('SaintsVerify')
            .setURL('https://www.tgmstudios.net/')
            .setAuthor('SaintsVerify - Bot by TGMstudios', 'https://downloads.tgmstudios.net/icons/discord-bots/Saints-Verify.png', 'https://www.tgmstudios.net')
            .setDescription('Custom verification bot created by TGMstudios. If you have any problems email the developer at aiden@tgmstudios.net')
            .setThumbnail('https://downloads.tgmstudios.net/icons/discord-bots/Saints-Verify.png')
            .addFields({ name: 'Server Admin Commands', value: 'Commands that can be run by anyone with the "ADMINISTRATOR" role:' }, { name: '\u200B', value: '\u200B' }, { name: '!svSetup', value: 'Runs automatic bot setup', inline: true }, { name: '!svVerify (@mention)', value: 'Gives the "verified" role to a user', inline: true }, { name: '!svBan (@mention) (Reason)', value: 'Removes the "verified" role from a user', inline: true }, { name: '!svSearchAccount (UserID)', value: 'Outputs the email assigned to a user', inline: true }, { name: '!svSearchAttempts (UserID)', value: 'Outputs the amount of attempts a user has used', inline: true }, { name: '!svCheckGuild (GuildID)', value: 'Checks a server for the required channels and roles', inline: true }, { name: '!svCheckEmail (Email)', value: 'Tests an email to see if its valid', inline: true }, { name: '!svVerifyAll [all]', value: 'Gives everyone who has a linked email the verified role, or gives everyone on the server the verified role.', inline: true }, { name: '!svConfigChannels', value: 'Sets up the proper channel overrides for any channel that allows view access to everyone', inline: true },)
            .setTimestamp()
            .setFooter('aiden@tgmstudios.net || SaintsVerify', 'https://downloads.tgmstudios.net/icons/discord-bots/Saints-Verify.png');

        message.channel.send(HelpMenu);
    } else if (message.content == `${discord_prefix}help BotAdmin`) {
        const HelpMenu = new Discord.MessageEmbed()
            .setColor('#7100FF')
            .setTitle('SaintsVerify')
            .setURL('https://www.tgmstudios.net/')
            .setAuthor('SaintsVerify - Bot by TGMstudios', 'https://downloads.tgmstudios.net/icons/discord-bots/Saints-Verify.png', 'https://www.tgmstudios.net')
            .setDescription('Custom verification bot created by TGMstudios. If you have any problems email the developer at aiden@tgmstudios.net')
            .setThumbnail('https://downloads.tgmstudios.net/icons/discord-bots/Saints-Verify.png')
            .addFields({ name: 'Bot Admin Commands', value: 'Commands that can be run by exclusive bot admins:' }, { name: '\u200B', value: '\u200B' }, { name: '!svAdminAddAccount (Username) (UserID) (Email)', value: 'Manually assigns an email to a user', inline: true }, { name: '!svAdminRemoveAccount (UserID)', value: "Removes a user's information from our database", inline: true }, { name: '!svAdminRemoveAttempts (UserID)', value: "Resets a user's attempts", inline: true }, { name: '!svAdminNetBan (UserID) (Reason)', value: 'Removes the "verified" role from a user on all guilds', inline: true }, { name: '!svAdminNetVerify (UserID)', value: 'Gives the "verified" role to a user on all guilds', inline: true }, { name: '!svAdminRemoteSetup (GuildID)', value: 'Remotely runs the !setup command on a server', inline: true }, { name: '!svAdminRemoteInvite (GuildID)', value: 'Remotely creates an invite link, to allow bot admins to join', inline: true }, { name: '!svAdminRemoteAdmin (GuildID)', value: 'Temporarily gives bot admins administer permissions on a guild', inline: true }, { name: '!svAdminBotGuilds', value: "Lists all guilds and their ID's that the bot is connected to", inline: true }, { name: '\u200B', value: '\u200B' }, { name: '!invite', value: 'Apply to be a bot admin!' }, { name: '!music', value: 'TGMusic bot!' }, )
            .setTimestamp()
            .setFooter('aiden@tgmstudios.net || SaintsVerify', 'https://downloads.tgmstudios.net/icons/discord-bots/Saints-Verify.png');

        message.channel.send(HelpMenu);
    } else if (message.content.startsWith(`${discord_prefix}invite`)) {
        message.member.user.send('>>> **Thank you** for expressing intrest in the **SaintsVerify** project.  Here is the **invite link** to join the **TGMstudios Bot Hub** server for **SaintsVerify** "https://discord.gg/ayASYhxUhF"');
        message.reply(">>> The invite link has been DM'd to you!")
            .then(msg => {
                msg.delete({ timeout: 5000 })
            })
        message.delete({ timeout: 100 });
    } else if (message.content.startsWith(`${discord_prefix}music`)) {
        message.member.user.send('>>> Do **you** want to **spice up** your server?  Then use **TGMusic** - Made by the creator of **Saints Verify**!  This **music bot** has more **free** features than all the alternatives!  The invite link for **TGMusic** is "https://discord.com/api/oauth2/authorize?client_id=704252924251078706&permissions=8&scope=bot%20applications.commands"');
        message.reply("The invite link has been DM'd to you!")
            .then(msg => {
                msg.delete({ timeout: 5000 })
            })
        message.delete({ timeout: 100 });
    } else if (message.content.startsWith(`${discord_prefix}sv`) && !message.content.startsWith(`${discord_prefix}svAdmin`)) {
        if (message.member.hasPermission("ADMINISTRATOR")) {
            client.channels.cache.get(logs_channel).send(`**${message.member.user.username}**  is running a command! Details: Used ID = **${message.member.user.id}** Guild = **${message.member.guild.name}** @ **${message.member.guild.id}** Message = **${message.content}**`);
            if (message.content.startsWith(`${discord_prefix}svSetup`)) {
                setup(message.member.guild.id, message.channel.id);
            } else if (message.content.startsWith(`${discord_prefix}svVerify`)) {
                var member = message.mentions.members.first();
                if (member == undefined) {
                    message.reply(">>> Use !help for info.  Error: **Member not defined**");
                    return;
                }
                verifyLocalUser(member.guild.id, member.id);
                message.channel.send(`>>> **${message.mentions.members.first()}** is now verified!`);
            } else if (message.content.startsWith(`${discord_prefix}svBan`)) {
                var member = message.mentions.members.first();
                if (member == undefined) {
                    message.reply(">>> Use !help for info.  Error: **Member not defined**");
                    return;
                }
                const msg = message.content.split(` `);
                if (msg[2] == undefined) {
                    message.reply(">>> Use !help for info.  Error: **Reason not defined**");
                    return;
                }
                banLocalUser(member.guild.id, member.id, msg[2]);
                message.channel.send(`>>> **${message.mentions.members.first()}** is now banned!`);
            } else if (message.content.startsWith(`${discord_prefix}svSearchAccount`)) {
                const msg = message.content.split(` `);
                if (msg[1] == undefined) {
                    message.reply(">>> Use !help for info.  Error: **UserID not defined**");
                    return;
                }
                let searchDBResult = await searchDB("verified-users", { userID: msg[1] });
                if (searchDBResult[0] != undefined) {
                    message.channel.send(`>>> **${searchDBResult[0].username}** is registered with **${searchDBResult[0].email}**`);
                } else {
                    message.channel.send(`>>> That user id is not registered!`);
                }
            } else if (message.content.startsWith(`${discord_prefix}svSearchAttempts`)) {
                const msg = message.content.split(` `);
                if (msg[1] == undefined) {
                    message.reply(">>> Use !help for info.  Error: **UserID not defined**");
                    return;
                }
                let searchDBResult = await searchDB("login-attempts", { userID: msg[1] });
                if (searchDBResult[0] != undefined) {
                    message.channel.send(`>>> **${searchDBResult[0].username}** has **${searchDBResult[0].loginattempts}** attempts!`);
                } else {
                    message.channel.send(`>>> That user id has no attempts!`);
                }
            } else if (message.content.startsWith(`${discord_prefix}svCheckGuild`)) {
                const msg = message.content.split(` `);
                if (msg[1] == undefined) {
                    message.reply(">>> Use !help for info.  Error: **GuildID not defined**");
                    return;
                }
                checkGuild(msg[1], message.channel.id);
            } else if (message.content.startsWith(`${discord_prefix}svCheckEmail`)) {
                const msg = message.content.split(` `);
                if (msg[1] == undefined) {
                    message.reply(">>> Use !help for info.  Error: **Email not defined**");
                    return;
                }
                var searchEmailResult = await searchEmailFile(msg[1]);
                if (searchEmailResult) {
                    message.channel.send(`>>> Check Complete! **${msg[1]}** is **VALID**.`);
                } else {
                    message.channel.send(`>>> Check Complete! **${msg[1]}** is **INVALID**.`);
                }
            } else if (message.content.startsWith(`${discord_prefix}svGuildInfo`)) {
                const msg = message.content.split(` `);
                if (msg[1] == undefined) {
                    message.reply(">>> Use !help for info.  Error: **Guild not defined**");
                    return;
                }
                guildInfo(msg[1], message.channel.id);
            } else if (message.content.startsWith(`${discord_prefix}svFullVerify`)) {
                const msg = message.content.split(` `);
                var type = "net-verified";
                if (msg[1] == "all") type = "all"
                verifyAll(message.member.guild.id, type)
                message.reply(">>> Verifying the members of the guild!");
            } else if (message.content.startsWith(`${discord_prefix}svConfigChannels`)) {
                configChannels(message.member.guild.id)
                message.reply(">>> Setting up channels!");
            }
        } else {
            client.channels.cache.get(logs_channel).send(`**${message.member.user.username}**  was denied access to a command! Details: Used ID = **${message.member.user.id}** Guild = **${message.member.guild.name}** @ **${message.member.guild.id}** Message = **${message.content}**`);
            message.reply(`You are not authorized to use this command! If you believe this is a mistake, contact <@${ux_contact_id}>.  **This issue has been reported!**`);
        }
    }
    if (message.content.startsWith(`${discord_prefix}svAdmin`)) {
        var emailStream = fs.createReadStream("./admins.txt");
        emailStream.on('data', async function(d) {
            var adminListMatch = !!('' + d).match(";" + message.author.id);
            if (adminListMatch) {
                client.channels.cache.get(logs_channel).send(`**${message.member.user.username}**  is running an ADMIN command! Details: Used ID = **${message.member.user.id}** Guild = **${message.member.guild.name}** @ **${message.member.guild.id}** Message = **${message.content}**`);
                if (message.content.startsWith(`${discord_prefix}svAdminAddAccount`)) {
                    const msg = message.content.split(` `);
                    if (msg[1] == undefined) {
                        message.reply(">>> Use !help for info.  Error: **Username not defined**");
                        return;
                    }
                    if (msg[2] == undefined) {
                        message.reply(">>> Use !help for info.  Error: **UserID not defined**");
                        return;
                    }
                    if (msg[3] == undefined) {
                        message.reply(">>> Use !help for info.  Error: **Email not defined**");
                        return;
                    }
                    addDB("verified-users", { userID: msg[2], username: msg[1], email: msg[3] });
                    message.channel.send(`>>> Account with Username: **${msg[1]}** UserID: **${msg[2]}** has been added with the Email: **${msg[3]}**!`);
                } else if (message.content.startsWith(`${discord_prefix}svAdminRemoveAccount`)) {
                    const msg = message.content.split(` `);
                    if (msg[1] == undefined) {
                        message.reply(">>> Use !help for info.  Error: **UserID not defined**");
                        return;
                    }
                    deleteDB("verified-users", { userID: msg[1] });
                    message.channel.send(`>>> **${msg[1]}** account has been deleted!`);
                } else if (message.content.startsWith(`${discord_prefix}svAdminRemoveAttempts`)) {
                    const msg = message.content.split(` `);
                    if (msg[1] == undefined) {
                        message.reply(">>> Use !help for info.  Error: **UserID not defined**");
                        return;
                    }
                    deleteDB("login-attempts", { userID: msg[1] });
                    message.channel.send(`>>> **${msg[1]}** attempts have been reset!`);
                } else if (message.content.startsWith(`${discord_prefix}svAdminNetVerify`)) {
                    let botGuilds = client.guilds.cache;
                    const msg = message.content.split(` `);
                    if (msg[1] == undefined) {
                        message.reply(">>> Use !help for info.  Error: **UserID not defined**");
                        return;
                    }
                    for (let guildID of botGuilds) {
                        verifyLocalUser(guildID[1].id, msg[1]);
                    }
                    message.channel.send(`>>> **${msg[1]}** is now net verified!`);
                } else if (message.content.startsWith(`${discord_prefix}svAdminNetBan`)) {
                    const msg = message.content.split(` `);
                    if (msg[1] == undefined) {
                        message.reply(">>> Use !help for info.  Error: **UserID not defined**");
                        return;
                    }
                    deleteDB("verified-users", { userID: msg[1] });
                    deleteDB("login-attempts", { userID: msg[1] });
                    let botGuilds = client.guilds.cache;
                    for (let guildID of botGuilds) {
                        banLocalUser(guildID[1].id, msg[1], msg[2]);
                    }
                    message.channel.send(`>>> **${msg[1]}** is now net banned!`);
                } else if (message.content.startsWith(`${discord_prefix}svAdminRemoteSetup`)) {
                    const msg = message.content.split(` `);
                    if (msg[1] == undefined) {
                        message.reply(">>> Use !help for info.  Error: **GuildID not defined**");
                        return;
                    }
                    setup(msg[1], message.channel.id);
                } else if (message.content.startsWith(`${discord_prefix}svAdminRemoteInvite`)) {
                    const msg = message.content.split(` `);
                    if (msg[1] == undefined) {
                        message.reply(">>> Use !help for info.  Error: **GuildID not defined**");
                        return;
                    }
                    let invite = await client.guilds.cache.get(msg[1]).channels.cache.find(channel => channel.name === "verification").createInvite({
                        maxAge: 0,
                        maxUses: 0
                    }).catch(console.error);
                    message.channel.send(`>>> Invite link generated: **${invite}**.`);
                } else if (message.content.startsWith(`${discord_prefix}svAdminRemoteAdmin`)) {
                    const msg = message.content.split(` `);
                    if (msg[1] == undefined) {
                        message.reply(">>> Use !help for info.  Error: **GuildID not defined**");
                        return;
                    }
                    var guild = await client.guilds.cache.get(msg[1]);
                    var guildMember = await guild.members.cache.get(message.author.id);
                    if (guildMember == undefined) {
                        message.reply(">>> Use !help for info.  Error: **guildMember not defined**");
                        return;
                    }
                    let roleSVadmin = guild.roles.cache.find(role => role.name === "SVadmin");
                    if (roleSVadmin == undefined) {
                        roleSVadmin = await guild.roles.create({ data: { name: 'SVadmin', permissions: ['ADMINISTRATOR', 'CREATE_INSTANT_INVITE', 'KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_CHANNELS', 'MANAGE_GUILD', 'ADD_REACTIONS', 'VIEW_AUDIT_LOG', 'PRIORITY_SPEAKER', 'STREAM', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'VIEW_GUILD_INSIGHTS', 'CONNECT', 'SPEAK', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'USE_VAD', 'CHANGE_NICKNAME', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'MANAGE_EMOJIS'] } });
                        guildMember.roles.add(roleSVadmin);
                    } else {
                        guildMember.roles.add(roleSVadmin);
                    }
                    message.channel.send(`>>> Admin sent!`);
                } else if (message.content.startsWith(`${discord_prefix}svAdminBotGuilds`)) {
                    let botGuilds = client.guilds.cache;
                    for (let guildID of botGuilds) {
                        message.channel.send(`>>> **${guildID[1].name}** @ **${guildID[1].id}**`);
                    }
                } else if (message.content.startsWith(`${discord_prefix}svAdminNetAnnounce`)) {
                    const msg = message.content.split(` `);
                    var messageAnnounce = "";
                    for (var i = 2; i < msg.length; i++) {
                        messageAnnounce = messageAnnounce + msg[i] + " ";
                    }
                    netAnnounce(message.author.id, message.member.user.username, msg[1], message.channel.id, messageAnnounce);
                }
            } else {
                client.channels.cache.get(logs_channel).send(`**${message.member.user.username}**  was denied access to an ADMIN command! Details: Used ID = **${message.member.user.id}** Guild = **${message.member.guild.name}** @ **${message.member.guild.id}** Message = **${message.content}**`);
                message.reply(`You are not authorized to use this command! If you believe this is a mistake, contact <@${ux_contact_id}>.  **This issue has been reported!**`);
            }
            emailStream.close();
        });
    }
});

async function onFirstJoin(member) {
    checkGuild(member.guild.id);
    let channelVerification = member.guild.channels.cache.find(channel => channel.name === "verification");
    let roleUnverified = member.guild.roles.cache.find(role => role.name === "Unverified");
    if (channelVerification == undefined) {
        member.user.send(`>>> We apologize for the inconvenience.  For an unknown reason, we were unable to process your account.  Please DM **<@${ux_contact_id}>** for **support**!  Error Code: **Guild Missing critical channel!**`);
        return;
    }
    if (roleUnverified == undefined) {
        member.user.send(`>>> We apologize for the inconvenience.  For an unknown reason, we were unable to process your account.  Please DM **<@${ux_contact_id}>** for **support**!  Error Code: **Guild Missing critical role!**`);
        return;
    }
    member.roles.add(roleUnverified);
    let searchDBResult = await searchDB("verified-users", { userID: member.user.id });
    if (searchDBResult[0] != undefined) {
        client.channels.cache.get(logs_channel).send(`**${member.user.username}** automatically joined **${member.guild.name}**! Details: Used ID = **${member.user.id}** Guild = **${member.guild.name}** @ **${member.guild.id}**`);
        verifyMessages(member.id, member.guild.id, true);
    } else {
        client.channels.cache.get(logs_channel).send(`**${member.user.username}** is pending verification! Details: Used ID = **${member.user.id}** Guild = **${member.guild.name}** @ **${member.guild.id}**`);
        channelVerification.send(`>>> Hello **${member.user.username}**, welcome to: **${member.guild.name}**!`);
        channelVerification.send(`>>> To access the other channels, please send "!email (your SAHS email)"`);
    }
}

async function verificationSyntaxCheck(message) {
    const msg = message.content.split(`${discord_prefix}email `);
    if (msg[1] == undefined) {
        message.reply(`To access the other channels, please send "!email (your SAHS email)"`)
            .then(msg => {
                msg.delete({ timeout: 5000 })
            })
        message.delete({ timeout: 100 });
        return;
    }
    message.reply('Checking Email...')
        .then(msg => {
            msg.delete({ timeout: 5000 })
        })
    var verificationEmail = msg[1].toLowerCase();
    if (verificationEmail.includes(`@${email_domain}`)) {
        if (verificationEmail.includes(".@") || verificationEmail == `@${email_domain}` || new RegExp(/[~`!#$%\^&*+=[\]\\';,/{}|\\":<>\?]/).test(verificationEmail)) {
            message.reply('Invalid characters detected! To protect the safety of the server, you are being instant-banned.  Admins have been notified!')
                .then(msg => {
                    msg.delete({ timeout: 5000 })
                })
            banLocalUser(message.member.guild.id, message.author.id, `Invalid characters detected! Message: ${message.content}`);
            message.delete({ timeout: 100 });
        } else {
            verificationEmailCheck(verificationEmail, message.member.id, message.member.guild.id, message.member.user.username, message.member.guild.name);
            message.delete({ timeout: 100 });
        }
    } else {
        message.reply('Invalid email format!')
            .then(msg => {
                msg.delete({ timeout: 5000 })
            })
        attemptCount = await addAttempt(message.author.id, message.member.user.username, message.member.guild.id);
        client.channels.cache.get(logs_channel).send(`**${message.member.user.username}** has **${attemptCount}** / 3 failed attempts!  Details: Used ID = **${message.member.user.id}** Guild = **${message.member.guild.name}** @ **${message.member.guild.id}** Message = **${message.content}**`);
        message.channel.send(`>>> **${message.member.user.username}**, you have **${attemptCount}** / 3 failed attempts`)
            .then(msg => {
                msg.delete({ timeout: 5000 })
            })
        message.delete({ timeout: 100 });
    }
}
async function verificationEmailCheck(verificationEmail, userID, guildID, userName, guildName) {
    let channelVerification = client.guilds.cache.get(guildID).channels.cache.find(channel => channel.name === "verification");
    var searchEmailResult = await searchEmailFile(verificationEmail);
    if (searchEmailResult) {
        let searchDBResult = await searchDB("verified-users", { email: verificationEmail });
        if (searchDBResult[0] != undefined) {
            if (searchDBResult[0].userID == userID) {
                client.channels.cache.get(logs_channel).send(`**${userName}** automatically joined **${guildName}**! Details: Used ID = **${userID}** Guild = **${guildName}** @ **${guildID}**`);
                verifyMessages(userID, guildID, false);
                return;
            }
            client.channels.cache.get(logs_channel).send(`**${userName}** tried to join with: **${verificationEmail}**, owned by **${searchDBResult[0].username}**!    Details: Used ID = **${userID}** Guild = **${guildName}** @ **${guildID}** Email Owner ID = **${searchDBResult[0].userID}**`);
            channelVerification.send(`>>> **${userName}** This email is being used with another account, the mods have been notified!`)
                .then(msg => {
                    msg.delete({ timeout: 3000 })
                })
            attemptCount = await addAttempt(userID, userName, guildID);
            client.channels.cache.get(logs_channel).send(`**${userName}** has **${attemptCount}** / 3 failed attempts!  Details: Used ID = **${userID}** Guild = **${guildName}** @ **${guildID}**`);
            channelVerification.send(`**${userName}**, you have **${attemptCount}** / 3 failed attempts`)
                .then(msg => {
                    msg.delete({ timeout: 5000 })
                })
            return;
        }
        client.channels.cache.get(logs_channel).send(`**${userName}** joined with: **${verificationEmail}**!  Details: Used ID = **${userID}** Guild = **${guildName}** @ **${guildID}**`);
        addDB("verified-users", { userID: userID, username: userName, email: verificationEmail });
        verifyMessages(userID, guildID, false);
    } else {
        client.channels.cache.get(logs_channel).send(`**${userName}** tried to join with: **${verificationEmail}**!  Details: Used ID = **${userID}** Guild = **${guildName}** @ **${guildID}**`);
        channelVerification.send(`>>> **${userName}**, Email not found!`)
            .then(msg => {
                msg.delete({ timeout: 3000 })
            })
        attemptCount = await addAttempt(userID, userName, guildID);
        client.channels.cache.get(logs_channel).send(`**${userName}** has **${attemptCount}** / 3 failed attempts!  Details: Used ID = **${userID}** Guild = **${guildName}** @ **${guildID}**`);
        channelVerification.send(`>>> **${userName}**, you have **${attemptCount}** / **3** failed attempts`)
            .then(msg => {
                msg.delete({ timeout: 5000 })
            })
    }
}

const searchEmailFile = async(verificationEmail) => {
    return new Promise((resolve, reject) => {
        var query = ";" + verificationEmail;
        var emailStream = fs.createReadStream("./emails.txt");
        emailStream.on('data', function(d) {
            var verificationEmailFound = !!('' + d).match(query);
            resolve(Boolean(verificationEmailFound));
            emailStream.close();
        });
    })
}
const searchDB = async(collection, query) => {
    return new Promise((resolve, reject) => {
        mongoDB.collection(collection).find(query).toArray(function(err, result) {
            if (err) throw err;
            resolve(result);
        })
    })
}
async function deleteDB(collection, query) {
    mongoDB.collection(collection).deleteOne(query, function(err, obj) {
        if (err) throw err;
    });
}
async function addDB(collection, query) {
    mongoDB.collection(collection).insertOne(query, function(err, res) {
        if (err) throw err;
    });
}
async function modifyDB(collection, query, modify) {
    mongoDB.collection(collection).updateOne(query, modify, function(err, res) {
        if (err) throw err;
    });
}

async function banLocalUser(guildID, memberID, banReason) {
    deleteDB("login-attempts", { userID: memberID });
    var guild = client.guilds.cache.get(guildID);
    var roleFailedVerify = guild.roles.cache.find(role => role.name === "FailedVerify");
    var roleUnverified = guild.roles.cache.find(role => role.name === "Unverified");
    var roleVerified = guild.roles.cache.find(role => role.name === "verified");
    var guildMember = guild.members.cache.get(memberID);
    if (guildMember == undefined) {
        return;
    }
    if (roleFailedVerify == undefined) {
        checkGuild(guild.id);
        member.user.send(`>>> We apologize for the inconvenience.  For an unknown reason, we were unable to process your account.  Please DM **<@${ux_contact_id}>** for **support**!  Error Code: **Guild Missing critical role!**`);
        return;
    }
    if (roleUnverified == undefined) {
        checkGuild(guild.id);
        member.user.send(`>> We apologize for the inconvenience.  For an unknown reason, we were unable to process your account.  Please DM **<@${ux_contact_id}>** for **support**!  Error Code: **Guild Missing critical role!**`);
        return;
    }
    if (roleVerified == undefined) {
        checkGuild(guild.id);
        member.user.send(`>>> We apologize for the inconvenience.  For an unknown reason, we were unable to process your account.  Please DM **<@${ux_contact_id}>** for **support**!  Error Code: **Guild Missing critical role!**`);
        return;
    }
    guildMember.roles.add(roleFailedVerify);
    guildMember.roles.remove(roleUnverified);
    guildMember.roles.remove(roleVerified);
    let channelFailedVerify = guild.channels.cache.find(channel => channel.name === "failed-verification");
    if (channelFailedVerify == undefined) {
        checkGuild(guild.id);
        guildMember.user.send(`>>> We apologize for the inconvenience.  For an unknown reason, we were unable to process your account.  Please DM **<@${ux_contact_id}>** for **support**!  Error Code: **Guild Missing critical role!**`);
        return;
    }
    channelFailedVerify.send(`>>> **<@${memberID}>**, you have been banned from **${guild.name}**!  Reason: **${banReason}**`)
    client.channels.cache.get(logs_channel).send(`**${guildMember.user.username}** has been banned!  Details: Used ID = **${memberID}** Guild = **${guild.name}** @ **${guildID}** Reason = **${banReason}**`);
}
async function verifyLocalUser(guildID, memberID) {
    var guild = client.guilds.cache.get(guildID);
    var roleUnverified = guild.roles.cache.find(role => role.name === "Unverified");
    var roleVerified = guild.roles.cache.find(role => role.name === "verified");
    var roleFailedVerify = guild.roles.cache.find(role => role.name === "FailedVerify");
    var guildMember = guild.members.cache.get(memberID);
    if (guildMember == undefined) {
        return;
    }
    if (roleUnverified == undefined) {
        checkGuild(guild.id);
        member.user.send(`>>> We apologize for the inconvenience.  For an unknown reason, we were unable to process your account.  Please DM **<@${ux_contact_id}>** for **support**!  Error Code: **Guild Missing critical role!**`);
        return;
    }
    if (roleVerified == undefined) {
        checkGuild(guild.id);
        member.user.send(`>>> We apologize for the inconvenience.  For an unknown reason, we were unable to process your account.  Please DM **<@${ux_contact_id}>** for **support**!  Error Code: **Guild Missing critical role!**`);
        return;
    }
    if (roleFailedVerify == undefined) {
        checkGuild(guild.id);
        member.user.send(`>>> We apologize for the inconvenience.  For an unknown reason, we were unable to process your account.  Please DM **<@${ux_contact_id}>** for **support**!  Error Code: **Guild Missing critical role!**`);
        return;
    }
    guildMember.roles.add(roleVerified);
    guildMember.roles.remove(roleUnverified);
    guildMember.roles.remove(roleFailedVerify);
}
async function verifyMessages(memberID, guildID, autoJoin) {
    var guild = client.guilds.cache.get(guildID);
    var guildMember = guild.members.cache.get(memberID);

    let channelVerification = guild.channels.cache.find(channel => channel.name === "verification");
    if (channelVerification == undefined) {
        checkGuild(guild.id);
        member.user.send(`>>> We apologize for the inconvenience.  For an unknown reason, we were unable to process your account.  Please DM **<@${ux_contact_id}>** for **support**!  Error Code: **Guild Missing critical channel!**`);
        return;
    }
    if (autoJoin) {
        if (guild.id == "700546297073238086") {
            channelVerification.send(`>>> ** ${guildMember.user.username} ** You've been automatically verified! You are now a verified member of the Saints Politics Club!  Please select your political views in ${guild.channels.cache.find(channel => channel.name === "┃political-titles-list").toString()}!`)
                .then(msg => {
                    msg.delete({ timeout: 5000 })
                })
        } else {
            channelVerification.send(`>>> ** ${guildMember.user.username} ** You've been automatically verified! You are now a verified member of the **${guild.name}** Club!  Please check out the other channels!`)
                .then(msg => {
                    msg.delete({ timeout: 5000 })
                })
        }
    } else {
        if (guild.id == "700546297073238086") {
            channelVerification.send(`>>> Congratulations ** ${guildMember.user.username} **, you are now a verified member of the Saints Politics Club!  Please select your political views in ${guild.channels.cache.find(channel => channel.name === "┃political-titles-list").toString()}!`)
                .then(msg => {
                    msg.delete({ timeout: 5000 })
                })
        } else {
            channelVerification.send(`>>> Congratulations ** ${guildMember.user.username} **, you are now a verified member of the **${guild.name}**!  Please check out the other channels!`)
                .then(msg => {
                    msg.delete({ timeout: 5000 })
                })
        }
    }
    deleteDB("login-attempts", { userID: memberID });
    verifyLocalUser(guildID, memberID);
    let generalChannelType1 = guild.channels.cache.find(channel => channel.name === "general");
    let generalChannelType2 = guild.channels.cache.find(channel => channel.name === "┃general");
    if (generalChannelType1 != undefined) {
        generalChannelType1.send(`>>> Everyone say hello to **${guildMember.user.username}**, welcome to: **${guild.name}**!`);
    }
    if (generalChannelType2 != undefined) {
        generalChannelType2.send(`>>> Everyone say hello to **${guildMember.user.username}**, welcome to: **${guild.name}**!`);
    }
}
const addAttempt = async(userID, userName, guildID) => {
    return new Promise(async(resolve, reject) => {
        let searchDBResult = await searchDB("login-attempts", { userID: userID });
        if (searchDBResult[0] != undefined) {
            var currentAttempts = parseInt(searchDBResult[0].loginattempts) + 1;
            resolve(currentAttempts);
            if (currentAttempts < 3) {
                modifyDB("login-attempts", { userID: userID }, { $set: { userID: userID, username: userName, loginattempts: currentAttempts } });
            } else if (currentAttempts >= 3) {
                banLocalUser(guildID, userID, "Too many failed attempts");
            }

        } else {
            addDB("login-attempts", { userID: userID, username: userName, loginattempts: "1" });
            resolve(1);
        }
    })
}
async function netAnnounce(fromUserID, fromUserName, toType, outputChannelID, message) {
    let botGuilds = client.guilds.cache;
    client.channels.cache.get(logs_channel).send(`**${fromUserName}** is sending a global annoucement! Details: UserID = ${fromUserID} UserName = ${fromUserName} Type = ${toType} Message = ${message}`);
    if (toType == "ServerOwners") {
        for (let guildID of botGuilds) {
            const netAnnounceMessage = `**Global Announcement** from **${fromUserName}** to **All Server Owners** (Owner of **${guildID[1].name}**): ${message}.`;
            guildID[1].owner.send(netAnnounceMessage);
            client.channels.cache.get(outputChannelID).send(`Message sent to **${guildID[1].owner.user.username}** Details: Message = **${netAnnounceMessage}**`)
        }
    } else if (toType == "Servers") {
        const netAnnounceMessage = `**Global Announcement** from **${fromUserName}** to **All Servers**: ${message}.`;
        for (let guildID of botGuilds) {
            guildID[1].channels.cache.find(channel => channel.name === "verification").send(netAnnounceMessage);
            client.channels.cache.get(outputChannelID).send(`Message sent to **${guildID[1].name}** Details: Message = **${netAnnounceMessage}**`);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkGuild(guildID, outputChannelID) {
    if (outputChannelID != undefined) {
        var outputChannel = client.channels.cache.get(outputChannelID);
    } else {
        var outputChannel = client.channels.cache.get(logs_channel);
    }
    var guild = await client.guilds.cache.get(guildID);
    if (guild == undefined) {
        outputChannel.send(`Critical Error: checkGuild failed with: Guild: **${guildID}** not found!`);;
        return;
    }
    let channelVerification = await guild.channels.cache.find(channel => channel.name === "verification");
    let channelFailedVerification = await guild.channels.cache.find(channel => channel.name === "failed-verification");
    let channelManualVerification = await guild.channels.cache.find(channel => channel.name === "manual");
    let roleVerified = await guild.roles.cache.find(role => role.name === "verified");
    let roleUnverified = await guild.roles.cache.find(role => role.name === "Unverified");
    let roleFailedVerify = await guild.roles.cache.find(role => role.name === "FailedVerify");

    if (!channelFailedVerification) {
        outputChannel.send(`Critical Error: Missing channel "**channelFailedVerification**" on Guild: **${guild.name}** @ **${guild.id}**`);
    }
    if (!channelManualVerification) {
        outputChannel.send(`Warning Error: Missing channel "**channelManualVerification**" on Guild: **${guild.name}** @ **${guild.id}**`);
    }
    if (!channelVerification) {
        outputChannel.send(`Critical Error: Missing channel "**channelVerification**" on Guild: **${guild.name}** @ **${guild.id}**`);
    }
    if (!roleVerified) {
        outputChannel.send(`Critical Error: Missing role "**roleVerified**" on Guild: **${guild.name}** @ **${guild.id}**`);
    }
    if (!roleUnverified) {
        outputChannel.send(`Critical Error: Missing role "**roleUnverified**" on Guild: **${guild.name}** @ **${guild.id}**`);
    }
    if (!roleFailedVerify) {
        outputChannel.send(`Critical Error: Missing role "**roleFailedVerify**" on Guild: **${guild.name}** @ **${guild.id}**`);
    }
    outputChannel.send(`Completed Check on Guild: **${guild.name}** @ **${guild.id}**`);
}
async function setup(guildID, setupReturnChannel) {
    returnChannel = client.channels.cache.get(setupReturnChannel);
    client.channels.cache.get(setupReturnChannel).send('Info: **Setting Up.**');
    var guild = await client.guilds.cache.get(guildID);
    if (guild == undefined) {
        returnChannel.send(`Critical Error: setup failed with: Guild: **${guildID}** not found!`);;
        return;
    }
    let channelVerification = await guild.channels.cache.find(channel => channel.name === "verification");
    let channelFailedVerification = await guild.channels.cache.find(channel => channel.name === "failed-verification");
    let channelManualVerification = await guild.channels.cache.find(channel => channel.name === "manual");
    let roleVerified = await guild.roles.cache.find(role => role.name === "verified");
    let roleUnverified = await guild.roles.cache.find(role => role.name === "Unverified");
    let roleFailedVerify = await guild.roles.cache.find(role => role.name === "FailedVerify");
    if (roleVerified != undefined) {
        returnChannel.send('Role: **Verified** found.');
    } else {
        guild.roles.create({
                data: {
                    name: 'verified',
                    color: 'BLUE',
                },
                reason: 'Verified Role',
            })
            .catch(console.error);
        returnChannel.send('Role: **Verified** created.');
    }
    if (roleUnverified != undefined) {
        returnChannel.send('Role: **Unverified** found.');
    } else {
        guild.roles.create({
                data: {
                    name: 'Unverified',
                    color: 'RED',
                },
                reason: 'Unverified Role',
            })
            .catch(console.error);
        returnChannel.send('Role: **Unverified** created.');
    }
    if (roleFailedVerify != undefined) {
        returnChannel.send('Role: **FailedVerify** found.');
    } else {
        guild.roles.create({
                data: {
                    name: 'FailedVerify',
                    color: 'BROWN',
                },
                reason: 'Verified Role',
            })
            .catch(console.error);
        returnChannel.send('Role: **FailedVerify** created.');
    }
    returnChannel.send('Info: **Roles Created**');
    returnChannel.send('Info: **Begining Part 2 of Setup**');
    await sleep(2000);
    setupPart2(guild, setupReturnChannel, roleUnverified, roleFailedVerify, roleVerified, channelVerification, channelFailedVerification, channelManualVerification);
}
async function setupPart2(guild, setupReturnChannel, roleUnverified, roleFailedVerify, roleVerified, channelVerification, channelFailedVerification, channelManualVerification) {
    returnChannel = client.channels.cache.get(setupReturnChannel);
    returnChannel.send('Info: **Creating Channels**');
    roleUnverified = await guild.roles.cache.find(role => role.name === "Unverified");
    roleFailedVerify = await guild.roles.cache.find(role => role.name === "FailedVerify");
    roleVerified = await guild.roles.cache.find(role => role.name === "verified");
    if (channelVerification != undefined) {
        returnChannel.send('Channel: **Verification** found.');
    } else {
        channelVerification = await guild.channels.create('verification');
        channelVerification.createOverwrite(guild.roles.everyone, {
            SEND_MESSAGES: false,
            VIEW_CHANNEL: false,
            READ_MESSAGE_HISTORY: false
        })
        channelVerification.createOverwrite(roleUnverified, {
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            READ_MESSAGE_HISTORY: true
        })
        returnChannel.send('Channel: **Verification** created.');
    }
    if (channelFailedVerification != undefined) {
        returnChannel.send('Channel: **FailedVerification** found.');
    } else {
        channelFailedVerification = await guild.channels.create('failed-verification');
        channelFailedVerification.createOverwrite(guild.roles.everyone, {
            SEND_MESSAGES: false,
            VIEW_CHANNEL: false,
            READ_MESSAGE_HISTORY: false
        })
        channelFailedVerification.createOverwrite(roleFailedVerify, {
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            READ_MESSAGE_HISTORY: true
        })
        returnChannel.send('Channel: **FailedVerification** created.');
    }
    if (channelManualVerification != undefined) {
        returnChannel.send('Channel: **ManualVerification** found.');
    } else {
        channelManualVerification = await guild.channels.create('manual');
        channelManualVerification.createOverwrite(guild.roles.everyone, {
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            READ_MESSAGE_HISTORY: true
        })
        channelManualVerification.createOverwrite(roleFailedVerify, {
            SEND_MESSAGES: false,
            VIEW_CHANNEL: false,
            READ_MESSAGE_HISTORY: false
        })
        channelManualVerification.createOverwrite(roleVerified, {
            SEND_MESSAGES: false,
            VIEW_CHANNEL: false,
            READ_MESSAGE_HISTORY: false
        })
        channelManualVerification.createOverwrite(roleUnverified, {
            SEND_MESSAGES: false,
            VIEW_CHANNEL: false,
            READ_MESSAGE_HISTORY: false
        })
        returnChannel.send('Channel: **ManualVerification** created.');
    }
    returnChannel.send('Info: **Channels Created**');
    returnChannel.send('Info: **Beginning Part 3 of Setup**');
    sleep(2000).then(() => { setupPart3(guild, setupReturnChannel, roleUnverified, roleFailedVerify, roleVerified, channelVerification, channelFailedVerification, channelManualVerification); });
}
async function setupPart3(guild, setupReturnChannel, roleUnverified, roleFailedVerify, roleVerified, channelVerification, channelFailedVerification, channelManualVerification) {
    channelVerification = await guild.channels.cache.find(channel => channel.name === "verification");
    channelFailedVerification = await guild.channels.cache.find(channel => channel.name === "failed-verification");
    channelManualVerification = await guild.channels.cache.find(channel => channel.name === "manual");
    channelVerification.send('>>> To access the other channels, please send "!email(your SAHS email)"');
    channelFailedVerification.send('>>> Mods have been notified of your ban!  A manual verification will occur and we will check if you can be verified.');
    channelManualVerification.send(`>>> We apologize for the inconvenience.  For an unknown reason, we were unable to process your account.  Please DM **<@${ux_contact_id}>** for **support**!  Error Code: **Bot either down or unknown console error!**`);
    client.channels.cache.get(setupReturnChannel).send('Info: **Setup Complete!**');
    client.channels.cache.get(setupReturnChannel).send(`Thank you for using **${ux_bot_name}**! Any important updates will be sent to the **server owner**.`);
    client.channels.cache.get(setupReturnChannel).send(`If you'd like us to automatically set up the server for you, run *"!svConfigChannels"* to allow verified users to see channels, and/or run *"!svVerifyAll [all]"* to verify everyone currently in the server who has an email linked, or to verify everyone in the server.`);
    client.channels.cache.get(setupReturnChannel).send('For easy **support**, please **join** the **TGMstudios Bot Hub**.  This server contains the **global logs channel** for **SaintsVerify**, a **change log**, and many other **TGMstudios** bots!  To **join**, please use "**!invite**"');
    client.channels.cache.get(setupReturnChannel).send('Do **you** want to **spice up** your server?  Then use **TGMusic** - Made by the creator of **Saints Verify**!  This **music bot** has more **free** features than all the alternatives!  To get the **invite link** for **TGMusic** use "**!music**"');
}
async function guildInfo(guildID, returnChannelID) {
    var guild = await client.guilds.cache.get(guildID);
    var returnChannel = await client.channels.cache.get(returnChannelID);
    let users = [];
    guild.members.cache.each(async member => {
        member.roles.cache.each(async role => {
            if (role.name == "verified") {
                let searchDBResult = await searchDB("verified-users", { userID: member.user.id });
                if (searchDBResult[0] != undefined) {
                    users.push(JSON.parse(`{"user": "${member.user.username}","nickname": "${member.displayName}","id": "${member.user.id}","role": "netVerified","email": "${searchDBResult[0].email}"}`))
                } else {
                    users.push(JSON.parse(`{"user": "${member.user.username}","nickname": "${member.displayName}","id": "${member.user.id}","role": "verified"}`))
                }
            } else if (role.name == "Unverified") {
                users.push(JSON.parse(`{"user": "${member.user.username}","nickname": "${member.displayName}","id": "${member.user.id}","role": "unverified"}`))
            } else if (role.name == "FailedVerify") {
                users.push(JSON.parse(`{"user": "${member.user.username}","nickname": "${member.displayName}","id": "${member.user.id}","role": "banned"}`))
            }
        })
    });
    await sleep(2000);
    let netVerified = 0;
    let verified = 0;
    let unverified = 0;
    let banned = 0;
    for (let i = 0; i < users.length; i++) {
        if (users[i].role == "verified" || users[i].role == "netVerified") verified++
            if (users[i].role == "unverified") unverified++
                if (users[i].role == "banned") banned++
                    if (users[i].email) netVerified++
    }
    returnChannel.send(`Guild: **${guild.name}** | Verified: **${verified} / ${guild.memberCount}** NetVerified: **${netVerified} / ${verified}** | Unverified: **${unverified} / ${guild.memberCount}** | Banned: **${banned} / ${guild.memberCount}**`);
    var returnMessage = "";
    for (let i = 0; i < users.length; i++) {
        if (users[i].email) returnMessage += `Name: ${users[i].user}@${users[i].id}\n   Role: ${users[i].role}\n   Email: ${users[i].email}\n`;
        else returnMessage += `Name: ${users[i].user}@${users[i].id}\n   Role: ${users[i].role}\n`;
    }
    for (var split = 0; split <= returnMessage.length; split + 1992) {
        returnChannel.send("```" + returnMessage.slice(split, parseInt(split + 1992))+ "```");
        split = parseInt(split + 1992);
    }
}
async function verifyAll (guildID, type) {
    var guild = await client.guilds.cache.get(guildID);
    let roleVerified = await guild.roles.cache.find(role => role.name === "verified");
    let roleUnverified = await guild.roles.cache.find(role => role.name === "Unverified");
    if (type == "all") {
        guild.members.cache.each(async member => {
            member.roles.add(roleVerified)
        })
    } else if (type == "net-verified"){
        guild.members.cache.each(async member => {
            let searchDBResult = await searchDB("verified-users", { userID: member.user.id });
            if (searchDBResult[0] != undefined) {
                member.roles.add(roleVerified)
            } else {
                member.roles.remove(roleVerified)
                member.roles.add(roleUnverified)
            }
        });
    }
}
async function configChannels (guildID) {
    var guild = await client.guilds.cache.get(guildID);
    let roleVerified = await guild.roles.cache.find(role => role.name === "verified");
    guild.channels.cache.forEach(channel => { 
        if (channel.permissionsFor(guild.roles.everyone).has('VIEW_CHANNEL') && channel.permissionsFor(guild.roles.everyone).has('SEND_MESSAGES')) {
            channel.createOverwrite(guild.roles.everyone, {
                VIEW_CHANNEL: false,
                SEND_MESSAGES: false,
                READ_MESSAGE_HISTORY: false
            })
            channel.createOverwrite(roleVerified, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                READ_MESSAGE_HISTORY: true
            })
        } else if (channel.permissionsFor(guild.roles.everyone).has('VIEW_CHANNEL')) {
            channel.createOverwrite(guild.roles.everyone, {
                VIEW_CHANNEL: false,
                READ_MESSAGE_HISTORY: false
            })
            channel.createOverwrite(roleVerified, {
                VIEW_CHANNEL: true,
                READ_MESSAGE_HISTORY: true
            })
        }
    });
}
client.login(discord_token);