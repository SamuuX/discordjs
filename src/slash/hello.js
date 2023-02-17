module.exports = {
  name: 'ping',
  description: 'Say ping Bot',
  run: async (interaction, client) => {
    return interaction.reply({ content: `Pong \`${client.ws.ping}ms\` 🏓`, ephemeral: true })
  }
}
