const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tickets')
    .setDescription('Envía el mensaje del centro de soporte'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🎫 Centro de Soporte')
      .setDescription(
        `¡Bienvenido al **Centro de Soporte**!\n\n` +
        `**¿Tienes una duda, problema o sugerencia?**\n` +
        `Selecciona la categoría que mejor se adapte a tu caso.\n\n` +
        `__**Normas:**__\n` +
        `• Respeta a todos\n` +
        `• Presenta pruebas claras\n` +
        `• No abuses del ping en los tickets\n\n` +
        `Selecciona una opción en el menú o pulsa un botón para abrir tu ticket.`
      )
      .setColor(0x2f3136);

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('menu_ticket')
        .setPlaceholder('📂 Selecciona una categoría')
        .addOptions([
          {
            label: 'Dudas generales',
            value: 'duda',
            emoji: '❓',
            description: 'Consultas, preguntas o ayuda general'
          },
          {
            label: 'Reportar a Staff',
            value: 'reporte',
            emoji: '⚠️',
            description: 'Reporta a un usuario o problema'
          },
          {
            label: 'Alianzas',
            value: 'alianzas',
            emoji: '🤝',
            description: 'Temas relacionados con alianzas'
          },
          {
            label: 'Reportar Usuario',
            value: 'reportar-usuario',
            emoji: '🚨',
            description: 'Reportar comportamiento de usuario'
          },
          {
            label: 'CKS y Apelaciones',
            value: 'cks-apelaciones',
            emoji: '⚖️',
            description: 'Casos de CKS y apelaciones'
          },
          {
            label: 'Contactar Dirección',
            value: 'contactar-direccion',
            emoji: '📧',
            description: 'Comunicación con la dirección'
          },
          {
            label: 'Liverys',
            value: 'liverys',
            emoji: '🎨',
            description: 'Temas relacionados con liverys'
          },
          {
            label: 'Otros',
            value: 'otro',
            emoji: '📝',
            description: 'Cualquier otro motivo'
          }
        ])
    );

    const rowButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('abrir_ticket')
        .setLabel('🎟️ Abrir Ticket')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [menu, rowButton]
    });
  }
};