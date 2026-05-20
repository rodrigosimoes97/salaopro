# Salão Pro - Sistema de Gestão para Salões de Beleza

O **Salão Pro** é uma solução moderna e eficiente para o gerenciamento de salões de beleza, barbearias e clínicas de estética. O sistema permite o controle completo de clientes, serviços oferecidos e uma agenda dinâmica para marcação de atendimentos.

## 🚀 Tecnologias

Este projeto foi desenvolvido utilizando uma stack moderna e robusta:

### Frontend
- **React 19**: Biblioteca para construção da interface.
- **TypeScript**: Tipagem estática para maior segurança e produtividade.
- **Vite**: Build tool extremamente rápida.
- **React Router 7**: Gerenciamento de rotas.
- **React Big Calendar**: Visualização dinâmica dos agendamentos.
- **Axios**: Consumo da API.
- **Lucide React**: Biblioteca de ícones.

### Backend
- **Node.js & Express**: Servidor e rotas da API.
- **Prisma ORM**: Gerenciamento e modelagem do banco de dados.
- **SQLite (libSQL)**: Banco de dados relacional leve.
- **CSV Parser**: Ferramenta para importação massiva de dados.

---

## ✨ Funcionalidades

- **👥 Gestão de Clientes**: Cadastro, edição e visualização de clientes com histórico de atendimentos.
- **✂️ Gestão de Serviços**: Cadastro de serviços com definição de preço e tempo de duração.
- **📅 Agenda Interativa**: Visualização completa de compromissos em um calendário intuitivo, facilitando a organização diária.
- **📥 Importação de Dados**: Script dedicado para importação de clientes e serviços via arquivos CSV.

---

## 📂 Estrutura do Projeto

O projeto está dividido em duas partes principais:

- `/server`: API RESTful desenvolvida com Node.js e Prisma.
- `/client/salaopro`: Aplicação Single Page (SPA) desenvolvida com React.

---

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

### 1. Configurando o Servidor

Navegue até a pasta do servidor:
```bash
cd server
```

Instale as dependências:
```bash
npm install
```

Configure o banco de dados e as migrações:
```bash
npx prisma migrate dev --name init
```

Inicie o servidor em modo de desenvolvimento:
```bash
npm run dev
```
O servidor estará rodando em `http://localhost:3001`.

### 2. Configurando o Cliente

Navegue até a pasta do cliente:
```bash
cd client/salaopro
```

Instale as dependências:
```bash
npm install
```

Inicie a aplicação:
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:5173`.

---

## 📊 Importação de Dados (CSV)

Para importar dados rapidamente para o sistema:
1. Coloque seus arquivos CSV na raiz da pasta `server`.
2. Execute o comando:
```bash
cd server
npm run import
```

---

## 📝 Licença

Este projeto está sob a licença ISC.
