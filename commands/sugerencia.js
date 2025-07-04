const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sugerencia')
    .setDescription('Envía una sugerencia para que otros voten.')
    .addStringOption(option =>
      option.setName('texto')
        .setDescription('Tu sugerencia')
        .setRequired(true)
    ),

  async execute(interaction) {
    const texto = interaction.options.getString('texto');

    const embed = new EmbedBuilder()
      .setTitle('📬 Nueva sugerencia')
      .setDescription(`> ${texto}`)
      .setColor(0x00AE86)
      .setFooter({ text: `Sugerido por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    // Publicar el embed
    const mensaje = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    });

    try {
      await mensaje.react('✅');
      await mensaje.react('❌');
    } catch (error) {
      console.error('Error al añadir reacciones:', error);
    }
  },
};