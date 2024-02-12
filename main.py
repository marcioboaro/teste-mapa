import json
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from shapely.geometry import shape
from fastapi import HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

DB_CONNECTION_STRING = "postgresql://geomercado_admin:Music-Exes4-Defeat-Flashing-Keg-Unbitten@geografia-mercado.postgres.database.azure.com:5432/car?sslmode=require"

engine = create_engine(DB_CONNECTION_STRING)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


app = FastAPI()
templates = Jinja2Templates(directory='templates')

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get('/')
def index(request: Request):
    return templates.TemplateResponse('index.html', {'request': request})

@app.post('/save')
async def save(request: Request):
    print('Requisição POST recebida')
    geojson_data = await request.json()
    with open('poligono.geojson', 'w') as f:
        f.write(json.dumps(geojson_data))  # Converte o dicionário para JSON
    db = SessionLocal()
    status, message = get_car_by_polygon(geojson_data, db)
    return JSONResponse({'status': status, 'message': message})

@app.get('/search_form')
def search_form(request: Request):
    return templates.TemplateResponse('search_form.html', {'request': request})


@app.post('/search')
async def search(request: Request):
    print("A função search foi chamada") # Debug
    # Esperar dados JSON em vez de dados de formulário
    data = await request.json()
    cod_imovel = data.get('cod_imovel')
    longitude = data.get('longitude')
    latitude = data.get('latitude')
    db = SessionLocal()


    # Se o cod_imovel for fornecido, faça a consulta por código.
    if cod_imovel:
        return await get_car_by_code(cod_imovel, db)

    # Se a longitude e latitude forem fornecidas, faça a consulta por coordenadas.
    elif longitude and latitude:
        return await get_car_by_coord(longitude, latitude, db)

    else:
        # Usar HTTPException para enviar uma resposta de erro HTTP adequada
        raise HTTPException(status_code=400, detail='Parâmetros insuficientes para a consulta.')

    
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
            return "success", f"CAR encontrado: {car}"
        else:
            return "not_found", "Nenhum CAR encontrado."
    except Exception as e:
        print(f'Erro ao obter CAR por poligono: {e}')
        return "error", "Erro ao obter CAR por poligono."


async def get_car_by_code(cod_imovel, db):
    try:
        print(f'Obtendo CAR por código: {cod_imovel}')
        query = text("""
            SELECT cod_imovel
            FROM car
            WHERE cod_imovel = :cod_imovel
        """)
        result = db.execute(query, {"cod_imovel": cod_imovel})
        row = result.fetchone()
        if row:
            print(f'CAR encontrado: {row[0]}')
            return {"status": "success", "cars": row[0]}
        else:
            return {"status": "not_found", "message": "Nenhum CAR encontrado para o código fornecido."}
    except Exception as e:
        print(f'Erro ao obter CAR por código: {e}')
        return {"status": "error", "message": "Erro ao obter CAR por código."}

async def get_car_by_coord(longitude, latitude, db):
    try:
        print(f'Obtendo CAR por coordenadas: {longitude}, {latitude}')
        query = text("""
            SELECT cod_imovel
            FROM car
            WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4674))
        """)
        result = db.execute(query, {"longitude": longitude, "latitude": latitude})
        rows = result.fetchall()
        if rows:
            cars = [row[0] for row in rows]
            print(f'CAR encontrado: {cars}')
            return {"status": "success", "cars": cars}
        else:
            return {"status": "not_found", "message": "Nenhum CAR encontrado para as coordenadas fornecidas."}
    except Exception as e:
        print(f'Erro ao obter CAR por coordenadas: {e}')
        return {"status": "error", "message": "Erro ao obter CAR por coordenadas."}


