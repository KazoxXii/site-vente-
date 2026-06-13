import discord
from discord.ext import commands
from discord import app_commands
import asyncio
import json
import os
from datetime import datetime

# --- CONFIG ---
TOKEN = os.environ.get("DISCORD_TOKEN", "")
GUILD_ID = int(os.environ.get("GUILD_ID", "0"))
WELCOME_CHANNEL_ID = int(os.environ.get("WELCOME_CHANNEL_ID", "0"))
TICKET_CATEGORY_ID = int(os.environ.get("TICKET_CATEGORY_ID", "0"))
LOG_CHANNEL_ID = int(os.environ.get("LOG_CHANNEL_ID", "0"))
ANNOUNCEMENT_CHANNEL_ID = int(os.environ.get("ANNOUNCEMENT_CHANNEL_ID", "0"))

# --- INTENTS ---
intents = discord.Intents.all()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)

# --- DONNÉES ---
DATA_FILE = "data.json"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return {"orders": [], "warnings": {}, "verified": [], "config": {}}

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

# --- ÉVÉNEMENTS ---
@bot.event
async def on_ready():
    await bot.tree.sync()
    print(f"Bot connecté en tant que {bot.user}")
    await bot.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name="les commandes | !help"))

@bot.event
async def on_member_join(member):
    data = load_data()
    channel = bot.get_channel(WELCOME_CHANNEL_ID)
    
    # Message de bienvenue
    embed = discord.Embed(
        title=f"Bienvenue {member.name} !",
        description=f"Hey {member.mention}, bienvenue sur **MALTY — Création de Sites Web** !\n\n"
                    f"📋 Lis le règlement dans #règlement\n"
                    f"🎯 Présente-toi dans #présentation\n"
                    f"🚀 Découvre nos services dans #nos-services\n\n"
                    f"🎁 **Offre bienvenue :** -10% avec le code **BIENVENUE10**",
        color=0x0066ff
    )
    embed.set_thumbnail(url=member.avatar.url if member.avatar else member.default_avatar.url)
    embed.set_footer(text=f"Membre n°{len(member.guild.members)}")
    await channel.send(embed=embed)
    
    # Log
    log_channel = bot.get_channel(LOG_CHANNEL_ID)
    if log_channel:
        await log_channel.send(f"✅ {member.mention} a rejoint le serveur ({len(member.guild.members)} membres)")

@bot.event
async def on_member_remove(member):
    log_channel = bot.get_channel(LOG_CHANNEL_ID)
    if log_channel:
        await log_channel.send(f"❌ {member.name} a quitté le serveur")

@bot.event
async def on_message(message):
    if message.author.bot:
        return
    
    # Anti-spam
    data = load_data()
    user_id = str(message.author.id)
    
    if user_id not in data["warnings"]:
        data["warnings"][user_id] = {"count": 0, "last_message": ""}
    
    now = datetime.now().timestamp()
    last = data["warnings"][user_id].get("last_timestamp", 0)
    
    if now - last < 2:  # Moins de 2 secondes entre les messages
        data["warnings"][user_id]["count"] += 1
        if data["warnings"][user_id]["count"] >= 3:
            await message.delete()
            await message.channel.send(f"⚠️ {message.author.mention}, pas de spam !", delete_after=5)
            role = discord.utils.get(message.guild.roles, name="Muted")
            if not role:
                role = await message.guild.create_role(name="Muted", permissions=discord.Permissions(send_messages=False))
                for channel in message.guild.channels:
                    await channel.set_permissions(role, send_messages=False)
            await message.author.add_roles(role)
            await asyncio.sleep(60)
            await message.author.remove_roles(role)
            data["warnings"][user_id]["count"] = 0
    else:
        data["warnings"][user_id]["count"] = 0
    
    data["warnings"][user_id]["last_timestamp"] = now
    save_data(data)
    
    await bot.process_commands(message)

# --- COMMANDES ---

# Ticket / Commande
@bot.tree.command(name="commande", description="Passer une commande de site web")
@app_commands.describe(
    pack="Le pack que tu veux commander",
    description="Décris ton projet"
)
@app_commands.choices(pack=[
    app_commands.Choice(name="Landing Page — 99€", value="landing"),
    app_commands.Choice(name="Portfolio — 249€", value="portfolio"),
    app_commands.Choice(name="Site Vitrine — 449€", value="vitrine"),
    app_commands.Choice(name="Sur-Mesure — 899€", value="premium"),
])
async def commande(interaction: discord.Interaction, pack: app_commands.Choice[str], description: str):
    data = load_data()
    
    # Créer le ticket
    category = bot.get_channel(TICKET_CATEGORY_ID)
    ticket_channel = await interaction.guild.create_text_channel(
        f"commande-{interaction.user.name}",
        category=category,
        topic=f"Commande {pack.name} — {interaction.user.name}"
    )
    
    # Permissions
    await ticket_channel.set_permissions(interaction.user, read_messages=True, send_messages=True)
    await ticket_channel.set_permissions(interaction.guild.default_role, read_messages=False)
    
    # Embed
    embed = discord.Embed(
        title=f"📦 Nouvelle commande — {pack.name}",
        description=f"**Client :** {interaction.user.mention}\n\n"
                    f"**Pack :** {pack.name}\n\n"
                    f"**Description :**\n{description}\n\n"
                    f"**Statut :** 🟡 En attente",
        color=0x00cc66
    )
    embed.set_footer(text=f"ID : {interaction.user.id} | {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    
    await ticket_channel.send(embed=embed)
    await ticket_channel.send(f"{interaction.user.mention} Ton ticket a été créé ! MALTY va te contacter ici.")
    
    # Sauvegarder
    data["orders"].append({
        "user_id": interaction.user.id,
        "channel_id": ticket_channel.id,
        "pack": pack.value,
        "pack_name": pack.name,
        "description": description,
        "status": "pending",
        "created_at": datetime.now().isoformat()
    })
    save_data(data)
    
    # Réponse
    await interaction.response.send_message(f"✅ Ta commande a été créée ! Va dans {ticket_channel.mention}", ephemeral=True)
    
    # Log
    log_channel = bot.get_channel(LOG_CHANNEL_ID)
    if log_channel:
        await log_channel.send(f"📦 **Nouvelle commande** de {interaction.user.mention} : {pack.name}")

# Statut de commande
@bot.tree.command(name="statut", description="Voir le statut de ta commande")
async def statut(interaction: discord.Interaction):
    data = load_data()
    user_orders = [o for o in data["orders"] if o["user_id"] == interaction.user.id]
    
    if not user_orders:
        await interaction.response.send_message("❌ Tu n'as pas encore de commande.", ephemeral=True)
        return
    
    embed = discord.Embed(
        title="📦 Tes commandes",
        color=0x0066ff
    )
    
    for order in user_orders:
        status_emoji = {"pending": "🟡", "in_progress": "🔵", "completed": "🟢", "delivered": "✅"}
        status_text = {"pending": "En attente", "in_progress": "En cours", "completed": "Terminée", "delivered": "Livrée"}
        
        embed.add_field(
            name=f"{status_emoji.get(order['status'], '⚪')} {order['pack_name']}",
            value=f"Statut : {status_text.get(order['status'], order['status'])}\n"
                  f"Créée le : {order['created_at'][:10]}",
            inline=False
        )
    
    await interaction.response.send_message(embed=embed, ephemeral=True)

# Admin : Changer le statut
@bot.tree.command(name="admin-statut", description="Changer le statut d'une commande (Admin)")
@app_commands.describe(
    channel="Le channel de la commande",
    statut="Le nouveau statut"
)
@app_commands.choices(statut=[
    app_commands.Choice(name="🟡 En attente", value="pending"),
    app_commands.Choice(name="🔵 En cours", value="in_progress"),
    app_commands.Choice(name="🟢 Terminée", value="completed"),
    app_commands.Choice(name="✅ Livrée", value="delivered"),
])
@app_commands.checks.has_permissions(administrator=True)
async def admin_statut(interaction: discord.Interaction, channel: discord.TextChannel, statut: app_commands.Choice[str]):
    data = load_data()
    
    for order in data["orders"]:
        if order["channel_id"] == channel.id:
            order["status"] = statut.value
            save_data(data)
            
            status_text = {"pending": "En attente", "in_progress": "En cours", "completed": "Terminée", "delivered": "Livrée"}
            await interaction.response.send_message(f"✅ Statut mis à jour : **{status_text.get(statut.value, statut.value)}**")
            
            # Notification au client
            user = bot.get_user(order["user_id"])
            if user:
                await user.send(f"📦 Ta commande **{order['pack_name']}** est maintenant : **{status_text.get(statut.value, statut.value)}**")
            return
    
    await interaction.response.send_message("❌ Commande non trouvée.", ephemeral=True)

# Vérification
@bot.tree.command(name="verifier", description="Vérifier un nouveau membre (Admin)")
@app_commands.checks.has_permissions(administrator=True)
async def verifier(interaction: discord.Interaction, member: discord.Member):
    role = discord.utils.get(interaction.guild.roles, name="Membre")
    if role:
        await member.add_roles(role)
        data = load_data()
        data["verified"].append(member.id)
        save_data(data)
        await interaction.response.send_message(f"✅ {member.name} a été vérifié !")
        
        # Log
        log_channel = bot.get_channel(LOG_CHANNEL_ID)
        if log_channel:
            await log_channel.send(f"✅ {member.name} a été vérifié par {interaction.user.name}")

# Vérification automatique par réaction
@bot.event
async def on_raw_reaction_add(payload):
    if payload.emoji.name == "✅":
        data = load_data()
        if payload.user_id not in data["verified"]:
            guild = bot.get_guild(payload.guild_id)
            member = guild.get_member(payload.user_id)
            if member:
                role = discord.utils.get(guild.roles, name="Membre")
                if role:
                    await member.add_roles(role)
                    data["verified"].append(payload.user_id)
                    save_data(data)
                    
                    channel = bot.get_channel(payload.channel_id)
                    message = await channel.fetch_message(payload.message_id)
                    await message.remove_reaction("✅", member)

# Message de vérification
@bot.tree.command(name="setup-verification", description="Envoyer le message de vérification (Admin)")
@app_commands.checks.has_permissions(administrator=True)
async def setup_verification(interaction: discord.Interaction):
    embed = discord.Embed(
        title="🔐 Vérification",
        description="Clique sur ✅ ci-dessous pour accéder à tous les channels du serveur.",
        color=0x0066ff
    )
    msg = await interaction.channel.send(embed=embed)
    await msg.add_reaction("✅")
    await interaction.response.send_message("✅ Message de vérification envoyé !", ephemeral=True)

# Stats
@bot.tree.command(name="stats", description="Voir les stats du serveur (Admin)")
@app_commands.checks.has_permissions(administrator=True)
async def stats(interaction: discord.Interaction):
    data = load_data()
    
    embed = discord.Embed(
        title="📊 Statistiques du serveur",
        color=0x0066ff
    )
    
    embed.add_field(name="👥 Membres", value=str(len(interaction.guild.members)), inline=True)
    embed.add_field(name="📦 Commandes", value=str(len(data["orders"])), inline=True)
    embed.add_field(name="🟡 En attente", value=str(len([o for o in data["orders"] if o["status"] == "pending"])), inline=True)
    embed.add_field(name="🔵 En cours", value=str(len([o for o in data["orders"] if o["status"] == "in_progress"])), inline=True)
    embed.add_field(name="🟢 Terminées", value=str(len([o for o in data["orders"] if o["status"] == "completed"])), inline=True)
    embed.add_field(name="✅ Livrées", value=str(len([o for o in data["orders"] if o["status"] == "delivered"])), inline=True)
    embed.add_field(name="✅ Vérifiés", value=str(len(data["verified"])), inline=True)
    
    # Chiffre d'affaires
    total = 0
    prices = {"landing": 99, "portfolio": 249, "vitrine": 449, "premium": 899}
    for order in data["orders"]:
        if order["status"] in ["completed", "delivered"]:
            total += prices.get(order["pack"], 0)
    
    embed.add_field(name="💰 CA", value=f"{total}€", inline=True)
    
    await interaction.response.send_message(embed=embed, ephemeral=True)

# Help
@bot.tree.command(name="help", description="Voir la liste des commandes")
async def help(interaction: discord.Interaction):
    embed = discord.Embed(
        title="📖 Commandes disponibles",
        color=0x0066ff
    )
    
    embed.add_field(
        name="🛒 Commandes",
        value="`/commande` — Passer une commande\n"
              "`/statut` — Voir tes commandes",
        inline=False
    )
    
    embed.add_field(
        name="🛡️ Admin",
        value="`/admin-statut` — Changer le statut\n"
              "`/verifier` — Vérifier un membre\n"
              "`/setup-verification` — Message de vérif\n"
              "`/stats` — Statistiques",
        inline=False
    )
    
    embed.add_field(
        name="ℹ️ Info",
        value="`/help` — Cette aide\n"
              "`/ping` — Vérifier le bot",
        inline=False
    )
    
    await interaction.response.send_message(embed=embed, ephemeral=True)

# Ping
@bot.tree.command(name="ping", description="Vérifier la latence du bot")
async def ping(interaction: discord.Interaction):
    await interaction.response.send_message(f"🏓 Pong ! Latence : {round(bot.latency * 1000)}ms")

# --- LANCER LE BOT ---
bot.run(TOKEN)