var map = L.map('mapid').setView([-23.550520, -46.633308], 12);

var camadasBase = {
  "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">Contributors</a>'
  }),
  "Satélite": L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0','mt1','mt2','mt3'],
    attribution: 'Imagens de satélite fornecidas por © Google'
  }),
  "Terreno": L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0','mt1','mt2','mt3'],
      attribution: 'Dados de terreno fornecidos por © Google',
  })
};

L.control.layers(camadasBase).addTo(map);

map.addLayer(camadasBase["OpenStreetMap"]);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">Contributors</a>'
}).addTo(map);

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems
  },
  draw: {
    polygon: {
      allowIntersection: false,
      showArea: true,
      drawError: {
        color: '#e1e100',
        message: 'O polígono não pode se cruzar!'
      },
      shapeOptions: {
        color: '#97009c',
        weight: 4,
        opacity: 0.7,
        fill: true,
        fillColor: '#c0c0c0',
        fillOpacity: 0.5,
        dashArray: '5, 5',
        lineCap: 'round',
        lineJoin: 'round'
      }
    },
    polyline: false,
    circle: false,
    rectangle: false,
    marker: false
  }
});

map.addControl(drawControl);

console.log('Leaflet', L);
console.log('Leaflet Draw', L.Control.Draw);

function saveGeoJSON(geojson) {
  console.log('Função saveGeoJSON chamada com geojson:', geojson);
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/save', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      if (response.status === 'success') {
        document.getElementById('cods_imovel').value = response.message;
      } else if (response.status === 'not_found') {
        alert(response.message);
      } else {
        alert('Ocorreu um erro ao processar o seu pedido.');
      }
    } else {
      alert('Erro ao enviar o GeoJSON: ' + xhr.statusText);
    }
  };
  xhr.onerror = function(e) {
    console.error('Erro na solicitação XHR:', e);
  };
  xhr.send(JSON.stringify(geojson));
}

map.on('draw:created', function(event) {
  console.log('Evento draw:created disparado');
  console.log('Polígono criado:', event);
  var layer = event.layer;
  drawnItems.addLayer(layer); // Adicione a camada ao grupo de camadas desenháveis

  var coords = layer.getLatLngs();
  console.log('Coordenadas do polígono:', coords);

  var geojson = layer.toGeoJSON();
  console.log('GeoJSON do polígono:', geojson);

  saveGeoJSON(geojson);
});

map.on('draw:drawstart', function (e) {
  console.log('draw:drawstart', e);
});

map.on('draw:drawstop', function (e) {
  console.log('draw:drawstop', e);
});

map.on('draw:drawvertex', function (e) {
  console.log('draw:drawvertex', e);
});
