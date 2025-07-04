
const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const logsConfig = require('../config/logs.json');

module.exports = {
  hasTicket(userId, guild) {
    return guild.channels.cache.some(c => c.name === `ticket-${userId}`);
  },

  generateTicketId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
      'alianzas': 'Alianzas',
      'reportar-usuario': 'Reportar Usuario',
      'cks-apelaciones': 'CKS y Apelaciones',
      'contactar-direccion': 'Contactar Dirección',
      'liverys': 'Liverys',
      'estado-mdt': 'Estado MDT',
      'logs-bot': 'Logs Bot'
    };

    const ticketId = this.generateTicketId();
    
    // Actualizar el topic del canal con el ID del ticket
    await ticketChannel.setTopic(`Ticket de ${interaction.user.tag} | Motivo: ${motivo} | ID: ${ticketId}`);

    const embed = new EmbedBuilder()
      .setTitle('🟢 Ticket Abierto')
      .setColor(0x00ff00)
      .addFields(
        { name: 'Usuario', value: `@${interaction.user.username}`, inline: true },
        { name: 'Categoría', value: `${this.getCategoryEmoji(motivo)} ${motivosNames[motivo] || motivo}`, inline: true },
        { name: 'Canal', value: `#${ticketChannel.name}`, inline: true },
        { name: 'ID Ticket', value: ticketId, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `SpainRP | Logs de Tickets | ${new Date().toLocaleDateString('es-ES')}` });

    await logChannel.send({ embeds: [embed] });
    return ticketId;
  },

  async sendCloseTicketLog(interaction, claimedBy = null) {
    const channelName = interaction.channel.name;
    const userId = channelName.replace('ticket-', '');
    const user = await interaction.client.users.fetch(userId).catch(() => null);

    const topic = interaction.channel.topic || '';
    const motivoMatch = topic.match(/Motivo: (\w+)/);
    const ticketIdMatch = topic.match(/ID: (\w+)/);
    const motivo = motivoMatch ? motivoMatch[1] : 'otro';
    const ticketId = ticketIdMatch ? ticketIdMatch[1] : 'desconocido';

    const logChannelId = logsConfig.logs[motivo];
    if (!logChannelId) return;

    const logChannel = interaction.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const motivosNames = {
      'duda': 'Dudas Generales',
      'reporte': 'Reportes a Staff',
      'apelar': 'CKS y Apelaciones',
      'otro': 'Otros',
      'alianzas': 'Alianzas',
      'reportar-usuario': 'Reportar Usuario',
      'cks-apelaciones': 'CKS y Apelaciones',
      'contactar-direccion': 'Contactar Dirección',
      'liverys': 'Liverys',
      'estado-mdt': 'Estado MDT',
      'logs-bot': 'Logs Bot'
    };

    // Crear transcripción del ticket
    const transcript = await this.createTranscript(interaction.channel, user, motivo, ticketId, claimedBy, interaction.user);
    
    const embed = new EmbedBuilder()
      .setTitle('🔒 Transcripción de Ticket Cerrado')
      .setColor(0xff0000)
      .addFields(
        { name: 'Usuario', value: user ? `@${user.username}` : `ID: ${userId}`, inline: true },
        { name: 'Categoría', value: `${this.getCategoryEmoji(motivo)} ${motivosNames[motivo] || motivo}`, inline: true },
        { name: 'Ticket ID', value: ticketId, inline: true },
        { name: 'Reclamado por', value: claimedBy ? `@${claimedBy.username}` : 'No reclamado', inline: true },
        { name: 'Cerrado por', value: `@${interaction.user.username}`, inline: true },
        { name: 'Fecha de Cierre', value: `${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}` });

    // Enviar el embed y el archivo de transcripción
    await logChannel.send({ 
      embeds: [embed],
      files: [{
        attachment: transcript.path,
        name: transcript.filename
      }]
    });

    // Eliminar el archivo temporal después de enviarlo
    setTimeout(() => {
      fs.unlinkSync(transcript.path);
    }, 5000);
  },

  getCategoryEmoji(motivo) {
    const emojis = {
      'duda': '❓',
      'reporte': '⚠️',
      'apelar': '📢',
      'otro': '📝',
      'alianzas': '🤝',
      'reportar-usuario': '🚨',
      'cks-apelaciones': '⚖️',
      'contactar-direccion': '📧',
      'liverys': '🎨',
      'estado-mdt': '💻',
      'logs-bot': '🤖'
    };
    return emojis[motivo] || '📝';
  },

  async createTranscript(channel, user, categoria, ticketId, claimedBy, closedBy) {
    try {
      // Obtener todos los mensajes del canal
      const messages = await channel.messages.fetch({ limit: 100 });
      const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

      const motivosNames = {
        'duda': 'Dudas Generales',
        'reporte': 'Reportes a Staff',
        'apelar': 'CKS y Apelaciones',
        'otro': 'Otros',
        'alianzas': 'Alianzas',
        'reportar-usuario': 'Reportar Usuario',
        'cks-apelaciones': 'CKS y Apelaciones',
        'contactar-direccion': 'Contactar Dirección',
        'liverys': 'Liverys',
        'estado-mdt': 'Estado MDT',
        'logs-bot': 'Logs Bot'
      };

      let transcript = '';
      transcript += '==========================================\n';
      transcript += '         TRANSCRIPCIÓN DE TICKET\n';
      transcript += '==========================================\n\n';
      transcript += `Usuario: ${user ? user.tag : 'Usuario desconocido'}\n`;
      transcript += `Categoría: ${motivosNames[categoria] || categoria}\n`;
      transcript += `Ticket ID: ${ticketId}\n`;
      transcript += `Canal: #${channel.name}\n`;
      transcript += `Reclamado por: ${claimedBy ? claimedBy.tag : 'No reclamado'}\n`;
      transcript += `Cerrado por: ${closedBy.tag}\n`;
      transcript += `Fecha de cierre: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}\n\n`;
      transcript += '==========================================\n';
      transcript += '              CONVERSACIÓN\n';
      transcript += '==========================================\n\n';

      sortedMessages.forEach(message => {
        const timestamp = new Date(message.createdTimestamp).toLocaleString('es-ES');
        transcript += `[${timestamp}] ${message.author.tag}: ${message.content}\n`;
        
        // Agregar información de archivos adjuntos si los hay
        if (message.attachments.size > 0) {
          message.attachments.forEach(attachment => {
            transcript += `    📎 Archivo adjunto: ${attachment.name} (${attachment.url})\n`;
          });
        }
        
        // Agregar información de embeds si los hay
        if (message.embeds.length > 0) {
          message.embeds.forEach(embed => {
            if (embed.title) transcript += `    📋 Embed: ${embed.title}\n`;
            if (embed.description) transcript += `    📝 Descripción: ${embed.description}\n`;
          });
        }
        
        transcript += '\n';
      });

      transcript += '==========================================\n';
      transcript += '            FIN DE TRANSCRIPCIÓN\n';
      transcript += '==========================================\n';

      // Crear el directorio de transcripciones si no existe
      const transcriptsDir = path.join(__dirname, '..', 'transcripts');
      if (!fs.existsSync(transcriptsDir)) {
        fs.mkdirSync(transcriptsDir, { recursive: true });
      }

      // Generar nombre de archivo
      const date = new Date().toISOString().split('T')[0];
      const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `ticket-${categoria}-${user ? user.username : 'unknown'}-${date}-${time}.txt`;
      const filepath = path.join(transcriptsDir, filename);

      // Escribir el archivo
      fs.writeFileSync(filepath, transcript, 'utf8');

      return {
        path: filepath,
        filename: filename
      };
    } catch (error) {
      console.error('Error creando transcripción:', error);
      return null;
    }
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
