# 🏦 API Bancaire Multi-Banque

API REST de gestion bancaire avec Express.js — Dépôt, Retrait, Transfert inter-bancaire.

---

## 📁 Structure du projet

```
banking-api/
├── src/
│   ├── app.js                        ← Point d'entrée
│   ├── config/
│   │   └── swagger.js                ← Configuration Swagger
│   ├── controllers/
│   │   ├── accountController.js      ← Créer/Lister comptes
│   │   ├── transactionController.js  ← Dépôt/Retrait/Transfert
│   │   └── bankController.js         ← Créer/Lister banques
│   ├── routes/
│   │   ├── accountRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── bankRoutes.js
│   ├── models/
│   │   └── database.js               ← Base de données en mémoire
│   └── middlewares/
│       └── errorHandler.js
├── package.json
├── render.yaml                        ← Config déploiement Render
└── README.md
```

---



---

## 📌 Endpoints principaux

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/banks` | Lister les banques |
| POST | `/api/banks` | Créer une banque |
| GET | `/api/accounts` | Lister les comptes |
| POST | `/api/accounts` | Créer un compte |
| POST | `/api/transactions/deposit` | Dépôt |
| POST | `/api/transactions/withdraw` | Retrait |
| POST | `/api/transactions/transfer` | Transfert inter-bancaire |
| GET | `/api/transactions/account/:id` | Historique |

---

## ☁️ Déploiement sur Render — Étapes

### Étape 1 — Pousser sur GitHub

```bash
# Dans le dossier banking-api
git init
git add .
git commit -m "Initial commit - API Bancaire"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/banking-api.git
git push -u origin main
```

### Étape 2 — Créer le service sur Render

1. Aller sur **https://render.com** → Se connecter
2. Cliquer **"New +"** → **"Web Service"**
3. Connecter votre dépôt GitHub → Sélectionner **banking-api**
4. Remplir les champs :
   - **Name** : `banking-api`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
5. Cliquer **"Create Web Service"**
6. Attendre le déploiement (2-3 minutes)
7. Votre URL sera : `https://banking-api-xxxx.onrender.com`

### Étape 3 — Tester en production

```
https://banking-api-xxxx.onrender.com/api-docs
```

---

## 🏦 Banques pré-chargées

| ID | Nom | Code |
|----|-----|------|
| `bank-001` | Banque Centrale du Cameroun | BCC |
| `bank-002` | Afriland First Bank | AFB |
