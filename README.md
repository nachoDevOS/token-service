<h1 align="center">Token-Service</h1>

> Servidor de Token para la generacion.

## Requesitos
- Nodejs >= 22
- Redis >= 6.0.16

## Install
```sh
npm install

# Actualizar la lista de paquetes
sudo apt update

# Instalar Redis
sudo apt install redis-server

# Verificar la instalación
redis-server --version
```

## Config
```sh
cp .env-example .env

# Edit environment variables
APP_NAME="Token-Api"
APP_ENV="development" # prod for "production" environment
APP_DOMAIN=example.com # your domain without http or https (example.com)
APP_PORT=3001 # your port

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=token_service

REDIS_URL=redis://localhost:6379
JWT_SECRET=VPHIvIyQFltKMFP41JVDtW4rfp1g1eOZcGBCQC693JiFFMPZEFtmKLAYlIfhTISK
```

## Configuración en Postman"# token-service"
### Crear una request para generar token
#### Configuración
- Method: POST
- URL: http://localhost:3001/api/tokens/generate
#### Headers
- Key: Content-Type → Value: application/json
#### Body: (Seleccionar "raw" y "JSON")
```sh
{
    "systemId": "sistema1", 
    "microservice": "auth-service",
    "payload": {
        "userId": "123",
        "role": "admin"
    }
}
```

### Crear request para validar token
- Nueva request: "Validate Token"
- Method: GET
- URL: http://localhost:3001/api/tokens/validate
#### Headers
- Key: Authorization → Value: Bearer {{token}}
- Key: Content-Type → Value: application/json

### Request para invalidar token
- Nueva request: "Invalidate Token"
- Method: POST
- URL: http://localhost:3001/api/tokens/invalidate
#### Headers
- Key: Authorization → Value: Bearer {{token}}

### Request para obtener tokens válidos
- Nueva request: "Get Valid Tokens"
- Method: GET
- URL: http://localhost:3001/api/tokens/valid-tokens?systemId=sistema1
