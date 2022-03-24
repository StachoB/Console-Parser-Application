# README

## Description : 
    <cours> = <nom> 1*<creneau>
    <nom> = %x2B 2ALPHA 2DIGIT <CR>
    <creneau> = %x61 "," <type> "," <places> "," <horaire> "," <groupe> "," <salle> %x2F.2F <CR>
    <type> = ("C"/"D"/"T")%x31-34
    <places> = "P" %x3D 2DIGIT
    <horaire> = "H" %x3D <jour> " " <heure>
    <jour> = ("L"/"MA"/"ME"/"J"/"V"/"S")%x20
    <heure> = 1*2DIGIT %x3A 2DIGIT %x2D 1*2DIGIT %x3A 2DIGIT
    <groupe> = 1ALPHA 1DIGIT
    <salle> = "S" %x3D (1ALPHA 3DIGIT)/(%s"EXT" 1DIGIT)


## Installation
    $ npm install

## Utilisation :
    $ node caporalCli.js <commande> <arguments>
    Tous les fichiers .cru a utiliser en tant que source de données doivent être placés dans le dossier ./Données

## Liste des commandes : 

### check
    Permet de vérifier si les fichiers de données sont des fichiers cru valides

### readme
    Afficher le fichier README.txt

### occupation_de_la_salle <salle>
    Permet de savoir quand une salle est occupée et de connaitre sa capacité maximale
    alias : os
    argument : 
        salle : nom de la salle dont on veut connaitre les créneaux associés (une suite de lettres et de chiffres)

### creneaux_du_cours <cours>
    Permet de connaitre les créneaux associés à un cours
    alias : cc
    argument :
        cours : nom du cours dont on veut connaitre les créneaux (une suite de lettres et de chiffres)

### salles_disponibles <jour> <hBeg> <mBeg> <hEnd> <mEnd>
    Affiche l'ensemble des salles disponibles au créneau horaire recherché
    alias : sd
    arguments :
    jour = jour du créneau recherché (une à deux lettres)
    hBeg = heure de début du créneau recherché (un entier)
    mBeg = minute de début du créneau recherché (un entier)
    hEnd = heure de fin du créneau recherché (un entier)
    mEnd = minute de fin du créneau recherché (un entier)

### reserver_la_salle <nom> <type> <place> <jour> <hBeg> <mBeg> <hEnd> <mEnd> <indGr> <salle>
    Réserver une salle spécifique en indiquant tous les composants d'un créneau
    alias : rs
    arguments :
    nom = nom du cours pour lequel on veut réserver un créneau (une suite de lettres et de chiffres)
    type = type du cours pour lequel on veut réserver un créneau (une lettre suivis d'un entier)
    place = nombre de place du cours pour lequel on veut réserver un créneau (un entier)
    jour = jour du créneau à réserver (format 2 alphaNums)
    hBeg = heure de début du créneau à réserver (un entier)
    mBeg = minute de début du créneau à réserver (un entier)
    hEnd = heure de fin du créneau à réserver (un entier)
    mEnd = minute de fin du créneau à réserver (un entier)
    indGr = indice de groupe du cours pour lequel on veut réserver un créneau (un entier)
    salle = nom de salle dans laquelle on réserve le créneau (une suite de lettres et de chiffres)

### reserver_une_salle_au_creneau <nom> <type> <place> <jour> <hBeg> <mBeg> <hEnd> <mEnd> <indGr> 
    Réserver une salle attribuée au hasard (parmis celles correpondant à la demande de l utilisateur) en indiquant le nom du cours, jour, type de cours et l horaire précis voulu
    alias : rsc
    arguments :
    nom = nom du cours pour lequel on veut réserver un créneau (une suite de lettres et de chiffres)
    type = type du cours pour lequel on veut réserver un créneau (une lettre suivis d'un entier)
    place = nombre de place du cours pour lequel on veut réserver un créneau (un entier)
    jour = jour du créneau à réserver (format 2 alphaNums)
    hBeg = heure de début du créneau à réserver (un entier)
    mBeg = minute de début du créneau à réserver (un entier)
    hEnd = heure de fin du créneau à réserver (un entier)
    mEnd = minute de fin du créneau à réserver (un entier)
    indGr = indice de groupe du cours pour lequel on veut réserver un créneau (un entier)

### validite des donnees
    Vérifie que aucun créneau ne se superposent dans la même salle dans les fichiers de données
    alias : vd

### iCalendar <cours> <jour> <hBeg> <mBeg> <hEnd> <mEnd>
    Exporte un emploi du temps au format iCalendar
    alias : iC
    arguments :
    cours = nom du cours pour lequel on veut génerer un fichier iCalendar (une suite de lettres et de chiffres)
    jour = numéro du jour du créneau du cours (ex : si cours prochain --> lundi 6 décembre. Taper 6) (un entier)
    hBeg = heure du début du créneau (un entier)
    mBeg = minute de début du créneau (un entier)
    hEnd = heure de fin du créneau (un entier)
    mEnd = minute de fin du créneau (un entier)

### visualisation_heures_de_cours
    retourne une visualisation du nombre d heures de cours par semaine dans chaque salle
    alias : duree

### visualisation_capacite_maximale_par_salle
    retourne une visualisation des capacités maximales d occupation des salles
    alias : capacite

## Options
    -h or --help 	:	 display the program help
    -t or --showTokenize :	 display the tokenization result 
    -s or --showSymbols :	 display each step of the analysis

## Version 

# 1.0

    - Création de l'outil
    - Création du parser CruParser permettant de parser les fichier .cru afin de récupérer les créneaux de cours de ces fichiers
    - Création des types d'objets CH et EnsCH qui permettent de stocker des créneaux horaires et ensembles de créneaux horaires

# 2.0

    - Utilisation du framework Caporal.js
    - Création du fichier caporalCli.js afin de créer des commandes
    - Ajout des commandes : check, readme, occupation de la salle, créneau du cours, salles disponibles, validité des données

# 3.0

    - Ajout de la visualisation et export vega-lite
    -  Ajout des commandes : réserver la salle, réserver une salle au créneau, iCalendar1-->7, visualisation heures de cours, visualisation capacité maximale par salle

# 4.0
    Corrections de bugs :
        bug dans la génération du iCalendar
        bug dans la réservation d'une salle
    Améliorations :
        utf8 fixé
        nom des fonctions normalisés, alias crées
        respect strict de la grammaire ABNF
        amélioration de l'affichage
        ajout de tests unitaires
    Autre :
        utilisation de https://gitmoji.dev/ pour les commits

### Liste des contributeur.rice.s
    - Barbara Stachowicz (barbara.stachowicz@utt.fr)
    - Pauline Bosvin (pauline.bosvin@utt.fr)
    - Majed Hlaihel (majed.hlaihel@utt.fr)

    - Thibaud Macret (thibaud.macret@utt.fr)
    - Ethienne Lanternier (ethienne.lanternier@utt.fr

