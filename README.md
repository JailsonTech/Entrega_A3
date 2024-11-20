# Entrega_A3
Atividade para avaliação Facs

# Procedimentos

1. Instale o node_modules na pasta codigo

2. Estando na pasta 'codigo' execute o docker-compose up --build -d

3. instale o postgres no dbeaver ou outra ferramenta de sua preferência para acompanhar o crud. Se quiser

4. execute o crud no insominia, postman ou thunder client (vscode)

...............EXEMPLOS COMANDOS SQL...............

5. # OBTER TUDO - GET .............................
http://localhost:3000/api/clientes
http://localhost:3000/api/produtos
http://localhost:3000/api/vendedores

6. # OBTER PELO NOME .............................

7. # DELETE PELO id ou cpf(clientes)........
http://localhost:3000/api/clientes/claudia
http://localhost:3000/api/produtos/farinha
http://localhost:3000/api/vendedores/julia

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

9. # PUT ..............................

# http://localhost:3000/api/produtos/id   

{
    "nome": "feijão",
    "preco": "8.20",
    "estoque": 120
  }