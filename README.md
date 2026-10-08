# O Polvo

Site de restaurante com menu digital, reservas online e painel de administração.

## Funcionalidades

- Menu digital e página de apresentação do restaurante
- Formulário de reservas com validação
- Painel de administração (`/admin.html`) para gerir reservas e definições
- Autenticação por sessão e limitação de pedidos no servidor

## Tecnologias

HTML, CSS e JavaScript no cliente; Node.js no servidor, sem dependências externas.
As reservas ficam guardadas num ficheiro JSON.

## Como correr

É preciso ter o [Node.js](https://nodejs.org) instalado.

```bash
node server.js
```

O site fica em `http://localhost:4173`. No Windows também se pode abrir o `iniciar.bat`.

Na primeira execução é criado o ficheiro `config.json` com uma palavra-passe de
administração gerada automaticamente. Esse ficheiro e a pasta `data/` não fazem parte
do repositório.

## Autor

Samuel Camargo
