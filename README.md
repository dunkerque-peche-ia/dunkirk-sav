# 🛠️ Application SAV & Prise en Charge Atelier — Dunkirk Informatique

Application web professionnelle conçue sur-mesure pour **Dunkirk Informatique** permettant la saisie complète des dépôts de matériel informatique par les clients, l'impression de la fiche A4 normalisée (reçu client + fiche suiveuse atelier) et la synchronisation bidirectionnelle avec votre base de données **Baserow**.

---

## 📁 Emplacement du Projet
Le projet est localisé dans un dossier séparé et indépendant :
`C:\Users\ToshibaZ30\.gemini\antigravity-ide\scratch\dunkirk-sav`

---

## 🚀 Démarrage Rapide

Dans un terminal PowerShell ou Invite de commandes :

```powershell
cd C:\Users\ToshibaZ30\.gemini\antigravity-ide\scratch\dunkirk-sav
npm run dev
```

L'application est configurée pour démarrer automatiquement sur le port dédié **3005** :
👉 Ouvrez votre navigateur sur **[http://localhost:3005](http://localhost:3005)**

---

## ✨ Fonctionnalités Principales

### 1. Formulaire Complet de Prise en Charge (`/intake`)
- **Type de client** : Particulier ou Professionnel (Raison sociale, SIRET).
- **Matériel** : PC Portable, PC Fixe / Tour, Apple MacBook, iMac, Serveur/NAS, Disque dur / Récupération données, Smartphone / Tablette, etc.
- **Accès système** : Mot de passe session Windows/Mac ou code PIN.
- **Inventaire des accessoires** : Chargeur, câble alim, sacoche, souris, clé USB, adaptateur, boîte d'origine.
- **Inspection visuelle & État des lieux** : Rayures châssis, chocs/fissures, écran rayé/cassé, charnières, vis manquantes, traces de liquide.
- **Demande de diagnostic & Données** : Priorité de sauvegarde des données (Indispensable, Souhaitable, Sans importance), dossiers prioritaires.
- **Conditions financières** : Niveau d'urgence (Standard ou Express 24h), seuil budgétaire accepté sans devis, acompte versé.
- **Signature électronique tactile / souris** : Signature du client sur Canvas HTML5 directement intégrée au dossier.

### 2. Impression Normalisée Format A4 (`PrintableTicket`)
- Bouton dédié **"Imprimer la Fiche A4"** adapté pour imprimante laser/jet d'encre standard.
- **Volet 1 (Client)** : Reçu officiel avec coordonnées complètes de Dunkirk Informatique (Téléphone 03 39 91 26 59 / 07 43 01 22 24, email, mentions légales relatives aux 3 mois d'abandon de matériel selon la loi du 31/12/1903, et signature client).
- **Volet 2 (Atelier)** : Fiche suiveuse interne avec mot de passe bien visible, checklist d'intervention technique (Test alim, RAM, Dépoussiérage, Contrôle thermique, etc.) et rapport de réparation.

### 3. Tableau de Bord & Gestion des Dossiers (`/dashboard`)
- Statistiques en temps réel : Dossiers en cours, prêts pour restitution, archivés.
- Recherche instantanée par N° de ticket (ex: `DK-SAV-2026-0001`), nom, téléphone ou modèle.
- Filtre rapide par statut : *Déposé*, *Diagnostic*, *Devis en attente*, *Pièces commandées*, *Réparation*, *Tests*, *Prêt*, *Restitué*.
- Modal de rapport d'intervention technique : ajout des pièces changées et du montant total facturé.

### 4. Intégration & Synchronisation Baserow (`/settings`)
- **Connexion API native** : configuration via URL de l'API (`https://api.baserow.io`), Database Token et Table ID.
- Bouton de **Test de connexion** immédiat.
- **Bouton de synchronisation de la file d'attente** en cas de saisie hors-ligne.
- **Tableau des 24 champs recommandés** avec bouton pour copier le modèle en un clic.
