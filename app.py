from flask import Flask, render_template, request, jsonify
import folium
from folium import plugins
from flask import Flask

app = Flask(__name__, static_folder='static', static_url_path='/static')

@app.route('/')
def index():
    # Criar um mapa base
    map = folium.Map(location=[-23.550520, -46.633308], zoom_start=12)

    # Adicionar uma ferramenta de desenho ao mapa
    draw = plugins.Draw(export=True)
    draw.add_to(map)

    # Salvar o mapa em um arquivo HTML temporário e renderizar
    map.save('templates/mapa.html')
    return render_template('mapa.html')

@app.route('/save', methods=['POST'])
def save():
    print('Requisição POST recebida')
    geojson_data = request.json
    with open('poligono.geojson', 'w') as f:
        f.write(json.dumps(geojson_data))  # Converte o dicionário para JSON
    return jsonify(status='success', message='Polígono salvo com sucesso.')

if __name__ == '__main__':
    app.run(debug=True)
