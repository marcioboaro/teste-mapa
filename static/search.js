document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([-23.55052, -46.633308], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var marker;

    map.on('click', function(e) {
        var coord = e.latlng;
        var lat = coord.lat;
        var lng = coord.lng;
        
        if (marker) {
            map.removeLayer(marker);
        }
        
        marker = new L.marker(coord).addTo(map);
        document.getElementById('longitude').value = lng;
        document.getElementById('latitude').value = lat;
    });
                             
    document.getElementById('searchForm').addEventListener('submit', function(event) {
        event.preventDefault();

        var codImovel = document.getElementById('cod_imovel').value;
        var longitude = document.getElementById('longitude').value;
        var latitude = document.getElementById('latitude').value;

        // Verificar se algum dos campos está vazio
        if (!codImovel && (!longitude || !latitude)) {
            alert('Por favor, insira o código do imóvel ou as coordenadas.');
            return; // Parar a execução se os campos estiverem vazios
        }

        // Construir o objeto de dados para enviar
        var data = {
            'cod_imovel': codImovel,
            'longitude': longitude,
            'latitude': latitude
        };

        // Desabilitar o botão de busca para evitar múltiplas solicitações
        document.querySelector('button[type="submit"]').disabled = true;

        // Fazer uma solicitação POST para o servidor
        fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Problema na comunicação com o servidor');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            if (data.status === 'success') {
                console.log('Status: success');
                if (data.cars.length > 0) {
                    document.getElementById('cod_imovel').value = data.cars.join(', ');
                } else {
                    document.getElementById('cod_imovel').value = 'Nenhum resultado encontrado.';
                }
            } else if (data.status === 'not_found') {
                console.log('Status: not_found');
                document.getElementById('cod_imovel').value = 'Nenhum resultado encontrado.';
            } else {
                console.log('Status: outro');
                alert('Ocorreu um problema: ' + data.message);
            }
        })
            .catch((error) => {
            console.error('Error:', error);
            alert('Erro: ' + error.message);
        })
        .finally(() => {
            // Reabilitar o botão de busca após a solicitação ser completada
            document.querySelector('button[type="submit"]').disabled = false;
        });
    });
});
