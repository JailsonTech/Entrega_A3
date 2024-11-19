#!/bin/sh

# Aguarda o PostgreSQL estar acessível
until pg_isready -h db -p 5432 -U usuario; do
  echo "Aguardando o PostgreSQL ficar disponível..."
  sleep 2
done

# Agora a API pode ser iniciada
echo "PostgreSQL está disponível, iniciando a aplicação..."
exec "$@"
