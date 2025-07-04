const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('112')
    .setDescription('🚨 Envía una llamada de emergencia al canal')
    .addStringOption(option =>
      option.setName('emergencia')
        .setDescription('¿Qué emergencia estás reportando?')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('faccion')
        .setDescription('¿Qué facción debe atender?')
        .setRequired(true)
        .addChoices(
          { name: '👮‍♂️ CNP', value: 'CNP' },
          { name: '🛂 Guardia Civil', value: 'Guardia Civil' },
          { name: '🚑 EMS', value: 'EMS' },
          { name: '🔥 Bomberos', value: 'Bomberos' },
          { name: '🪖 Ejército', value: 'Ejército' }
        )
    )
    .addStringOption(option =>
      option.setName('ubicacion')
        .setDescription('¿Dónde está ocurriendo la emergencia?')
        .setRequired(true)
    ),

  async execute(interaction) {
    const emergencia = interaction.options.getString('emergencia');
    const faccion = interaction.options.getString('faccion');
    const ubicacion = interaction.options.getString('ubicacion');
    const mencionRol = '<@&1364804369156931705>'; // ID del rol que debe recibir ping

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('🚨 ¡Nueva llamada de emergencia!')
      .setDescription(`📞 **Llamada de emergencia | 112**\n\nInformación acerca de esta llamada:`)
      .addFields(
        { name: '📢 Se ha rastreado al que llama:', value: `👤 <@${interaction.user.id}>`, inline: false },
        { name: '⚠️ Emergencia:', value: emergencia, inline: false },
        { name: '🚨 Facción Requerida:', value: faccion, inline: false },
        { name: '📍 Ubicación:', value: ubicacion, inline: false }
      )
      .setFooter({ text: '© SpainRP™ • Emergency Response', iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    await interaction.reply({
      content: `🚨 ¡Nueva llamada de emergencia! ${mencionRol}`,
      embeds: [embed]
    });
  }
};