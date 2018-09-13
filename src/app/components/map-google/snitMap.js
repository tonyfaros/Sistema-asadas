
import "./ol.js";


map = new ol.Map({
    //layers: [baselayersGroup, capasSobrepuestas, capasFichas, capaFichasCluster, capasRadios,capasRadiosN2,capasCuencas,capasResultados,capasResultadosN2,capasPines,capasPuntoNavegacion],
    layers: layersusing,

    controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
        })
    }).extend(controles),

    pixelRatio: tilePixelRatio,
    interactions: ol.interaction.defaults({
        altShiftDragRotate: false,
        dragPan: false,
        DragZoom: true,
        rotate: false
    }).extend([new ol.interaction.DragPan({kinetic: null})]),
    target: olMapDiv,
    view: view
});
