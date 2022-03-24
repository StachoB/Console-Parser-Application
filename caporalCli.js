const fs = require('fs');
const colors = require('colors');
const CruParser = require('./CruParser.js');

const vg = require('vega');
const vegalite = require('vega-lite');

const { writeFileSync } = require('fs')

const cli = require("@caporal/core").default;
const { prototype } = require('events');
const { info } = require('console');

const CH = require('./CH.js');
const EnsCH = require('./EnsCH.js');

const ics = require('ics');

cli //cli = nom de notre programme
    .version('cru-parser-cli')
    .version('1.0')


    // vérifie que les fichiers cru de données sont valides
    .command('check', 'Vérifier si les fichiers de données sont des fichiers cru valides')
    .option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator: cli.BOOLEAN, default: false })
    .option('-t, --showTokenize', 'log the tokenization results', { validator: cli.BOOLEAN, default: false })
    .action(({ args, options, logger }) => {

        const fs = require("fs")
        const path = require("path")

        const getAllFiles = function (dirPath, arrayOfFiles) {
            files = fs.readdirSync(dirPath)

            arrayOfFiles = arrayOfFiles || []

            files.forEach(function (file) {
                if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                    arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
                } else {
                    arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
                }
            })

            return arrayOfFiles
        }

        const file = getAllFiles("./Données/");

        let allOk = true;

        for (let i = 0; i < file.length; i++) {
            filepath = file[i];

            const data = fs.readFileSync(filepath, { encoding: 'utf8'} );

            analyzer = new CruParser();
            analyzer.parse(data);

            if (!(analyzer.errorCount === 0)) {
                logger.info("The .".red + file[i].replace(path.resolve("Données"), "") + " file contains error".red);
                allOk = false;
            }
            
            logger.debug(analyzer.parsedEnsCH);
        }

        if(allOk){
            logger.info("Every files are in the right format.".green);
        }
    })


    //importer un fichier depuis son ordinateur dans les données 
    .command('import', 'Importer un fichier .cru depuis notre ordianteur')
    .action(({ args, options, logger }) => {
        console.log('Afin d importer un fichier .cru depui votre disque local, suivez les instructions suivantes\n1) Tapez dans l\'invite de commande cp <nom du fichier à copier> <nom du dossier dans lequel vous devez le copier> (càd un des sous dossiers de Données');
    })

    // readme
    .command('readme', 'Afficher le fichier README.txt')
    .action(({ args, options, logger }) => {
        fs.readFile("./README.txt", 'utf8', function (err, data) {
            if (err) {
                return logger.warn(err);
            }

            logger.info(data);
        });

    })

    //chercher les créneaux associés à une salle et connaitre sa capacité maximale
    .command('occupation_de_la_salle', 'Permet de savoir quand une salle est occupée et de connaitre sa capacité maximale')
    .alias('os')
    .argument('<salle>', 'Salle dont on veut connaître les créneaux associés')
    .action(({ args, logger }) => {

        //Fonction getAllFiles trouvée sur Internet au lien https://coderrocketfuel.com/article/recursively-list-all-the-files-in-a-directory-using-node-js 
        //Cette fonction va permettre de récupérer l'ensemble des fichiers dans l'ensemble des fichiers et sous fichiers des données
        const fs = require("fs")
        const path = require("path")

        const getAllFiles = function (dirPath, arrayOfFiles) {
            files = fs.readdirSync(dirPath)

            arrayOfFiles = arrayOfFiles || []

            files.forEach(function (file) {
                if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                    arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
                } else {
                    arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
                }
            })

            return arrayOfFiles
        }

        const file = getAllFiles("./Données/");
        //la fonction getAllFiles renvoie un tableau comprenant l'ensemble des chemins vers les fichiers
        //on va donc faire une boucle pour chercher dans chacun des fichiers les infos qui nous intéressent
        var capaMax = 0;
        console.log("Horaires auxquels la salle ".cyan + args.salle.green + " est occupée :".cyan);
        for (let i = 0; i < file.length; i++) {
            
            
            filepath = file[i];

            filepath = file[i];
            const data = fs.readFileSync(filepath, { encoding: 'utf8'} );

            analyzer = new CruParser();
            analyzer.parse(data);

            if (analyzer.errorCount === 0) {
                var s = new RegExp(args.salle); //crée une expression régulière --> pour la reconnaissance d'un modèle dans un texte

                analyzer.parsedEnsCH.forEach(ensCH => {
                    var filtered = ensCH.CHs.filter(p => p.salle.match(s));
                    filtered.forEach(ch => {
                        console.log("Jour = " + ch.ho.jour.green + " " + ch.ho.hBeg.green + ":".green + ch.ho.mBeg.green + " " + ch.ho.hEnd.green + ":".green + ch.ho.mEnd.green);
                       
                        if (parseInt(ch.capa) > capaMax) {
                            capaMax = parseInt(ch.capa);
                        }
                    });

                });
               

            } else {
                logger.info("Le fichier .".red + file[i].replace(path.resolve("Données"), "") + " contient des erreurs il n'est pas comptabilisé dans les résulats".red);
            };

        }

        console.log("La capacité maximale de cette salle est : ".cyan + capaMax);

    })


    //rechercher les créneaux d'un cours
    .command('creneaux_du_cours', 'Permet de connaitre les créneaux associés à un cours')
    .alias('cc')
    .argument('<cours>', 'Cours dont on veut connaitre les créneaux')
    .action(({ args, logger }) => {
        if (args.cours.match(/([A-Z]{2,7}\d{0,2}[A-Z]{0,1}\d{0,1})/)) {

            //Fonction getAllFiles trouvée sur Internet au lien https://coderrocketfuel.com/article/recursively-list-all-the-files-in-a-directory-using-node-js 
            //Cette fonction va permettre de récupérer l'ensemble des fichiers dans l'ensemble des fichiers et sous fichiers des données
            const fs = require("fs")
            const path = require("path")

            const getAllFiles = function (dirPath, arrayOfFiles) {
                files = fs.readdirSync(dirPath)

                arrayOfFiles = arrayOfFiles || []

                files.forEach(function (file) {
                    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
                    } else {
                        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
                    }
                })

                return arrayOfFiles
            }

            const file = getAllFiles("./Données/");
            //la fonction getAllFiles renvoie un tableau comprenant l'ensemble des chemins vers les fichiers
            //on va donc faire une boucle pour chercher dans chacun des fichiers les infos qui nous intéressent
            
            console.log("Créneaux reservés au cours ".cyan + args.cours.green + " :".cyan);
            for (let i = 0; i < file.length; i++) {
            
            filepath = file[i];
            const data = fs.readFileSync(filepath, { encoding: 'utf8'} );
            analyzer = new CruParser();
            analyzer.parse(data);
            if (analyzer.errorCount === 0) {
                var s = new RegExp(args.salle); //crée une expression régulière --> pour la reconnaissance d'un modèle dans un texte

                analyzer.parsedEnsCH.forEach(ensCH => {
                    if (ensCH.cours === args.cours)
                        ensCH.CHs.forEach(ch => {
                            console.log("Jour = " + ch.ho.jour.green + " " + ch.ho.hBeg.green + ":".green + ch.ho.mBeg.green + " " + ch.ho.hEnd.green + ":".green + ch.ho.mEnd.green + "," + ch.indGr.green + ", Salle = " + ch.salle.green);
                            
                        });

                });

            } else {
                logger.info("Le fichier .".red + file[i].replace(path.resolve("Données"), "") + " contient des erreurs il n'est pas comptabilisé dans les résulats".red);
            };

            }

        }
        else {
            logger.info("Le nom de cours rentré n'est pas valide.".red)
        }
    })


    // Afficher les salles disonibles à un certain créneau
    .command('salles_disponibles', 'Affiche l ensemble des salles disponibles au créneau recherché')
    .alias('sd')
    .argument('<jour>', 'Jour du créneau recherché')
    .argument('<hBeg>', 'Heure de début du créneau recherché')
    .argument('<mBeg>', 'Minute de début du créneau recherché')
    .argument('<hEnd>', 'Heure de fin du créneau recherché')
    .argument('<mEnd>', 'Minute de fin du créneau recherché')
    .action(({ args, logger }) => {
        //Ici, on vérifie que les arguments sont donnés au bon format.
        if (args.jour.match(/([A-Z]{1,2})/) && args.jour.length<3 && !(args.jour.match(/([A-Z]{3})/)) && args.hBeg >= 0 && args.hBeg < 24 && args.mBeg >= 0 && args.mBeg < 60 && args.mBeg.length == 2 && args.hEnd >= 0 && args.hEnd < 24 && args.mEnd >= 0 && args.mEnd.length == 2 && args.mEnd < 60) {


            const fs = require("fs")
            const path = require("path")

            const getAllFiles = function (dirPath, arrayOfFiles) {
                files = fs.readdirSync(dirPath)

                arrayOfFiles = arrayOfFiles || []

                files.forEach(function (file) {
                    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
                    } else {
                        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
                    }
                })

                return arrayOfFiles
            }
            var resCH = []; //contient les salles associés aux créneaux recherché --> donc les salles non disponibles
            var allSalle = [];//contient toutes les salles possibles
            var resSalle = [];//contient seulement les salles des crénaux associés --> donc les salles non disponibles 
            const file = getAllFiles("./Données/");
            //la fonction getAllFiles renvoie un tableau comprenant l'ensemble des chemins vers les fichiers
            //on va donc faire une boucle pour chercher dans chacun des fichiers les infos qui nous intéressent
            let x = 0;
            for (let i = 0; i < file.length; i++) {
                
                filepath = file[i];
                const data = fs.readFileSync(filepath, { encoding: 'utf8'} );
                analyzer = new CruParser();
                analyzer.parse(data);

                if (analyzer.errorCount === 0) {
                    var chEntree = new CH("", "", args.jour, args.hBeg, args.mBeg, args.hEnd, args.mEnd, "", "")
                    
                    for (let j = 0; j < analyzer.parsedEnsCH.length; j++) {

                        var filtered = analyzer.parsedEnsCH[j].CHs.filter(p => p.superpositionHoraire(chEntree));
                        analyzer.parsedEnsCH[j].CHs.forEach(ch => allSalle.push(ch.salle));
                        resCH = resCH.concat(filtered);
                    }

                }

                else {
                    logger.info("Le fichier .".red + file[i].replace(path.resolve("Données"), "") + " contient des erreurs il n'est pas comptabilisé dans les résulats".red);
                };

            }

            resCH.forEach(ch => resSalle.push(ch.salle));//on ne garde que les noms de salles indisponibles
            const resSalleSet = new Set(resSalle);//on retire les doublons 
            const allSalleSet = new Set(allSalle);// contient toutes les salles présents dans les fichiers sans doublons

            var resSalleDispo = []; //contient les salles disponibles
            allSalleSet.forEach(el => {
                let isInResSalleSet = false;

                resSalleSet.forEach(el2 => {
                 if (el === el2) {
                    isInResSalleSet = true;//on regarde si la salle est dans la liste des salles indisponibles à cet horaire
                    }
                });
                if (!isInResSalleSet) {
                    resSalleDispo.push(el);
                    }

                });
                console.log("Les salles disponibles d'après les fichiers :".cyan);
                resSalleDispo.forEach(element => {
                    console.log(element.green);
                });

        }
        else {
            logger.info("Un des composant de l'horaire n'est pas acceptable.".red);
        }

    })

    //exporter un emploi du temps au format iCalendar
    //ajouter un nouveau créneau dans notre ical
    .command('iCalendar', 'Exporte un emploi du temps au format iCalendar')
    .alias('iC')
    .argument('<cours>', 'Premier cours à  ajouter au fichier emploi du temps')
    .argument('<jour>', 'Numéro du jour du créneau du cours (ex : si cours prochain --> lundi 6 décembre. Taper 6) ')
    .argument('<hBeg>', 'Heure de début du cours' )
    .argument('<mBeg>', 'Minute de début du cours')
    .argument('<hEnd>', 'Heure de fin du cours' )
    .argument('<mEnd>', 'Minute de fin du cours')
    .action(({args}) => {;
        var error = false;
        if(!args.jour.toString(2).match(/([0-9]{1,2})/)){
            console.log("Le jour n'est pas valide")
            error = true;
        }
        if(args.hBeg>24 || args.hBeg<0){
            console.log("L'heure de début n'est pas valide'")
            error = true;
        }
        if(args.hEnd>24 || args.hEnd<0){
            console.log("L'heure de fin n'est pas valide'")
            error = true;
        }
        if(args.mBeg>59 || args.mBeg<0 || args.mBeg.length != 2 ){
            console.log("L'heure (minutes) de début n'est pas valide'")
            error = true;
        }
        if(args.mEnd>59 || args.mEnd<0 || args.mEnd.length != 2 ){
            console.log("L'heure (minutes) de fin n'est pas valide'")
            error = true;
        }

        if(!error){
            ics.createEvent({
                productId:"gl02_javafriends",
                title: args.cours,
                busyStatus: 'BUSY',
                start: [2021, 12, args.jour, args.hBeg, args.mBeg], //année mois jour heure minutes
                duration: { hours: args.hEnd - args.hBeg, minutes:  args.mEnd - args.mBeg}
                }, (error, value) => {
                    if (error) {
                        console.log(error)
                    }
                    fs.writeFileSync("iCalendar" + Math.floor(Math.random()*1000), value)
                })
        }
    })  

    //réserver une salle précise en donnant son nom 
    .command('reserver_la_salle', 'Réserver une salle en indiquant tous les composants d un créneau')
    .alias('rs')
    .argument('<nom>', 'nom du cours pour lequel on veut réserver un créneau')
    .argument('<type>', 'type du cours pour lequel on veut réserver un créneau')
    .argument('<place>', 'nombre de place du cours pour lequel on veut réserver un créneau')
    .argument('<jour>', 'Jour du créneau à réserver')
    .argument('<hBeg>', 'Heure de début du créneau à réserver')
    .argument('<mBeg>', 'Minute de début du créneau à réserver')
    .argument('<hEnd>', 'Heure de fin du créneau à réserver')
    .argument('<mEnd>', 'Minute de fin du créneau à réserver')
    .argument('<indGr>', 'indice de groupe du cours pour lequel on veut réserver un créneau')
    .argument('<salle>', 'nom de salle dans laquelle on réserve le créneau')
    .action(({ args, logger }) => {
        if (args.nom.match(/([A-Z]{2,7}\d{0,2}[A-Z]{0,1}\d{0,1})/) && 
        args.salle.match(/([A-Z]{1,3}\d{1,3})/) && 
        ["L","MA","ME","J","V","S","D"].includes(args.jour) && 
        args.type.toString(2).match(/([A-Z]{1}\d{1})/) &&
        (args.type.startsWith('T') || args.type.startsWith('D') || args.type.startsWith('C')) &&
        args.place > 0 &&
        args.indGr.toString(2).match(/(\d{1})/) &&
        args.hBeg >= 0 && args.hBeg < 24 && args.mBeg >= 0 && args.mBeg < 60 && args.mBeg.length == 2 &&
        args.hEnd >= 0 && args.hEnd < 24 && args.mEnd >= 0 && args.mEnd < 60 && args.mEnd.length == 2 ) {
            var nm = args.nom;
            var t = args.type;
            var pl = args.place;
            var j = args.jour;
            var hb = args.hBeg;
            var mb = args.mBeg;
            var he = args.hEnd;
            var me = args.mEnd;
            var ig = args.indGr;
            var s = args.salle;

            chAInserer = new CH(t, pl, j, hb, mb, he, me, ig, s);
            //$ node caporalCli.js réserver la salle AP03 1 45 J 18 00 20 00 2 B205

            const fs = require('fs');
            const path = require("path")

            const getAllFiles = function (dirPath, arrayOfFiles) {
                files = fs.readdirSync(dirPath)

                arrayOfFiles = arrayOfFiles || []

                files.forEach(function (file) {
                    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
                    } else {
                        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
                    }
                })

                return arrayOfFiles
            }

            var resCH = [];//contient l'ensemble des créneaux de tous les fichiers sans les cours associés  
            const file = getAllFiles("./Données/");
            //la fonction getAllFiles renvoie un tableau comprenant l'ensemble des chemins vers les fichiers
            //on va donc faire une boucle pour chercher dans chacun des fichiers les infos qui nous intéressent
            let nberr = 0;
            for (let i = 0; i < file.length; i += 1) {

                filepath = file[i];
                const data = fs.readFileSync(filepath, { encoding: 'utf8'} );

                analyzer = new CruParser();
                analyzer.parse(data);

                if (analyzer.errorCount === 0) {
                    for (let j = 0; j < analyzer.parsedEnsCH.length; j += 1) {
                        
                        analyzer.parsedEnsCH[j].CHs.forEach(ch => {
                        resCH.push(ch);
                        });
                    }
                   
                } else {
                    logger.info("Le fichier .".red + file[i].replace(path.resolve("Données"), "") + " contient des erreurs il n'est pas comptabilisé dans les résulats".red);
                }
            }
            resCH.forEach(ch => {
                if (ch.salle === chAInserer.salle && ch.superpositionHoraire(chAInserer)) {
                    nberr = nberr + 1;
                }
            });
            if (nberr === 0) {
                fs.mkdir("./Données/nouveau", function (err) {
                    if (err) {

                    }
                    else {
                        fs.open("./Données/nouveau/edt.cru", 'w', function (err, file) {
                        })
                    }
                })
                let nouveaucreneau = ('+' + nm.toString() + '\n1,' + t.toString() + ',P=' + pl.toString() + ',H=' + j.toString() + ' ' + hb.toString() + ':' + mb.toString() + '-' + he.toString() + ':' + me.toString() + ',F' + ig.toString() + ',S=' + s.toString() + '//\n');
                console.log(nouveaucreneau);
                fs.appendFile('./Données/nouveau/edt.cru', nouveaucreneau, (err) => {
                    if (err) throw err;

                    console.log('Vous avez réservé la salle '.cyan + s + ' au créneau '.cyan + hb + ':'.green + mb + '-'.green + he + ':'.green + me + ". Le créneau a été écrit dans un nouveau fichier.".cyan);
                })
            }
            else {
                logger.info("La salle dans laquelle vous reservez votre créneau est déjà prise à cet horaire.".red)
            }

        }
        else {
            logger.info("Un des composant du créneau n'est pas correct. L'insertion ne peut pas se faire.".red);
        }
        //pour réserver une salle, mettre aussi cours qui demande ??
    })

    //réserver une salle sans donner son nom mais seulement les caractéristiques voulues
    .command('reserver_une_salle_au_creneau', 'Réserver une salle attribuée au hasard (parmis celles correpondant à la demande de l utilisateur) en indiquant le nom du cours, jour, type de cours et l horaire précis voulu')
    .alias('rsc')
    .argument('<nom>', 'nom du cours pour lequel on veut réserver un créneau')
    .argument('<type>', 'type du cours pour lequel on veut réserver un créneau')
    .argument('<place>', 'nombre de place du cours pour lequel on veut réserver un créneau')
    .argument('<jour>', 'Jour du créneau à réserver')
    .argument('<hBeg>', 'Heure de début du créneau à réserver')
    .argument('<mBeg>', 'Minute de début du créneau à réserver')
    .argument('<hEnd>', 'Heure de fin du créneau à réserver')
    .argument('<mEnd>', 'Minute de fin du créneau à réserver')
    .argument('<indGr>', 'indice de groupe du cours pour lequel on veut réserver un créneau')
    .action(({ args, logger }) => {

        if (args.nom.match(/([A-Z]{2,7}\d{0,2}[A-Z]{0,1}\d{0,1})/) && 
        args.salle.match(/([A-Z]{1,3}\d{1,3})/) && 
        ["L","MA","ME","J","V","S","D"].includes(args.jour) && 
        args.type.toString(2).match(/([A-Z]{1}\d{1})/) &&
        (args.type.startsWith('T') || args.type.startsWith('D') || args.type.startsWith('C')) &&
        args.place > 0 &&
        args.indGr.toString(2).match(/(\d{1})/) &&
        args.hBeg >= 0 && args.hBeg < 24 && args.mBeg >= 0 && args.mBeg < 60 && args.mBeg.length == 2 &&
        args.hEnd >= 0 && args.hEnd < 24 && args.mEnd >= 0 && args.mEnd < 60 && args.mEnd.length == 2 ) {
            var nm = args.nom;
            var t = args.type;
            var pl = args.place;
            var j = args.jour;
            var hb = args.hBeg;
            var mb = args.mBeg;
            var he = args.hEnd;
            var me = args.mEnd;
            var ig = args.indGr;
            var s = "";

            chAInserer = new CH(t, pl, j, hb, mb, he, me, ig, s);
            //$ node caporalCli.js réserver la salle AP03 1 45 J 18 00 20 00 2 B205
            
            const fs = require("fs")
            const path = require("path")

            const getAllFiles = function (dirPath, arrayOfFiles) {
                files = fs.readdirSync(dirPath)

                arrayOfFiles = arrayOfFiles || []

                files.forEach(function (file) {
                    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
                    } else {
                        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
                    }
                })

                return arrayOfFiles
            }
            var resCH = []; //contient les salles associés aux créneaux recherché --> donc les salles non disponibles
            var resCHSalleTypeCompatible = []; //contient les créneaux avec des salles ayant le type et la capacité demandée
            var resSalleTypeCompatible = [];
            var allSalle = [];//contient toutes les salles possibles
            var resSalle = [];//contient seulement les salles des crénaux associés --> donc les salles non dispoibles 
            const file = getAllFiles("./Données/");
            //la fonction getAllFiles renvoie un tableau comprenant l'ensemble des chemins vers les fichiers
            //on va donc faire une boucle pour chercher dans chacun des fichiers les infos qui nous intéressent
            let x = 0;
            for (let i = 0; i < file.length; i++) {
                
                filepath = file[i];
                const data = fs.readFileSync(filepath, { encoding: 'utf8'} );
                analyzer = new CruParser();
                analyzer.parse(data);

                if (analyzer.errorCount === 0) {
                    var chEntree = new CH("", "", args.jour, args.hBeg, args.mBeg, args.hEnd, args.mEnd, "", "")
                    
                    for (let j = 0; j < analyzer.parsedEnsCH.length; j++) {

                        var filtered = analyzer.parsedEnsCH[j].CHs.filter(p => p.superpositionHoraire(chAInserer));
                        var filtered2 = analyzer.parsedEnsCH[j].CHs.filter(p => p.type.startsWith(args.type.charAt(0)) && parseInt(p.capa) >= pl);
                        analyzer.parsedEnsCH[j].CHs.forEach(ch => allSalle.push(ch.salle));
                        resCH = resCH.concat(filtered);
                        resCHSalleTypeCompatible = resCHSalleTypeCompatible.concat(filtered2);

                    }

                }

                else {
                    logger.info("Le fichier .".red + file[i].replace(path.resolve("Données"), "") + " contient des erreurs il n'est pas comptabilisé dans les résulats".red);
                };

            }

            resCH.forEach(ch => resSalle.push(ch.salle));//on ne garde que les noms de salles indisponibles
            resCHSalleTypeCompatible.forEach(ch => resSalleTypeCompatible.push(ch.salle));//on ne garde que les noms de salles avec type compatibles
            const resSalleSet = new Set(resSalle);//on retire les doublons 
            const allSalleSet = new Set(allSalle);// contient toutes les salles présents dans les fichiers sans doublons
            const resSalleTypeCompatibleSet = new Set(resSalleTypeCompatible) // contient toutes les salles au type compatible sans doublon
            var resSalleDispo = []; //contient les salles disponibles
            allSalleSet.forEach(el => {
                let isInResSalleSet = false;
                let isInSalleTypeCompatible = false;
                resSalleSet.forEach(el2 => {
                 if (el === el2) {
                    isInResSalleSet = true;//on regare si la salle est dans la liste des salles indisponibles à cet horaire
                    }
                });
                if (!isInResSalleSet) {
                    
                    resSalleTypeCompatibleSet.forEach(el3 => {
                        if (el === el3) {
                            isInSalleTypeCompatible = true;//on regare si la salle est dans la liste des salles au type compatible
                            }
                    });

                    if(isInSalleTypeCompatible){
                        resSalleDispo.push(el);
                    }
                    }

                });
                if(resSalleDispo.length>0){
                    
                    fs.mkdir("./Données/nouveau", function (err) {
                        if (err) {
    
                        }
                        else {
                            fs.open("./Données/nouveau/edt.cru", 'w', function (err, file) {
    
                            })
                        }
                    })
                    let nouveaucreneau = ('+' + nm.toString() + '\n1,' + t.toString() + ',P=' + pl.toString() + ',H=' + j.toString() + ' ' + hb.toString() + ':' + mb.toString() + '-' + he.toString() + ':' + me.toString() + ',F' + ig.toString() + ',S=' + resSalleDispo[0].toString() + '//\n');
                    console.log(nouveaucreneau);
                    fs.appendFile('./Données/nouveau/edt.cru', nouveaucreneau, (err) => {
                        if (err) throw err;
    
                        logger.info('La salle '.cyan + resSalleDispo[0].toString() + ' correspond à votre demande et a été réservée au créneau '.cyan + hb + ':'.green + mb + '-'.green + he + ':'.green + me + ". Le créneau a été écrit dans un nouveau fichier.".cyan);
                    })

                }
                else{
                    console.log("Aucune salle des fichiers correpondant à votre demande ne peut être utilisée à cet horaire".red);
                }

        }
        else {
            logger.info("Un des composant du créneau n'est pas correct. L'insertion ne peut pas se faire.".red);
        }
        //pour réserver une salle, mettre aussi cours qui demande ??

    })

    //vérification de la validité des données
    .command('validite_des_donnees', 'Vérifier que aucun créneau ne se superposent dans la même salle')
    .alias('vd')
    .action(({ logger }) => {
        const fs = require("fs");
        const path = require("path");
        const getAllFiles = function (dirPath, arrayOfFiles) {
            files = fs.readdirSync(dirPath)

            arrayOfFiles = arrayOfFiles || []

            files.forEach(function (file) {
                if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                    arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
                } else {
                    arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
                }
            })

            return arrayOfFiles
        }
        var resCH = [];//contient l'ensemble des créneaux de tous les fichiers sans les cours associés  
        const file = getAllFiles("./Données/");
        //la fonction getAllFiles renvoie un tableau comprenant l'ensemble des chemins vers les fichiers
        //on va donc faire une boucle pour chercher dans chacun des fichiers les infos qui nous intéressent
        let nberr = 0;
        for (let i = 0; i < file.length; i += 1) {

            filepath = file[i];
            const data = fs.readFileSync(filepath, { encoding: 'utf8'} );
            analyzer = new CruParser();
            analyzer.parse(data);

            if (analyzer.errorCount === 0) {
                for (let j = 0; j < analyzer.parsedEnsCH.length; j += 1) {
                    
                    analyzer.parsedEnsCH[j].CHs.forEach(ch => {
                        resCH.push(ch);
                    });


                }
               
            } else {
                logger.info("Le fichier .".red + file[i].replace(path.resolve("Données"), "") + " contient des erreurs il n'est pas comptabilisé dans les résulats".red);
            }

        }
        var resCH2 = resCH.slice();
        resCH.forEach(ch => {
        resCH2.forEach(ch2 => {
            if (!ch.equals(ch2)) {
                 if (ch.salle === ch2.salle && ch.superpositionHoraire(ch2)) {
                    console.log("problème entre les crénaux suivant :".red);
                    nberr = nberr + 1;
                    console.log(ch);
                    console.log(ch2)
                    }
             }
        });
        });
         if (nberr === 0) {
            console.log("Il n'y a aucune erreur dans les crénaux.".cyan);
        }



    })

//visualisation du nombre d'heures de cours dans chaque salle par semaines
.command('visualisation_heures_de_cours', 'retourne une visualisation du nombre d heures de cours par semaine dans chaque salle')
.alias('duree')
.action(({args, options, logger}) => {
    
    const fs = require("fs")
    const path = require("path")
    
    const getAllFiles = function (dirPath, arrayOfFiles) {
        files = fs.readdirSync(dirPath)

        arrayOfFiles = arrayOfFiles || []

        files.forEach(function (file) {
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
            } else {
                arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
            }
        })

        return arrayOfFiles
    }
    
    const file = getAllFiles("./Données/");
    var AllCH = [];
    for (let i = 0; i < file.length; i++) {
        filepath = file[i];

        const data = fs.readFileSync(filepath, { encoding: 'utf8'} );

        analyzer = new CruParser();
        analyzer.parse(data);

        if (analyzer.errorCount === 0) {
            
            analyzer.parsedEnsCH.forEach(el => {
                AllCH = AllCH.concat(el.CHs) 
            });

        } else {
            logger.info("The .".red + file[i].replace(path.resolve("Données"), "") + " file contains error".red);
        }


        logger.debug(analyzer.parsedEnsCH);
    }

    AllCH.forEach(ch => {
        ch.duree = ch.durees();
    });


    var dureeChart = {
        "data" : {
                "values" : AllCH
        },
        "mark" : "bar",
        "encoding" : {
            "x" : {"field" : "salle", "type" : "nominal",
                    "axis" : {"title" : "salles"}
                },
            "y" : { "aggregate":"sum", "field" : "duree", "type" : "quantitative",
                    "axis" : {"title" : "Nombre d'heures de cours dans la salle par semaine"}
                }
        }
    }


    const myChart = vegalite.compile(dureeChart).spec;
    /* Version SVG */
    var runtime = vg.parse(myChart);
	var view = new vg.View(runtime).renderer('svg').run();
	var mySvg = view.toSVG();
	mySvg.then(function(res){
		fs.writeFileSync("./result.svg", res)
		view.finalize();
		logger.info("%s", JSON.stringify(myChart, null, 2));
			logger.info("Chart output : ./result.svg");
	});

    /* Version Canvas */
			/*
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
			var myCanvas = view.toCanvas();
			myCanvas.then(function(res){
				fs.writeFileSync("./result.png", res.toBuffer());
				view.finalize();
				logger.info(myChart);
				logger.info("Chart output : ./result.png");
			})			
			*/
})


//visualisation de la capacité d'acceuil maximale par salle
.command('visualisation_capacite_maximale_par_salle', 'retourne une visualisation des capacités maximales d occupation des salles')
.alias('capacite')
.action(({args, options, logger}) => {
    
    const fs = require("fs")
    const path = require("path")
    
    const getAllFiles = function (dirPath, arrayOfFiles) {
        files = fs.readdirSync(dirPath)

        arrayOfFiles = arrayOfFiles || []

        files.forEach(function (file) {
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
            } else {
                arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
            }
        })

        return arrayOfFiles
    }
    
    const file = getAllFiles("./Données/");
    var AllCH = [];
    for (let i = 0; i < file.length; i++) {
        filepath = file[i];

        const data = fs.readFileSync(filepath, { encoding: 'utf8'} );

        analyzer = new CruParser();
        analyzer.parse(data);

        if (analyzer.errorCount === 0) {
            
            analyzer.parsedEnsCH.forEach(el => {
                AllCH = AllCH.concat(el.CHs) 
            });

        } else {
            logger.info("The .".red + file[i].replace(path.resolve("Données"), "") + " file contains error".red);
        }


        logger.debug(analyzer.parsedEnsCH);
    }


    var capaChart = {
        "data" : {
                "values" : AllCH
        },
        "mark" : "bar",
        "encoding" : {
            "x" : {"field" : "salle", "type" : "nominal",
                    "axis" : {"title" : "salles"}
                },
            "y" : { "aggregate":"max", "field" : "capa", "type" : "quantitative",
                    "axis" : {"title" : "Capacité maximale d'acceuil"}
                }
        }
    }


    const myChart = vegalite.compile(capaChart).spec;
    /* Version SVG */
    var runtime = vg.parse(myChart);
	var view = new vg.View(runtime).renderer('svg').run();
	var mySvg = view.toSVG();
	mySvg.then(function(res){
		fs.writeFileSync("./result.svg", res)
		view.finalize();
		logger.info("%s", JSON.stringify(myChart, null, 2));
			logger.info("Chart output : ./result.svg");
	});

    /* Version Canvas */
			/*
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
			var myCanvas = view.toCanvas();
			myCanvas.then(function(res){
				fs.writeFileSync("./result.png", res.toBuffer());
				view.finalize();
				logger.info(myChart);
				logger.info("Chart output : ./result.png");
			})			
			*/
})



cli.run(process.argv.slice(2));