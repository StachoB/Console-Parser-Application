const CH = require('../CH');
var Horaire = require('../Horaire.js');

describe("Tests sur CH", function(){
	
	beforeAll(function() {
		this.CHTest = new CH("AP03", 16, "L", 9, 0, 11, 0, 1, "B101");	
    });
	
	it("Créer un CH", function(){
		expect(this.CHTest).toBeDefined;
		expect(this.CHTest.type).toBe("AP03");
		expect(this.CHTest.capa).toBe(16);
		expect(this.CHTest.ho).toEqual(new Horaire("L", 9, 0, 11, 0));
		expect(this.CHTest.indGr).toBe(1);
		expect(this.CHTest.salle).toBe("B101");
	});

	it("Tester la supperposition", function(){
		this.CHSupperpose = new CH("AP03", 16, "L", 10, 15, 12, 15, 2, "B101");
		this.CHNonSupperpose =  new CH("AP03", 16, "Ma", 9, 0, 11, 0, 1, "B101");
		expect(this.CHTest.superpositionHoraire(this.CHSupperpose)).toBe(true);
		expect(this.CHTest.superpositionHoraire(this.CHNonSupperpose)).toBe(false);
	});
});