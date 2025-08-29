<h1 align="center">Token-Service</h1>

> Servidor de Token para la generacion.

## Requesitos
- Nodejs >= 22
- Descarga la última versión (ej: Redis-x64-3.0.504.msi)

## Install
```sh
npm install

## Config
```sh
cp .env-example .env
```

### Configuración en Postman"# token-service"
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
