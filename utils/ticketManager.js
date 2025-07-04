const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const logsConfig = require('../config/logs.json');

module.exports = {
  hasTicket(userId, guild) {
    return guild.channels.cache.some(c => c.name === `ticket-${userId}`);
  },

  async sendTicketLog(interaction, ticketChannel, motivo) {
    const logChannelId = logsConfig.logs[motivo];
    if (!logChannelId) return;

    const logChannel = interaction.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const motivosNames = {
      'duda': 'Dudas Generales',
      'reporte': 'Reportes a Staff',
      'apelar': 'CKS y Apelaciones',
      'otro': 'Otros',
      'alianzas': 'Logs Alianzas',
      'reportar-usuario': 'Logs Reportar Usuario',
      'cks-apelaciones': 'Logs CKS y Apelaciones',
      'contactar-direccion': 'Logs Contactar Dirección',
      'liverys': 'Logs Liverys',
      'estado-mdt': 'Estado MDT',
      'logs-bot': 'Logs Bot'
    };

    const embed = new EmbedBuilder()
      .setTitle('🎫 Nuevo Ticket Creado')
      .setColor(0x00ff00)
      .addFields(
        { name: '👤 Usuario', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
        { name: '📂 Categoría', value: motivosNames[motivo] || motivo, inline: true },
        { name: '🎯 Canal', value: `${ticketChannel}`, inline: true },
        { name: '📅 Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `ID: ${interaction.user.id}` });

    await logChannel.send({ embeds: [embed] });
  },

  async sendCloseTicketLog(interaction) {
    const channelName = interaction.channel.name;
    const userId = channelName.replace('ticket-', '');
    const user = await interaction.client.users.fetch(userId).catch(() => null);

    const topic = interaction.channel.topic || '';
    const motivoMatch = topic.match(/Motivo: (\w+)/);
    const motivo = motivoMatch ? motivoMatch[1] : 'otro';

    const logChannelId = logsConfig.logs[motivo];
    if (!logChannelId) return;

    const logChannel = interaction.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const motivosNames = {
      'duda': 'Dudas Generales',
      'reporte': 'Reportes a Staff',
      'apelar': 'CKS y Apelaciones',
      'otro': 'Otros',
      'alianzas': 'Logs Alianzas',
      'reportar-usuario': 'Logs Reportar Usuario',
      'cks-apelaciones': 'Logs CKS y Apelaciones',
      'contactar-direccion': 'Logs Contactar Dirección',
      'liverys': 'Logs Liverys',
      'estado-mdt': 'Estado MDT',
      'logs-bot': 'Logs Bot'
    };

    const embed = new EmbedBuilder()
      .setTitle('🔒 Ticket Cerrado')
      .setColor(0xff0000)
      .addFields(
        { name: '👤 Usuario', value: user ? `${user} (${user.tag})` : `ID: ${userId}`, inline: true },
        { name: '📂 Categoría', value: motivosNames[motivo] || motivo, inline: true },
        { name: '👮 Cerrado por', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
        { name: '📅 Fecha de cierre', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `Canal: ${channelName}` });

    await logChannel.send({ embeds: [embed] });
  },

  async createTicket(interaction, motivo) {
    const staffRoles = interaction.guild.roles.cache.filter(role =>
      role.permissions.has(PermissionFlagsBits.ModerateMembers)
    );

    const permissionOverwrites = [
      {
        id: interaction.guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles
        ]
      },
      {
        id: interaction.client.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      }
    ];

    for (const [roleId] of staffRoles) {
      permissionOverwrites.push({
        id: roleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageMessages
        ]
      });
    }

    const canal = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.id}`,
      type: ChannelType.GuildText,
      topic: `Ticket de ${interaction.user.tag} | Motivo: ${motivo}`,
      permissionOverwrites
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('cerrar_ticket')
        .setLabel('🔒 Cerrar')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('reclamar_ticket')
        .setLabel('📌 Reclamar')
        .setStyle(ButtonStyle.Secondary)
    );

    await canal.send({
      content: `<@${interaction.user.id}> Bienvenido al soporte. Un miembro del staff responderá pronto.`,
      components: [row]
    });

    await this.sendTicketLog(interaction, canal, motivo);

    return canal;
  }
};