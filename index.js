var makerjs = require('makerjs');
var rimbox = require('makerjs-rimbox');
var { CAG, CSG } = require('@jscad/csg');

function main(params) {
    var lidDiff = params.lidHoleRadius - params.bodyHoleRadius;

    var side = new rimbox(params.boltX, params.boltY, params.bodyHoleRadius, params.wallThickness);
    var bottom = new rimbox(params.boltX, params.boltY, params.bodyHoleRadius, params.wallThickness, true);
    var lid = new rimbox(params.boltX, params.boltY, params.lidHoleRadius, params.wallThickness - lidDiff);
    var lidInset = makerjs.model.outline(lid.models.inner, params.lidInsetClearance, 0, true);

    delete lid.models.inner;

    if (!params.holeThroughBottom) {
        delete bottom.models.bolts;
    }

    var m = makerjs.measure.modelExtents(side);
    lid.origin = [m.high[0] + params.lidHoleRadius, 0];
    lidInset.origin = lid.origin;

    var side3D = makerjs.exporter.toJscadCSG(CAG, side, { extrude: params.depth, maxArcFacet: params.maxArcFacet });
    var bottom3D = makerjs.exporter.toJscadCSG(CAG, bottom, { extrude: params.bottomThickness, maxArcFacet: params.maxArcFacet });
    var lid3D = makerjs.exporter.toJscadCSG(CAG, lid, { extrude: params.lidThickness, maxArcFacet: params.maxArcFacet });
    var lidInset3D = makerjs.exporter.toJscadCSG(CAG, lidInset, { extrude: params.lidInsetThickness, z: params.lidThickness, maxArcFacet: params.maxArcFacet });

    return bottom3D.union(side3D).union(lid3D).union(lidInset3D);
}

function getParameterDefinitions() {
    return [
        { name: 'boltX', caption: 'bolt distance (X)', type: 'float', initial: 70 },
        { name: 'boltY', caption: 'bolt distance (Y)', type: 'float', initial: 50 },
        { name: 'depth', caption: 'depth (Z)', type: 'float', initial: 25 },
        { name: 'wallThickness', caption: 'wall thickness', type: 'float', initial: 2 },
        { name: 'bottomThickness', caption: 'bottom thickness', type: 'int', initial: 2 },
        { name: 'bodyHoleRadius', caption: 'hole radius in body', type: 'float', initial: 1.5 },
        { name: 'holeThroughBottom', caption: 'holes go through bottom', type: 'checkbox', checked: true },
        { name: 'lidThickness', caption: 'lid thickness', type: 'float', initial: 2 },
        { name: 'lidHoleRadius', caption: 'hole radius in lid', type: 'float', initial: 2 },
        { name: 'lidInsetThickness', caption: 'lid inset thickness', type: 'float', initial: 1 },
        { name: 'lidInsetClearance', caption: 'lid inset clearance', type: 'float', initial: .25 },
        { name: 'maxArcFacet', caption: 'max arc facet size', type: 'float', initial: .25 }
    ];
}

module.exports = main;
module.exports.getParameterDefinitions = getParameterDefinitions;
