const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const DNI = require('../models/DNI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ver-dni')
    .setDescription('Ver información del DNI')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario del cual ver el DNI (opcional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser('usuario') || interaction.user;

    try {
      const dni = await DNI.buscarPorUserId(usuario.id);

      if (!dni) {
        return interaction.reply({
          content: `❌ ${usuario.id === interaction.user.id ? 'No tienes' : 'El usuario no tiene'} un DNI registrado.`,
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('📄 Documento Nacional de Identidad')
        .setColor(0x0099FF)
        .setThumbnail(usuario.displayAvatarURL())
        .addFields(
          { name: '📄 Número de Documento', value: dni.numeroDocumento, inline: true },
          { name: '👤 Nombres', value: dni.nombres, inline: true },
          { name: '👤 Apellidos', value: dni.apellidos, inline: true },
          { name: '📅 Fecha de Nacimiento', value: dni.fechaNacimiento, inline: true },
          { name: '⚧ Sexo', value: dni.sexo === 'M' ? 'Masculino' : 'Femenino', inline: true },
          { name: '💍 Estado Civil', value: dni.estadoCivil, inline: true },
          { name: '🌍 Lugar de Nacimiento', value: dni.lugarNacimiento, inline: true },
          { name: '🩸 Grupo Sanguíneo', value: dni.grupoSanguineo, inline: true },
          { name: '📏 Estatura', value: `${dni.estatura} cm`, inline: true },
          { name: '📅 Fecha de Expedición', value: new Date(dni.fechaExpedicion).toLocaleDateString('es-ES'), inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Sistema de DNI', iconURL: interaction.client.user.displayAvatarURL() });

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Error al consultar DNI:', error);
      await interaction.reply({
        content: '❌ Error al consultar el DNI. Inténtalo nuevamente.',
        ephemeral: true
      });
    }
  }
};