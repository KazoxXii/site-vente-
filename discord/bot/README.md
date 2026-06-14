# Bot Discord MALTY — Guide d'installation

## 📋 Prérequis

1. **Python 3.9+** installé → https://python.org
2. **Un compte Discord** avec un serveur
3. **Un compte développeur** → https://discord.com/developers

## 🚀 Étape 1 : Créer le bot

1. Va sur https://discord.com/developers/applications
2. Clique sur **"New Application"**
3. Nom : **MALTY Bot**
4. Va dans **"Bot"** → **"Add Bot"**
5. Active **"Message Content Intent"**
6. Copie le **Token** (gardé secret !)

## 🚀 Étape 2 : Configurer les IDs

Dans `bot.py`, remplace ces IDs :

```python
TOKEN = "TON_TOKEN_DISCORD_ICI"  # Le token copié à l'étape 1
GUILD_ID = 123456789012345678    # ID de ton serveur
WELCOME_CHANNEL_ID = 123456789012345678  # ID #présentation
TICKET_CATEGORY_ID = 123456789012345678  # ID catégorie Tickets
LOG_CHANNEL_ID = 123456789012345678  # ID #logs
ANNOUNCEMENT_CHANNEL_ID = 123456789012345678  # ID #annonces
```

**Pour trouver les IDs :**
- Active le mode développeur dans Discord (Paramètres → Avancé)
- Clic droit sur un channel → "Copier l'ID"

## 🚀 Étape 3 : Inviter le bot

1. Va dans **"OAuth2"** → **"URL Generator"**
2. Coche : `bot`, `applications.commands`
3. Permissions : `Administrator`
4. Ouvre le lien généré et ajoute le bot à ton serveur

## 🚀 Étape 4 : Installer les dépendances

```bash
pip install discord.py
```

## 🚀 Étape 5 : Lancer le bot

```bash
python bot.py
```

## 📦 Commandes disponibles

| Commande | Description | Permission |
|----------|-------------|------------|
| `/commande` | Passer une commande | Tous |
| `/statut` | Voir tes commandes | Tous |
| `/admin-statut` | Changer le statut | Admin |
| `/verifier` | Vérifier un membre | Admin |
| `/setup-verification` | Message de vérif | Admin |
| `/stats` | Statistiques | Admin |
| `/help` | Aide | Tous |
| `/ping` | Latence | Tous |

## 🛡️ Fonctionnalités

- **Anti-spam** : Protection contre le spam
- **Vérification** : Système de vérification par réaction
- **Tickets** : Gestion des commandes par channel
- **Logs** : Journal de tous les événements
- **Auto-rôle** : Attribution automatique après vérification

## ⚠️ Sécurité

- Ne partage JAMAIS ton token
- Ajoute le token dans `.gitignore`
- Utilise un fichier `.env` en production