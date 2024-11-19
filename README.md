# Entrega_A3
Atividade para avaliação Facs

# Procedimentos

1. Instale o node_modules na pasta codigo

2. Estando na pasta 'codigo' execute o docker-compose up --build -d

3. instale o postgres no dbeaver ou outra ferramenta de sua preferência para acompanhar o crud. Se quiser

4. execute o crud no insominia, postman ou thunder client (vscode)

...............COMANDOS SQL...............

5. # OBTER TUDO - GET .............................
http://localhost:3000/api/clientes
http://localhost:3000/api/produtos
http://localhost:3000/api/vendedores

6. # DELETE (PELO id - escolha)........
http://localhost:3000/api/clientes/1
http://localhost:3000/api/produtos/1
http://localhost:3000/api/vendedores/1

7. # INSERIR - POST ..............................

# http://localhost:3000/api/vendedores...

{    
   "nome": "Claudia",
   "cpf": "232.232.232-23"    
}

# http://localhost:3000/api/clientes ...

{
   "nome": "Fernando",
   "cpf": "164.265.333-64",
   "endereco": "Endereço 8"
}

# http://localhost:3000/api/produtos ...

{
"nome": "farinha",
"preco": "20.00",
"estoque": 60
}


7. # MUDAR, ATUALIZAR - PUT ..............................

# http://localhost:3000/api/produtos   ou (/clientes, /vendedores)

{
    "nome": "feijão",
    "preco": "8.20",
    "estoque": 120
  }