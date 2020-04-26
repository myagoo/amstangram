import { MAX_CLAPS_COUNT } from "../constants"

export default {
  Language: "Langage",
  en: "Anglais",
  fr: "Francais",
  Theme: "Thème",
  "Logged in as {username}": "Connecté en tant que {username}",
  Settings: "Réglages",
  Difficulty: "Difficulté",
  Easy: "Facile",
  Hard: "Difficile",
  "Clear storage": "Effacer le stockage",
  "You are about to reset your settings and tips. Are you sure you want to proceed ?":
    "Tu es sur le point de réinitialiser tes réglages et astuces. Es-tu sûr.e de vouloir continuer ?",

  "Tangram approved": "Tangram approuvé",
  "You can't save an invalid tangram": "Tangram invalide",
  "You can't save such an easy tangram": "Tangram trop facile",
  "This tangram already exists": "Ce tangram existe déjà",
  "Tangram submitted for review": "Tangram soumis pour vérification",

  "Logged out": "Déconnecté.e",

  "Tangram gallery": "Galerie des tangrams",
  "Pending approbation": "En attente d'approbation",
  "{username}'s tangrams": "Tangrams de {username}",
  "Play now !": "Commencer à jouer !",
  "Start 1 tangram !": "Lancer 1 tangram",
  "Start {count} tangrams !": "Lancer {count} tangrams",
  "Password is too weak": "Mot de passe trop faible",
  "Email address already in use": "Adresse email déjà prise",
  "Invalid email address": "Adresse email invalide",
  "Email address": "Adresse Email",
  "Email address is required": "Adresse email requise",
  Username: "Nom d'utilisateur",
  "Username is required": "Nom d'utilisateur requis",
  Password: "Mot de passe",
  "Password is required": "Mot de passe requis",
  "Confirm password": "Confirmer le mot de passe",
  "Passwords must match": "Les mots de passe doivent correspondre",
  "Sign me up !": "Je créé mon compte !",
  "I already have an account": "J'ai déjà un compte",
  "Unknown email address": "Adresse email inconnu",
  "Incorrect password": "Mot de passe incorrect",
  "Sign me in !": "Je me connecte !",
  "I don't have an account": "Je n'ai pas de compte",
  "Create your account": "Créer un compte",
  "Connect to your account": "Se connecter",
  "Submit your tangram": "Envoyer votre tangram",
  "Edit your tangram": "Éditer votre tangram",
  Category: "Catégorie",
  Path: "Chemin",
  "Invalid path": "Chemin invalide",
  "Victory emoji": "Emoji de succès",
  "Leave empty for random emoji": "Laisser vide pour un emoji au hasard",

  Order: "Ordre",
  "Submit !": "Envoyer !",
  "Edit !": "Éditer !",
  "Or delete tangram": "Ou supprimer le tangram",

  animals: "Animaux",
  geometric: "Géométrique",
  digits: "Chiffres",
  letters: "Alphabet",
  people: "Personnes",
  stuff: "Trucs",

  "Joined {signupDate}": "Inscrit le {signupDate}",
  "Log out": "Se déconnecter",
  "Are you sure you want to log out?":
    "Es-tu sûr.e de vouloir te déconnecter ?",

  "Change email address": "Modifier l'adresse email",
  "Change username": "Modifier le nom d'utilisateur",
  "Change password": "Modifier le mot de passe",
  Back: "Retour",
  "Confirm new password": "Confirmer le nouveau mot de passe",
  "New password": "Nouveau mot de passe",
  "Current password": "Mot de passe actuel",
  "Password changed sucessfuly": "Mot de passe changé avec succés",
  "New username": "Nouveau nom d'utilisateur",
  "Username updated sucessfuly": "Nom d'utilisateur changé avec succés",
  "Email address updated sucessfuly": "Adresse email changé avec succés",
  "New email address": "Nouvelle adresse email",
  "An error occured, please retry later":
    "Une erreur est survenue, veuillez réessayer plus tard",
  Sounds: "Sons",
  "Are you sure you want to delete this tangram ?":
    "Es-tu sûr.e de vouloir supprimer ce tangram ?",
  "Tangram deleted sucessfuly": "Tangram supprimé avec succés",
  "Challenge link copied to clipboard":
    "Lien de défi copié dans le presse papier",
  "{username} challenged you": "{username} te met au défi",
  "Rise to the challenge": "Relevez le défi",
  "Let's go !": "C'est parti !",

  Leaderboard: "Classement",
  "Completed {completed}/{total} tangrams":
    "{completed}/{total} tangrams complétés",
  "Created {created} tangrams": "{created} tangrams créés",
  "Earned {claps} 👏": "{claps} 👏 gagnés",
  Claps: "Claps",
  "Completed tangrams": "Tangrams complétés",
  "Created tangrams": "Tangrams créés",

  "Claps only count when logged in":
    "Les claps ne comptent que si tu es identifié.e",

  "Random tip": "Astuce",
  "Got it!": "J'ai compris !",
  "tips.menu":
    "Tu peux accéder à la galerie des tangrams {galleryIcon}, aux réglages {settingsIcon} et plus encore en appuyant sur {menuIcon}",
  "tips.account":
    "Tu peux créer ton compte utilisateur en appuyant sur {accountIcon} dans le menu {menuIcon}",
  "tips.gallery":
    "Tu peux créer ta propre playlist en sélectionnant les tangrams dans la galerie {galleryIcon}",
  "tips.share":
    "Tu peux partager ta playlist avec tes amis en appuyant sur {shareIcon} dans la galerie {galleryIcon}",
  "tips.create":
    "Tu peux créer tes propres tangrams en appuyant sur {createIcon} dans le menu {menuIcon}",
  "tips.claps": `T'as aimé ce tangram ? Envoies des claps à son créateur en appuyant sur 👏 (jusqu'à ${MAX_CLAPS_COUNT} fois).`,
  "tips.difficulty":
    "Trop facile pour toi ? Tu peux changer la difficulté en appuyant sur {settingsIcon} dans le menu {menuIcon}",
  "tips.theme":
    "Envie de passer du côté obscur ? Tu peux activer le mode sombre en appuyant sur {settingsIcon} dans le menu {menuIcon}",
  "tips.sound":
    "Trop de bruits ? Tu peux désactiver les sons en appuyant sur {settingsIcon} dans le menu {menuIcon}",
  "tips.card":
    "Tu peux accéder aux détails d'un tangram ou même éditer les tiens en faisant un appuie long sur une carte dans la galerie {galleryIcon}",
  "tips.leaderboard":
    "Jette un oeil au classement pour savoir qui est le meilleur en appuyant sur {leaderboardIcon} dans le menu {menuIcon}",
}
