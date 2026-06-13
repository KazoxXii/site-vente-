# Déployer le bot sur Railway — Guide complet

## Étape 1 : Créer un compte GitHub

1. Va sur **https://github.com**
2. Clique **"Sign up"**
3. Crée un compte gratuit
4. Vérifie ton email

## Étape 2 : Créer un repo GitHub

1. Clique sur **"+"** en haut à droite → **"New repository"**
2. Nom : **bot-discord-malty**
3. Choisis **"Public"** (pour Railway gratuit)
4. Coche **"Add a README file"**
5. Clique **"Create repository"**

## Étape 3 : Uploader les fichiers du bot

### Option A : Via le site GitHub (simple)

1. Dans ton repo, clique **"Add file"** → **"Upload files"**
2. Glisse-dépose tout le contenu du dossier `discord/bot/` :
   - `bot.py`
   - `requirements.txt`
   - `.gitignore`
3. Clique **"Commit changes"**

### Option B : Via Git (avancé)

```bash
cd "C:\Users\Administrateur\Documents\SITE WEB\website\discord\bot"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TON-UTILISATEUR/bot-discord-malty.git
git push -u origin master
```

## Étape 4 : Créer un compte Railway

1. Va sur **https://railway.app**
2. Clique **"Login"**
3. Clique **"Login with GitHub"**
4. Autorise Railway à accéder à tes repos

## Étape 5 : Créer un projet

1. Clique **"New Project"**
2. Clique **"Deploy from GitHub repo"**
3. Cherche et sélectionne **bot-discord-malty**
4. Clique **"Deploy"**

## Étape 6 : Ajouter le token Discord

1. Dans ton projet Railway, va dans l'onglet **"Variables"**
2. Clique **"New Variable"**
3. Nom : `DISCORD_TOKEN`
4. Valeur : colle ton token Discord
5. Clique **"Add"**

## Étape 7 : Configurer le déploiement

1. Va dans **"Settings"**
2. Dans **"Build Settings"**, vérifie :
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `python bot.py`
3. Dans **"Service Settings"** :
   - **Service Type** : **Worker** (pas Web Service)
   - **Restart Policy** : **Always restart**

## Étape 8 : Lancer

1. Clique **"Deploy"** ou **"Redeploy"**
2. Attends 1-2 minutes
3. Le bot devrait afficher **"Deployed"** en vert

## Étape 9 : Vérifier que le bot tourne

1. Va sur ton serveur Discord
2. Le bot devrait être **en ligne** (point vert)
3. Tape `/ping` pour vérifier

---

## ❌ Problèmes courants

### "Invalid Token"
- Vérifie que le token est correct
- Régénère le token sur le Developer Portal si besoin

### Bot offline
- Regarde les logs dans Railway → Onglet "Logs"
- Vérifie que le service est en mode "Worker"

### Bot qui plante
- Railway redémarre automatiquement
- Regarde les logs pour comprendre l'erreur

---

## 💰 Tarif Railway

- **Gratuit** : 500 heures/mois (suffisant pour un bot)
- Le bot dort après 30 min d'inactivité, mais se réveille quand on lui parle

## 🔄 Pour mettre à jour le bot

1. Modifie `bot.py` sur ton PC
2. Push sur GitHub :
```bash
git add .
git commit -m "Update"
git push
```
3. Railway redémarre automatiquement