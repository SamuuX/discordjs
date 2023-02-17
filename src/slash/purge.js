// eslint-disable-next-line no-unused-vars
const { GuildMemberManager, PermissionsBitField } = require('discord.js')

module.exports = {
  name: 'purge',
  description: 'Purge a certain amount of messages.',
  options: [
    {
      name: 'amount',
      type: 4,
      description: 'Amount of Messages',
      required: true,
      // Makes sure the amount of messages purged is between 1 and 100.
      min_value: 1,
      max_value: 100
    }
  ],
  run: async (interaction) => {
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      return interaction.reply({
        content: '**You are missing the *Manage Messages* permission!**',
        ephemeral: true
      })
    }
    // if (!interaction.guild.GuildMemberManager.me.permissions.has(PermissionsBitField.Flags.ManageMessages))
    //   return interaction.reply({
    //     content: "**I are missing the *Manage Messages* permission!**",
    //     ephemeral: true,
    //   });

    const amount = interaction.options.getInteger('amount')

    // Deletes the specified amount of messages from the current channel.
    const purgemsgs = await interaction.channel.bulkDelete(amount, {
      filterOld: true
    })

    await interaction.reply({
      content: `\`${purgemsgs.size}/${amount}\` have been purged.`,
      ephemeral: true
    })
  }
}
