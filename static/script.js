// Criar o objeto map usando Leaflet.js
var map = L.map('mapid').setView([-23.550520, -46.633308], 12);

// Variável para armazenar as entidades desenhadas
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Adicionar ferramentas de desenho
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
        color: '#97009c'
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

// Função para enviar o GeoJSON para o servidor
function saveGeoJSON(geojson) {
  console.log('Função saveGeoJSON chamada');
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/save', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      if (response.status === 'success') {
        alert('Polígono salvo com sucesso!');
      } else {
        alert('Erro ao salvar o polígono: ' + response.message);
      }
    } else {
      alert('Erro ao enviar o GeoJSON: ' + xhr.statusText);
    }
  };
  xhr.send(JSON.stringify(geojson));
}

// Evento disparado após a criação do polígono
map.on('draw:created', function(event) {
  console.log('Evento draw:created disparado');
  console.log('Polígono criado:', event);
  var layer = event.layer;
  drawnItems.addLayer(layer); // Adicione a camada ao grupo de camadas desenháveis

  // Obter as coordenadas do polígono
  var coords = layer.getLatLngs();
  console.log('Coordenadas do polígono:', coords);

  // Converter o polígono em GeoJSON
  var geojson = layer.toGeoJSON();
  console.log('GeoJSON do polígono:', geojson);

  // Chamar a função para salvar o GeoJSON
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