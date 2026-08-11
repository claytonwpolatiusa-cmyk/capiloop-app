# CapiLoop Partner Dashboard

Portal web para restaurantes e estabelecimentos gerenciarem suas sacolas surpresa no CapiLoop.

## Funcionalidades

- **Login de Parceiros**: Autenticação segura com email e senha
- **Dashboard**: Visualização de estatísticas de vendas, reservas e impacto ambiental
- **Gerenciamento de Sacolas**: Criar, editar e cancelar sacolas diárias
- **Histórico de Reservas**: Acompanhar todas as reservas recebidas
- **Configurações**: Atualizar dados do estabelecimento e localização

## Instalação

```bash
npm install
npm run dev
```

O dashboard estará disponível em `http://localhost:5173`

## Estrutura do Projeto

```
src/
├── pages/
│   ├── LoginPage.tsx       # Tela de login
│   ├── DashboardPage.tsx   # Dashboard principal
│   ├── BagsPage.tsx        # Gerenciamento de sacolas
│   └── SettingsPage.tsx    # Configurações do parceiro
├── components/
│   └── Layout.tsx          # Layout compartilhado com navegação
├── App.tsx                 # Roteamento principal
├── main.tsx                # Entrada da aplicação
└── index.css               # Estilos globais
```

## Build

```bash
npm run build
```

## API Endpoints

O dashboard se comunica com os seguintes endpoints:

- `POST /api/partner/login` - Login de parceiro
- `GET /api/partner/stats` - Estatísticas do dashboard
- `GET /api/partner/bags` - Listar sacolas
- `POST /api/partner/bags` - Criar nova sacola
- `DELETE /api/partner/bags/:id` - Cancelar sacola
- `GET /api/partner/settings` - Obter configurações
- `PUT /api/partner/settings` - Atualizar configurações
