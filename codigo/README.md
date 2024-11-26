# Entrega_A3
Atividade para avaliação Facs

# Procedimentos

1. Estando na pasta 'codigo' execute 'docker-compose up --build -d'

2. Opcional -> instale o postgres no dbeaver ou outra ferramenta de sua preferência para acompanhar o crud. 

3. Use a extensão do vscode -> 'thunder client' ou postman, insomnia para usar os métodos http

# MÉTODOS API

1. TABELA CLIENTES..........................................................
  * GET 
    - (tudo)....... http://localhost:3000/clientes  
    - (por nome)... http://localhost:3000/clientes/nome/jair  
    - (por cpf) ... http://localhost:3000/clientes/cpf/111.222.333-44 

  * POST
    - http://localhost:3000/clientes
      {
        "nome":"jailson",
        "cpf":"111.222.333-44",
        "endereco":"rua A bairro X"
      }

  * PUT / PATCH
    - (por cpf).... http://localhost:3000/clientes/cpf/111.222.333-44
    - (por Id)..... http://localhost:3000/clientes/id/1

  * DELETE
    - (por cpf).... http://localhost:3000/clientes/cpf/111.222.333-44
    - (por Id)..... http://localhost:3000/clientes/id/1
    - (todos)...... http://localhost:3000/clientes/todos
    
2. TABELA VENDEDORES.......................................................
  * GET 
    - (tudo)....... http://localhost:3000/vendedores
    - (por nome)... http://localhost:3000/vendedores/nome/jair  
    - (por cpf) ... http://localhost:3000/vendedores/cpf/111.222.333-44 

  * POST
    - http://localhost:3000/vendedores
      {
        "nome":"jailson",
        "cpf":"111.222.333-44"
      }

  * PUT / PATCH
    - (por cpf).... http://localhost:3000/vendedores/cpf/111.222.333-44
    - (por Id)..... http://localhost:3000/vendedores/id/1
      {
        "nome":"jailson",
        "cpf":"111.222.333-44"
      }

  * DELETE
    - (por cpf).... http://localhost:3000/vendedores/cpf/111.222.333-44
    - (por Id)..... http://localhost:3000/vendedores/id/1
    - (todos)...... http://localhost:3000/vendedores/todos

3. TABELA PRODUTOS.......................................................
  * GET 
    - (tudo)....... http://localhost:3000/produtos
    - (por nome)... http://localhost:3000/produtos/nome/farinha 
    - (por id) .... http://localhost:3000/produtos/id/1

  * POST
    - http://localhost:3000/produtos
      {
        "nome":"farinha",
        "preco":"111.222.333-44",  // ou sem aspas
        "estoque":"50"             // ou sem aspas
      }

  * PUT / PATCH
    - (por nome).... http://localhost:3000/produtos/nome/farinha
    - (por Id)...... http://localhost:3000/produtos/id/1
      {
        "nome":"farinha",
        "preco":"111.222.333-44",  // ou sem aspas
        "estoque":"50"             // ou sem aspas
      }

  * DELETE
    - (por nome).... http://localhost:3000/produtos/nome/farinha
    - (por Id)...... http://localhost:3000/produtos/id/1
    - (todos)....... http://localhost:3000/produtos/todos

