var Horaire = require('./Horaire.js');

var CH = function(type, capa, jour, hBeg, mBeg, hEnd, mEnd, indGr, salle){
    this.type = type;//type de cours
    this.capa = capa;// capacite du cours 
    this.ho = new Horaire(jour, hBeg, mBeg, hEnd, mEnd)
    this.indGr = indGr;//index de groupe
    this.salle = salle;//salle

}

CH.prototype.cours = function(){
    return this.type;
};

CH.prototype.creerCreneau = function(cours, type, capa, horaire, index, salle){

};

CH.prototype.testCreneau = function(CH, creerCreneau){
    
};

CH.prototype.durees=function(){
var duree=parseInt(this.ho.hEnd)-parseInt(this.ho.hBeg)+((parseInt(this.ho.mEnd)-parseInt(this.ho.mBeg))/60);
return duree;
};

CH.prototype.equals= function(ch2){
    if(this.salle === ch2.salle && this.type===ch2.type && this.indGr===ch2.indGr && this.capa===ch2.capa && this.ho.jour===ch2.ho.jour && this.ho.hBeg===ch2.ho.hBeg && this.ho.mBeg===ch2.ho.mBeg && this.ho.mEnd===ch2.ho.mEnd && this.ho.hEnd===ch2.ho.hEnd)
    {
        return true;
    }
    else{
        return false;
    }

};

CH.prototype.superpositionHoraire= function(ch2){
    if(this.ho.jour === ch2.ho.jour){
        var minBeg = parseInt(this.ho.hBeg)*60 + parseInt(this.ho.mBeg);
        var minEnd = parseInt(this.ho.hEnd)*60 + parseInt(this.ho.mEnd);
        var minBeg2 = parseInt(ch2.ho.hBeg)*60 + parseInt(ch2.ho.mBeg);
        var minEnd2 = parseInt(ch2.ho.hEnd)*60 + parseInt(ch2.ho.mEnd);
        if(minBeg === minBeg2 && minEnd === minEnd2){
            return true;
        }
        else{
            if(minBeg2 >= minBeg){
                if(minBeg2<minEnd ){
                    return true;
                }
                else{
                    return false;
                }
            }
            else{
                if(minEnd2>minBeg)
                {
                    return true;
                }
                else{
                    return false;
                }
                
            }
        }
    }
    else{
        return false;
    }

};

module.exports = CH;