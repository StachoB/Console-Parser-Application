var CH = require('./CH');
var EnsCH = require('./EnsCH');
// CruParser
	
var CruParser = function(sTokenize, sParsedSymb){
	//La liste des CH parsed depuis les fichiers input
	this.parsedEnsCH = [];//ensemble des cours avec leurs créneaux associé, ensemble d'objets de la classe EnsCH
	this.symb = ["+", "1", ",", "P", "H", " ", ":", "-", ":", "F", "S", "//", "sec"]; 
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

// tokenize : tranform the data input into a list
// <eol> = CRLF
CruParser.prototype.tokenize = function(data){
	var separator = /(\r\n|,|\s|\/|\=|:|-)/ ; // pour comprendre la syntaxe de la regex, aller sur https://www.lucaswillems.com/fr/articles/25/tutoriel-pour-maitriser-les-expressions-regulieres
	data = data.split(separator);
	data = data.filter((val, idx) => !val.match(separator)); 
	while (data[0].startsWith('+U') || !(data[0].startsWith('+')))//tant que la première case du tableau data ne commence pas par un plus ou commence par +U 
	{
		data.shift();//on retire la première case de data 
	}
	return data;
}

// parse : analyze data by calling the first non terminal rule of the grammar
CruParser.prototype.parse = function(data){
	var tData = this.tokenize(data);
	if(this.showTokenize){
		console.log(tData);
	}
	this.listEnsCH(tData);
}

// erreur de parsing
CruParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	console.log("Erreur de parsing ! sur " + input + " --msg : " + msg);
}

// Règles de parsing

// <liste_ch> = *(<ch>) "sec" ou "page"
CruParser.prototype.listEnsCH = function(input){
	this.EnsCH(input);
	this.expect("", input);//on est en fin de page on a un saut de ligne dans le fichier donc ici une case sans caractère
}


// <ch> = <cours> "1," <> "//"
CruParser.prototype.EnsCH = function(input){
	var curS = this.next(input);
	if(curS.startsWith('+'))
	{
		var cours = this.cours(curS);
		parsedCH = [];
		while (!(input[0].startsWith('+')) && input[0]!='')
		{ //tant que on a pas de nouveau cours (donc de chaine de caractere qui commence par +) on continue de lire les créneaux
		if(this.check("1", input)){
			this.expect("1", input);//on vérifie que il y a bien un 1, donc que c'est un crénaux (en utilisant expect on retire le 1 de input en même temps que l'on vérifie)
			var args = this.body(input);
			var ch = new CH(args.type, args.place, args.jour, args.hBeg, args.mBeg, args.hEnd, args.mEnd, args.indGr, args.salle);
			parsedCH.push(ch);
			this.next(input);
			this.next(input);
		}else{
			return false;
		}
		}
		var ensch = new EnsCH(cours, parsedCH);
		this.parsedEnsCH.push(ensch);

		if(input.length > 0 && input[0]!=''){
			this.EnsCH(input);
		}
		else{

			return true;
		}
	}
	else{
		return false;
	}

}


// <body> = 
CruParser.prototype.body = function(input){
	var type = this.type(input);
	var place = this.place(input);
	var jour = this.jour(input);
	var hBeg = this.hBeg(input);
	var mBeg = this.mBeg(input);
	var hEnd = this.hEnd(input);
	var mEnd = this.mEnd(input);
	var indGr = this.indGr(input);
	var salle = this.salle(input);
	return { type: type, place: place, jour : jour, hBeg : hBeg, mBeg : mBeg, hEnd : hEnd, mEnd : mEnd, indGr : indGr, salle : salle };
}

// accept : verify if the arg s is part of the language symbols.
CruParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbol "+s+" unknown", [" "]);
		return false;
	}

	return idx;
}


// check : check whether the arg elt is on the head of the list
CruParser.prototype.check = function(s, input){
	if(this.accept(input[0]) == this.accept(s)){
		return true;	
	}
	return false;
}

// expect : expect the next symbol to be s.
CruParser.prototype.expect = function(s, input){
	if(s == this.next(input)){
		return true;
	}else{
		this.errMsg("symbol "+s+" doesn't match", input);
	}
	return false;
}

CruParser.prototype.next = function(input){
	var curS = input.shift();
	if(this.showParsedSymbols){
		console.log(curS);
	}
	return curS
}

// <cours> = <nom> 1*<creneau> 
CruParser.prototype.cours = function(input){//on regarde si le com de cours est bien constitué de deux lettres suivis de deux chiffres ou de deux lettres ou de trois lettres
	
	if(matched = input.match(/([A-Z]{2,7}\d{0,2}[A-Z]{0,1}\d{0,1})/)){
		return matched[0];
	}
	else{
		this.errMsg("Nom de cours invalide", input);
	}
}


// <type> = ("C"/"D"/"T")%x31-34
CruParser.prototype.type = function(input){//verifie que le type du cours est bien de la forme "une lettre + un chiffre" et renvoie sa valeur + avance dans le tableau
	var curS = this.next(input);
	if(matched = curS.match(/([A-Z]{1}\d{1})/)){
		return matched[0];
	}else{
		this.errMsg("Type de cours invalide", curS);
	}
}

// <places> = "P" %x3D 2DIGIT
// %x3D --> EGAL (=)
CruParser.prototype.place = function(input){//vérifie que le nombre de places est bien une suite de chiffres
	this.expect("P",input);
	var curS = this.next(input);
	if(matched = curS.match(/([0-9]*)/)){
		return matched[0];
	}else{
		this.errMsg("Nombre de places invalide", input);
	}
}

// <jour> = ("L"/"MA"/"ME"/"J"/"V"/"S")%x20
// %x20 --> SPACE ( )
CruParser.prototype.jour = function(input){
	this.expect("H", input)
	var curS = this.next(input);
	if(matched = curS.match(/([A-Z]{1,2})/)){ //vérifie que le jour est sous la forme d'une ou de deux lettres majuscules
		return matched[0];
	} else {
		this.errorMsg("Jour invalide", input);
	}
}

// <heure> = 1*2DIGIT %x3A 2DIGIT %x2D 1*2DIGIT %x3A 2DIGIT
CruParser.prototype.hBeg = function(input){
	var curS = this.next(input);
	if(matched = curS.match(/([0-9]{1,2})/)){ //vérifie que l'heure est sous la forme d'un ou de deux chiffres
		return matched[0];
	} else {
		this.errMsg("Format d'heure invalide", input);
	}
}

CruParser.prototype.mBeg = function(input){
	var curS = this.next(input);
	if(matched = curS.match(/([0-9]{1,2})/)){ //vérifie que les minutes sont sous la forme de deux chiffres
		return matched[0];
	} else {
		this.errMsg("Format d'heure invalide", input);
	}
}
CruParser.prototype.hEnd = function(input){
	var curS = this.next(input);
	if(matched = curS.match(/([0-9]{1,2})/)){ //vérifie que l'heure est sous la forme d'un ou de deux chiffres
		return matched[0];
	} else {
		this.errMsg("Format d'heure invalide", input);
	}
}
CruParser.prototype.mEnd = function(input){
	var curS = this.next(input);
	if(matched = curS.match(/([0-9]{1,2})/)){ //vérifie que les minutes sont sous la forme de deux chiffres
		return matched[0];
	} else {
		this.errMsg("Format d'heure invalide", input);
	}
}

// <groupe> = 1ALPHA 1DIGIT
CruParser.prototype.indGr = function(input){
	var curS = this.next(input);
	if(matched = curS.match(/([A-Z]{1,2}\d{0,1})/)){ //vérifie que l'index du groupe est bien sous le format d'une lettre majuscule et d'un chiffre
		return matched[0];							 //rajouté que possible d'être deux lettres FA et FB
	}else{
		this.errMsg("Index de groupe invalide", curS);
	}
}

// <salle> = "S" %x3D (1ALPHA 3DIGIT)/(%s"EXT" 1DIGIT)
CruParser.prototype.salle = function(input){
	this.expect("S",input);
	if(input[0] === ''){
		return '-';//je mets ce caractère pour quand la salle est vide
	}else{
	var curS = this.next(input);
	if(matched = curS.match(/([A-Z]{1,3}\d{1,3})/)){ //vérifie que la salle est sous le format d'une lettre majuscule et d'une suite de trois chiffres
		return matched[0];
	}else{
		this.errMsg("Nom de salle invalide", input);
	}
	}
}

module.exports = CruParser;
