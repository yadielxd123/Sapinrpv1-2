
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('solicitar-rol')
    .setDescription('Solicita un rol específico')
    .addRoleOption(option =>
      option.setName('rol')
        .setDescription('El rol que deseas solicitar')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón por la cual solicitas este rol')
        .setRequired(false)
    ),

  async execute(interaction) {
    const rol = interaction.options.getRole('rol');
    const razon = interaction.options.getString('razon') || 'No se proporcionó una razón';

    // Verificar que el rol no sea @everyone o roles de bot
    if (rol.id === interaction.guild.id || rol.managed) {
      return interaction.reply({
        content: '❌ No puedes solicitar este rol.',
        ephemeral: true
      });
    }

    // Verificar si el usuario ya tiene el rol
    if (interaction.member.roles.cache.has(rol.id)) {
      return interaction.reply({
        content: '❌ Ya tienes este rol.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 Solicitud de Rol')
      .setDescription(`**Usuario:** <@${interaction.user.id}>\n**Rol solicitado:** ${rol}\n**Razón:** ${razon}`)
      .setColor(0x3498DB)
      .setFooter({ text: `ID: ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    const botones = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`aceptar_rol_${interaction.user.id}_${rol.id}`)
          .setLabel('✅ Aceptar')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`denegar_rol_${interaction.user.id}_${rol.id}`)
          .setLabel('❌ Denegar')
          .setStyle(ButtonStyle.Danger)
      );

    await interaction.reply({
      content: '📋 **Solicitud de rol enviada**\n*Los moderadores revisarán tu solicitud.*',
      embeds: [embed],
      components: [botones]
    });
  },
};
