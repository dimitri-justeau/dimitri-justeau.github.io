var s;

window.lazyLoadCesium = function() {
    if (!s) {
        s = document.createElement("script");
        s.type = "text/javascript";
        s.src = '../' + cs;
        console.log('loading Cesium...');
        document.body.appendChild(s);
    }
    return s;
};

var tile_layer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        attributions: [new ol.Attribution({
            html: '© <a href="http://cartodb.com/attributions">CartoDB</a> ' + '© <a href="http://www.openstreetmap.org/copyright">' + 'OpenStreetMap contributors</a>'
        })],
        url:'https://cartocdn_{a-d}.global.ssl.fastly.net/base-antique/{z}/{x}/{y}.png'
    })
});

var projects_style = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: 'img/map-marker.svg'
    })
});

var hover = new ol.interaction.Select({
    condition: ol.events.condition.pointerMove,
    style: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: 'img/map-marker-hover.svg'
        })
    }) 
});

var projects_layer = new ol.layer.Vector({
    source: new ol.source.Vector({
        projection: 'EPSG:4326',
        url: file_url,
        format: new ol.format.GeoJSON()
    }),
    style: projects_style
});

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});

closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

var map2d = new ol.Map({
    layers: [
        tile_layer,
        projects_layer
    ],
    overlays: [overlay],
    controls: [
        new ol.control.Zoom({
        }),
        new ol.control.Attribution({
            collapsible: false
        })
    ],
    interactions: new ol.interaction.defaults().extend([hover]),
    target: 'map',
    view: new ol.View({
        center: ol.proj.transform([25, 20], 'EPSG:4326', 'EPSG:3857'),
        zoom: 2
    })
});

map2d.on('click', function(evt) {
    map2d.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        var geometry = feature.getGeometry();
        var coordinate = geometry.getCoordinates();
        var p = feature.getProperties()
        var text = "<b>" + p.company + " (" + p.period + "), "  + p.city + "</b>"
            + "<p>" + feature.getProperties().title  + "</p>";
        content.innerHTML = text;
        overlay.setPosition(coordinate);
    });
});

var map3d;

function _doToggle() {
    map3d.setEnabled(!map3d.getEnabled());
}

function toggle3D() {
    if (!map3d) {
        var s = window.lazyLoadCesium();
        s.onload = function() {
            init3D();
            _doToggle();
        };
    } else {
        _doToggle();
    }
}

function init3D() {
    map3d = new olcs.OLCesium({map: map2d});
    var scene = map3d.getCesiumScene();
    var terrainProvider = new Cesium.CesiumTerrainProvider({
        url : '//assets.agi.com/stk-terrain/world'
    });
    scene.terrainProvider = terrainProvider;
}

