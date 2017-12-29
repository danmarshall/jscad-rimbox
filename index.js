var makerjs = require('makerjs');
var rimbox = require('makerjs-rimbox');
var { CAG, CSG } = require('@jscad/csg');

function main(params) {
    var side = new rimbox(params.boltX, params.boltY, params.bodyHoleRadius, params.wallThickness);
    var bottom = new rimbox(params.boltX, params.boltY, params.bodyHoleRadius, params.wallThickness, true);
    var lid = new rimbox(params.boltX, params.boltY, params.bodyHoleRadius, params.wallThickness);
    var lidInset = makerjs.model.outline(lid.models.inner, params.lidInsetClearance, 0, true);
    var lidBolts = new makerjs.models.BoltRectangle(params.boltX, params.boltY, params.lidHoleRadius);

    delete lid.models.inner;
    delete lid.models.bolts;

    if (!params.holeThroughBottom) {
        delete bottom.models.bolts;
    }

    var m = makerjs.measure.modelExtents(side);
    lid.origin = lidInset.origin = lidBolts.origin = [m.high[0] - m.low[0] + params.lidHoleRadius, 0];

    var all = {
        models: {
            side,
            bottom,
            lid,
            lidBolts,
            lidInset
        }
    };

    makerjs.model.center(all);
    makerjs.model.originate(all);

    function extrude(model, depth, z) {
        return makerjs.exporter.toJscadCSG(CAG, model, { extrude: depth, maxArcFacet: params.maxArcFacet, z });
    }

    var side3D = extrude(side, params.depth);
    var bottom3D = extrude(bottom, params.bottomThickness);
    var lid3D = extrude(lid, params.lidThickness);

    if (params.lidInsetThickness > 0) {
        var lidInset3D = extrude(lidInset, params.lidInsetThickness, params.lidThickness);
        lid3D = lid3D.union(lidInset3D);
    }

    var lidBolts3D = extrude(lidBolts, params.lidThickness + params.lidInsetThickness);
    lid3D = lid3D.subtract(lidBolts3D);

    return bottom3D.union(side3D).union(lid3D);
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
