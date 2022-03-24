var Horaire = require('../Horaire.js');

describe("Tests sur horaire", function(){
	
	beforeAll(function() {
		this.horaireTest = new Horaire("L", 9, 0, 11, 0);	
    });
	
	it("Créer un horraire", function(){
		expect(this.horaireTest).toBeDefined;
		expect(this.horaireTest.jour).toBe("L");
		expect(this.horaireTest.hBeg).toBe(9);
		expect(this.horaireTest.mBeg).toBe(0);
		expect(this.horaireTest.hEnd).toBe(11);
		expect(this.horaireTest.mEnd).toBe(0);
	});
});