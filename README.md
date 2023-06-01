# Pronotif

[Pronotif](https://pronotif.fr/) est une application web (PWA) permettant de remplacer totalement l'application Pronote tout en étant beaucoup plus rapide au démarrage, fluide, belle et intuitive.

▷ **Disponible sur [pronotif.fr](https://pronotif.fr/)**  
▷ Instagram [**@pronotif**](https://www.instagram.com/pronotif/)

## Fonctionnalités actuelles

- Notifications de nouveaux devoirs, notes, retards, absences, etc...
- Notifications du **prochain cours** ou du **cours actuel**
- Emploi du temps, liste des devoirs, liste des notes, menu du jour, etc...
- Accédez à **l'emploi du temps de vos amis** et **partagez le votre** avec eux !
- Démarrage **16 fois** plus rapide que Pronote (**0.25 secondes** pour Pronotif contre **4.15 secondes** pour l'application Pronote)
- **Disponible en hors ligne** (contrairement à l'appli Pronote)

## Screenshots

![MainPage](https://i.imgur.com/7IYuwXH.png)
![MainPage2](https://i.imgur.com/jxqyEdt.png)

## Fonctionnement

Toutes les 10 minutes, le serveur (Node) récupère la liste des utilisateurs depuis le Cloud Firestore et traite chacun d'eux.

Le traitement d'un utilisateur consiste à:

1. Ouvrir une session Pronote avec les identifiants de l'utilisateur
2. Récupérer les données utiles (emploi du temps, devoirs, notes, absences, retards, etc...)
3. Comparer les données stockées dans le Cloud Firestore et les données récentes
4. Si des nouvelles données sont détectées (nouveaux devoirs, nouvelle note, etc...), envoyer une notification à l'utilisateur
5. Si des nouvelles données sont détectées, mettre à jour les données du Cloud Firestore

___

## Installation pour développement

### Cloner le repo

```sh
git clone https://github.com/Mathieu2301/Pronotif.git
```

### Initialisation du serveur

#### Installer les dépendances pour le serveur

```sh
yarn
```

#### Créer un fichier `.env` sur le modèle suivant

```sh
FIREBASE_CREDENTIALS={"type":"service_account", ...}
FIREBASE_DB='https://xxxxxxx.firebaseio.com'

PWD_PRIVATE_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PWD_SALT=XXXXXXXXXXXXXXXX

PORT=3000 # Optionnel
PRODUCTION=false # Optionnel
NOTIFICATIONS=false # Optionnel
```

- La valeur de "pwd_private_key" par une chaine random de **32** caractères
- La valeur de "pwd_salt" par une chaine random de **16** caractères

### Initialisation de l'interface Vue

#### Installer les dépendances pour l'interface

```sh
cd ./vue-app
npm i
```

#### Serve l'interface en hot reload

```sh
npm run serve
```

## Déploiement

### Déploiement du frontend

Le frontend est automatiquement build et déployé sur Firebase Hosting à chaque push sur la branche `master`.

### Déploiement du backend

Le backend est automatiquement build et push sur GHCR à chaque push sur la branche `master`.
Voici un exemple de stack pour déployer le backend:

```yml
version: '3'

services:
  agent:
    image: ghcr.io/mathieu2301/pronotif-agent:latest
    restart: always
    environment:
      FIREBASE_CREDENTIALS: ${FIREBASE_CREDENTIALS}
      FIREBASE_DB: ${FIREBASE_DB}

      PWD_PRIVATE_KEY: ${PWD_PRIVATE_KEY}
      PWD_SALT: ${PWD_SALT}

      PRODUCTION: false
      NOTIFICATIONS: false
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.pronotif.rule=Host(`${SERVER_URL}`)'
      - 'traefik.http.routers.pronotif.entrypoints=https'

networks:
  default:
    name: traefik_web
    external: true
```

___

## Problèmes

Si vous obtenez des erreurs dans la console ou que vous observez un comportement indésirable, merci d'ouvrir une issue [**ici**](https://github.com/Mathieu2301/Pronotif/issues).
