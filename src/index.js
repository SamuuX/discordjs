const fs = require('node:fs') // Define fs (file system).
const Discord = require('discord.js') // Define Discord.Client, Intents, and Discord.Collection.
const { REST } = require('@discordjs/rest') // Define REST
const { Routes } = require('discord-api-types/v10') // Define Routes
require('dotenv').config()
const config = require(`${process.cwd()}/config.json`)
const client = new Discord.Client({
  intents: 131071,
  partials: [
    Discord.Partials.User,
    Discord.Partials.Channel,
    Discord.Partials.GuildMember,
    Discord.Partials.Message,
    Discord.Partials.Reaction
  ],
  allowedMentions: {
    parse: ['roles', 'users'],
    repliedUser: false
  }
}) // Add Intents to Discord.Client.

const cmds = new Discord.Collection() // Where the bot (message) commands will be stored.
const slashcmds = new Discord.Collection() // Where the bot (slash) commands will be stored.

// Array to store commands for sending to the REST API.
const commandsArray = []
client.once('ready', () => {
  // Get and filter all the files in the "Slash Commands" Folder.
  const slashFiles = fs
    .readdirSync(`${process.cwd()}/src/slash`)
    .filter((file) => file.endsWith('.js'))
  // Loop through the command files
  for (const file of slashFiles) {
    const slash = require(`${process.cwd()}/src/slash/${file}`)
    console.log(slash)
    commandsArray.push({
      name: slash.name,
      description: slash.description,
      options: slash.options
    })
    slashcmds.set(slash.name, slash)
  }

  const rest = new REST({ version: '10' }).setToken(config.Token);

  // Register slash commands.
  (async () => {
    try {
      console.log('Started refreshing application (/) commands.')

      await rest.put(Routes.applicationCommands(client.user.id, '1066925479522730015'), {
        body: commandsArray
      })

      console.log('Successfully reloaded application (/) commands.')
    } catch (error) {
      console.error(error)
    }
  })()
  // Set the bot's status to Watching Trains.
  const { ActivityType } = require('discord.js')

  client.user.setPresence({
    activities: [
      {
        name: `${config.PREFIX}SamuuX On Live`,
        type: ActivityType.Streaming,
        url: 'https://twitch.tv/Samuu_X'
      }
    ],
    status: 'dnd'
  })
  console.log(`Logged in as ${client.user.tag}!`)
})
// Get and filter all event files.
const eventFiles = fs
  .readdirSync('./src/events')
  .filter((file) => file.endsWith('.js'))
// Loop through the event files.
for (const file of eventFiles) {
  const event = require(`${process.cwd()}/src/events/${file}`)
  if (event.once) {
    // Runs the event once.
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    // Sets the event to be listened for.
    client.on(event.name, (...args) => event.execute(...args))
  }
}

// Loop through all message command files and store them in the collector.
fs.readdir(`${process.cwd()}/src/Commands/`, (error, files) => {
  if (error) return console.log('Could not find any commands!')
  const jsFiles = files.filter((f) => f.split('.').pop() === 'js')
  if (jsFiles.length <= 0) return console.log('Could not find any commands!')
  jsFiles.forEach((file) => {
    const cmd = require(`${process.cwd()}/src/Commands/${file}`)
    cmds.set(cmd.name, cmd)
  })
})

// Message Command handler.
client.on('messageCreate', async (message) => {
  if (message.author.bot) return
  const prefix = config.PREFIX
  if (!message.content.startsWith(prefix)) return
  const args = message.content.slice(prefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()
  const cmd = cmds.get(command)
  if (!cmd) return
  try {
    cmd.run(client, message, args)
  } catch (error) {
    console.log(error)
    message.channel.send('There was an error while executing this command!')
  }
})

// Slash Command handler.
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return
  const command = slashcmds.get(interaction.commandName)
  if (!command) return
  try {
    await command.run(interaction, client)
  } catch (error) {
    console.error(error)
    return interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true
    })
  }
})

client.login(config.Token) // Login to the bot client via the defined "token" string.
