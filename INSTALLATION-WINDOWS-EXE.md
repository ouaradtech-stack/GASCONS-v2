# 🚀 GUIDE D'INSTALLATION & COMPILATION WINDOWS (.EXE) - GASCONS

Ce guide vous explique comment convertir et installer **GASCONS** en tant qu'application Desktop native pour **Windows 10, Windows 11 et Windows Server** (64-bit).

---

## 📦 Méthode 1 : Compilation Automatique en 1 Clic (Recommandé)

### Prérequis :
- Un ordinateur sous Windows
- **Node.js** installé (téléchargeable gratuitement sur [https://nodejs.org](https://nodejs.org))

### Étapes :
1. **Téléchargez le code source complet (ZIP)** :
   - Dans Google AI Studio, cliquez sur les options en haut à droite `⋮` puis choisissez **« Export to ZIP »**.
   - Décompressez l'archive ZIP dans un dossier sur votre PC (ex: `C:\GASCONS\`).

2. **Générer le fichier .EXE** :
   - Double-cliquez simplement sur le fichier **`build-windows-exe.bat`** inclus à la racine du projet.
   - Le script installe les modules requis, compile l'application et crée l'installeur.

3. **Résultat** :
   - Le dossier **`\release\`** s'ouvrira automatiquement contenant :
     - **`GASCONS-Setup-1.0.0.exe`** : Programme d'installation complet avec raccourci sur le Bureau et dans le Menu Démarrer.
     - **`GASCONS-Portable.exe`** : Version autonome sans installation, exécutable directement depuis une clé USB.

---

## ⚡ Méthode 2 : Ligne de Commande Manuelle (PowerShell ou Invite de commandes)

Ouvrez un terminal dans le dossier du projet et exécutez :

```bash
# 1. Installer les dépendances
npm install

# 2. Compiler pour Windows (.EXE Setup + Portable)
npm run dist:win
```

Les exécutables générés se trouvent dans le dossier **`release/`**.

---

## 📴 Avantages de la Version Windows .EXE :
- **100% Hors-Ligne** : Fonctionne sans aucune connexion Internet sur les chantiers et postes isolés.
- **Impression Directe** : Impression des bons de sortie directement sur les imprimantes de bureau ou imprimantes tickets thermiques (80mm).
- **Persistance Locale** : Base de données locale sécurisée sur votre disque dur avec exports de sauvegarde réguliers.
