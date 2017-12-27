const box = require('./index');

const params = {
    boltX: 70,
    boltY: 50,
    depth: 25,
    wallThickness: 2,
    bottomThickness: 2,
    bodyHoleRadius: 1.5,
    holeThroughBottom: true,
    lidThickness: 2,
    lidHoleRadius: 2,
    lidInsetThickness: 1,
    lidInsetClearance: .25,
    maxArcFacet: .25
};

const test = box(params);

console.log(test);
