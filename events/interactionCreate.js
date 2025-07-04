const { Events, PermissionsBitField } = require('discord.js');
const ticketManager = require('../utils/ticketManager');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isStringSelectMenu() && interaction.customId === 'menu_ticket') {
      const motivo = interaction.values[0];

      const yaExiste = ticketManager.hasTicket(interaction.user.id, interaction.guild);
      if (yaExiste) {
        return interaction.reply({ content: '❗ Ya tienes un ticket abierto.', ephemeral: true });
      }

      const canal = await ticketManager.createTicket(interaction, motivo);
      return interaction.reply({ content: `✅ Ticket creado: ${canal}`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'abrir_ticket') {
      const yaExiste = ticketManager.hasTicket(interaction.user.id, interaction.guild);
      if (yaExiste) {
        return interaction.reply({ content: '❗ Ya tienes un ticket abierto.', ephemeral: true });
      }

      const canal = await ticketManager.createTicket(interaction, 'otro');
      return interaction.reply({ content: `✅ Ticket creado: ${canal}`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'cerrar_ticket') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return interaction.reply({ content: '❌ No tienes permisos para cerrar tickets.', ephemeral: true });
      }

      // Enviar log de cierre antes de eliminar el canal
      await ticketManager.sendCloseTicketLog(interaction);

      await interaction.reply({ content: '🔒 Cerrando ticket en 3 segundos...', ephemeral: false });

      setTimeout(async () => {
        await interaction.channel.delete().catch(() => {});
      }, 3000);
    }

    if (interaction.isButton() && interaction.customId === 'reclamar_ticket') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return interaction.reply({ content: '❌ No tienes permisos para reclamar tickets.', ephemeral: true });
      }

      await interaction.reply({ content: `🎯 Ticket reclamado por <@${interaction.user.id}>`, ephemeral: false });
    }

    // Manejo de botones para solicitar-rol
    if (interaction.isButton() && interaction.customId.startsWith('aceptar_rol_')) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return interaction.reply({ content: '❌ No tienes permisos para gestionar solicitudes de roles.', ephemeral: true });
      }

      const [, , userId, roleId] = interaction.customId.split('_');
      const miembro = await interaction.guild.members.fetch(userId).catch(() => null);

      if (!miembro) {
        return interaction.reply({ content: '❌ No se pudo encontrar al usuario.', ephemeral: true });
      }

      const rol = interaction.guild.roles.cache.get(roleId);

      if (!rol) {
        return interaction.reply({ content: '❌ No se pudo encontrar el rol.', ephemeral: true });
      }

      try {
        await miembro.roles.add(rol);
        await interaction.reply({ 
          content: `✅ **Solicitud aceptada**\n<@${userId}> ahora tiene el rol ${rol}`,
          ephemeral: false 
        });

        // Enviar DM al usuario
        try {
          await miembro.send(`✅ Tu solicitud para el rol **${rol.name}** ha sido **aceptada** por ${interaction.user.tag}.`);
        } catch (error) {
          console.log('No se pudo enviar DM al usuario');
        }
      } catch (error) {
        await interaction.reply({ content: '❌ Error al asignar el rol.', ephemeral: true });
      }
    }

    if (interaction.isButton() && interaction.customId.startsWith('denegar_rol_')) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return interaction.reply({ content: '❌ No tienes permisos para gestionar solicitudes de roles.', ephemeral: true });
      }

      const [, , userId, roleId] = interaction.customId.split('_');
      const miembro = await interaction.guild.members.fetch(userId).catch(() => null);
      const rol = interaction.guild.roles.cache.get(roleId);

      if (!miembro) {
        return interaction.reply({ content: '❌ No se pudo encontrar al usuario.', ephemeral: true });
      }

      if (!rol) {
        return interaction.reply({ content: '❌ No se pudo encontrar el rol.', ephemeral: true });
      }

      await interaction.reply({ 
        content: `❌ **Solicitud denegada**\nLa solicitud de <@${userId}> para el rol ${rol} ha sido rechazada por ${interaction.user.tag}`,
        ephemeral: false 
      });

      // Enviar DM al usuario
      try {
        await miembro.send(`❌ Tu solicitud para el rol **${rol.name}** ha sido **denegada** por ${interaction.user.tag}.`);
      } catch (error) {
        console.log('No se pudo enviar DM al usuario');
      }
    }

    // Manejo de comandos slash
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No se encontró el comando ${interaction.commandName}.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error('Error ejecutando comando:', error);
        const content = '❌ Hubo un error al ejecutar este comando.';

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content, ephemeral: true });
        } else {
          await interaction.reply({ content, ephemeral: true });
        }
      }
    }
  }
};