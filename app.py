from flask import Flask, render_template, request, jsonify
from flask import Flask
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from shapely.geometry import shape
from sqlalchemy.sql import text
from tkinter import messagebox

DB_CONNECTION_STRING = "postgresql://geomercado_admin:Music-Exes4-Defeat-Flashing-Keg-Unbitten@geografia-mercado.postgres.database.azure.com:5432/car?sslmode=require"

engine = create_engine(DB_CONNECTION_STRING)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = Flask(__name__, static_folder='static', static_url_path='/static')


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/save', methods=['POST'])
def save():
    print('Requisição POST recebida')
    geojson_data = request.json
    with open('poligono.geojson', 'w') as f:
        f.write(json.dumps(geojson_data))  # Converte o dicionário para JSON
    db = SessionLocal()
    car = get_car_by_polygon(geojson_data, db)
    return jsonify({'status': car})

if __name__ == '__main__':
    app.run(debug=True)
 
def get_car_by_polygon(geojson, db):
    # Converter GeoJSON para objeto Shapely
    geometry = shape(geojson['geometry'])
    
    # Validar as coordenadas
    if not geometry.is_valid:
        raise ValueError("Polígono inválido.")
    
    # Converter para WKT
    polygon_wkt = geometry.wkt
    
    try:
        query = text("""
            SELECT cod_imovel
            FROM car
            WHERE ST_Intersects(geom, ST_GeomFromText(:polygon, 4674))
        """)
        result = db.execute(query, {"polygon": polygon_wkt})
        rows = result.fetchall()
        if rows:
            car = [row[0] for row in rows]
            messagebox.showinfo("CAR", str(car))
            return "CAR encontrado."
        else:
            messagebox.showinfo("CAR", "Nenhum CAR encontrado.")
            return "Nenhum CAR encontrado."
    except Exception as e:
        print(f'Erro ao obter CAR por poligono: {e}')
        return "Erro ao obter CAR por poligono."


