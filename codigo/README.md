# Entrega_A3
Atividade para avaliação Facs

# Procedimentos

1. Estando na pasta 'codigo' execute ' docker-compose up --build -d '

2. instale o postgres no dbeaver ou outra ferramenta de sua preferência para acompanhar o crud. Se quiser

3. Use a extensão do vscode -> 'thunder client' ou postman, insomnia para usar os métodos api

...............EXEMPLOS COMANDOS SQL...............

5. # OBTER TUDO - GET .............................
http://localhost:3000/clientes
http://localhost:3000/produtos
http://localhost:3000/vendedores

# OBTER CLIENTES PELO NOME........................
http://localhost:3000/clientes/nome/roberto
http://localhost:3000/produtos/feijão

6. # OBTER PELO NOME .............................

7. # DELETE PELO id ou cpf(clientes)........
http://localhost:3000/clientes/claudia
http://localhost:3000/produtos/farinha
http://localhost:3000/vendedores/julia

8. # POST ..............................

# http://localhost:3000/api/vendedores

{    
   "nome": "Claudia",
   "cpf": "232.232.232-23"    
}

# http://localhost:3000/api/clientes 

{
   "nome": "Fernando",
   "cpf": "164.265.333-64",
   "endereco": "Endereço 8"
}

# http://localhost:3000/api/produtos 

{
"nome": "farinha",
"preco": "20.00",
"estoque": 60
}

9. # ATUALIZAR PRODUTOS..............................

PUT http://localhost:3000/produtos/id 
PUT http://localhost:3000/produtos/item/farinha  

{
    "preco": "8.20",
    "estoque": 120
  }

# REALIZAR UMA VENDA................................

POST http://localhost:3000/vendas
{
    "clienteId": 1,
    "vendedorId": 2,
    "produtoId": 3,
    "quantidade": 2
}

# CONSULTAR ESTOQUE..................................

GET http://localhost:3000/produtos/estoque/arroz