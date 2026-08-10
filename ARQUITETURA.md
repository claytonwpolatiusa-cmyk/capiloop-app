# CapiLoop - Arquitetura Completa

## Visão Geral

O CapiLoop é uma plataforma de marketplace de sacolas surpresa que conecta restaurantes/estabelecimentos com clientes que buscam alimentos com desconto e reduzir desperdício. A plataforma é composta por três aplicações principais:

1. **App Móvel (React Native/Expo)** - Para clientes descobrirem, reservarem e pagarem por sacolas
2. **Dashboard Web de Parceiros (React)** - Para restaurantes criarem e gerenciarem suas sacolas
3. **Backend Compartilhado (Node.js/Express + tRPC)** - API que alimenta ambas as aplicações

---

## Arquitetura do Banco de Dados

### Tabelas Principais

#### `users`
Usuários base do sistema (clientes e parceiros). Usa OAuth para autenticação.

```sql
- id: int (PK)
- openId: varchar (único, OAuth)
- name: text
- email: varchar
- role: enum (user, admin)
- createdAt, updatedAt, lastSignedIn: timestamp
```

#### `partners`
Restaurantes/estabelecimentos que vendem sacolas.

```sql
- id: int (PK)
- userId: int (FK → users)
- businessName: varchar
- cnpj: varchar (único)
- category: varchar (Padaria, Café, Mercado, Restaurante)
- address: text
- latitude, longitude: varchar
- phone, email: varchar
- status: enum (pending, approved, rejected, suspended)
- createdAt, updatedAt: timestamp
```

#### `bags`
Sacolas diárias oferecidas pelos parceiros.

```sql
- id: int (PK)
- partnerId: int (FK → partners)
- category: varchar
- originalPrice, salePrice: decimal
- expectedItems: text (descrição dos itens)
- pickupStartTime, pickupEndTime: varchar (ex: "18:00", "19:30")
- quantity: int (quantas sacolas disponíveis)
- reserved: int (quantas foram reservadas)
- co2Kg: decimal (impacto ambiental)
- imageUrl: text
- status: enum (active, sold_out, cancelled)
- createdAt, updatedAt: timestamp
```

#### `addresses`
Endereços salvos dos clientes para retirada/entrega.

```sql
- id: int (PK)
- userId: int (FK → users)
- label: varchar (Home, Work, etc)
- street, number, complement, neighborhood, city, state, zipCode: varchar
- isDefault: int (booleano)
- createdAt: timestamp
```

#### `paymentMethods`
Métodos de pagamento dos clientes (cartão, PIX).

```sql
- id: int (PK)
- userId: int (FK → users)
- type: enum (credit_card, pix, debit_card)
- token: text (token criptografado do gateway)
- lastFour: varchar (últimos 4 dígitos)
- brand: varchar (Visa, Mastercard, etc)
- isDefault: int (booleano)
- createdAt: timestamp
```

#### `reservations`
Reservas de sacolas feitas pelos clientes.

```sql
- id: int (PK)
- userId: int (FK → users)
- bagId: int (FK → bags)
- code: varchar (código único de retirada, ex: "CAP-A1B2C3")
- status: enum (pending, confirmed, picked_up, cancelled)
- pickupTime, pickupDate: varchar
- createdAt, updatedAt: timestamp
```

#### `transactions`
Pagamentos processados.

```sql
- id: int (PK)
- reservationId: int (FK → reservations)
- userId: int (FK → users)
- amount: decimal
- paymentMethodId: int (FK → paymentMethods)
- status: enum (pending, completed, failed, refunded)
- paymentGatewayId: varchar (ID do gateway, ex: Stripe, MercadoPago)
- paymentGateway: varchar
- createdAt, updatedAt: timestamp
```

---

## Fluxos de Usuário

### 1. Cliente (App Móvel)

#### Fluxo de Descoberta
1. Cliente abre o app
2. Faz login com OAuth (Google, Apple, Email)
3. Permite acesso à localização
4. Vê sacolas próximas em mapa ou lista
5. Clica em uma sacola para ver detalhes

#### Fluxo de Reserva e Pagamento
1. Cliente clica "Reservar"
2. Escolhe endereço de retirada (ou adiciona novo)
3. Escolhe método de pagamento (cartão ou PIX)
4. Confirma reserva
5. Recebe código de retirada (ex: "CAP-A1B2C3")
6. Vai ao estabelecimento no horário indicado
7. Mostra código para o atendente
8. Atendente marca como "retirada" no dashboard

#### Tela de Impacto
- Mostra total de sacolas reservadas
- CO₂ evitado (kg)
- Economia total (R$)
- Histórico de reservas

### 2. Parceiro (Dashboard Web)

#### Fluxo de Cadastro
1. Parceiro acessa `capiloop-partner-dashboard.com`
2. Faz login com email/senha (ou OAuth)
3. Preenche dados do estabelecimento (CNPJ, endereço, localização)
4. Aguarda aprovação manual (status: pending → approved)

#### Fluxo de Criar Sacola
1. Parceiro clica "+ Nova Sacola"
2. Preenche:
   - Categoria (Padaria, Café, etc)
   - Preço original e de venda
   - Itens esperados (descrição)
   - Horário de retirada (ex: 18:00 - 19:30)
   - Quantidade disponível
   - CO₂ evitado (estimado)
3. Sacola fica visível no app dos clientes
4. Conforme clientes reservam, contador decresce
5. Quando todas são reservadas, status muda para "sold_out"

#### Tela de Dashboard
- Estatísticas: total de sacolas, reservas, receita, CO₂
- Lista de reservas recentes com status
- Ações: confirmar retirada, cancelar reserva

---

## Endpoints da API (tRPC)

### Autenticação (Existente)
```
POST /api/trpc/auth.me
POST /api/trpc/auth.logout
```

### Parceiros (Novo)
```
POST /api/trpc/partner.login
  Input: { email, password }
  Output: { token, partnerId }

GET /api/trpc/partner.stats
  Output: { totalBags, totalReservations, totalRevenue, co2Saved, recentReservations }

GET /api/trpc/partner.bags.list
  Output: Bag[]

POST /api/trpc/partner.bags.create
  Input: { category, originalPrice, salePrice, expectedItems, pickupStartTime, pickupEndTime, quantity, co2Kg }
  Output: { success }

DELETE /api/trpc/partner.bags.delete
  Input: { bagId }
  Output: { success }

GET /api/trpc/partner.settings.get
  Output: Partner

PUT /api/trpc/partner.settings.update
  Input: { businessName, cnpj, category, address, phone, email, latitude, longitude }
  Output: { success }
```

---

## Próximos Passos para Implementação

### 1. Autenticação de Clientes (App Móvel)
- [ ] Implementar telas de login/cadastro
- [ ] Integrar OAuth (Google, Apple)
- [ ] Salvar token no AsyncStorage
- [ ] Criar contexto de autenticação

### 2. Pagamentos
- [ ] Integrar MercadoPago ou Stripe
- [ ] Criar telas de adição de cartão
- [ ] Implementar fluxo de checkout
- [ ] Processar PIX (QR code)

### 3. Autenticação de Parceiros
- [ ] Implementar autenticação real (não mock)
- [ ] Validar CNPJ
- [ ] Criar fluxo de aprovação manual

### 4. Conectar App com Backend
- [ ] Atualizar chamadas de API para usar endpoints reais
- [ ] Implementar cache de sacolas
- [ ] Sincronizar dados em tempo real

### 5. Deploy
- [ ] Deploy do backend (Cloud Run, Heroku, etc)
- [ ] Deploy do dashboard (Vercel, Netlify)
- [ ] Build do app móvel (APK/IPA)

---

## Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|-----------|
| **App Móvel** | React Native, Expo, TypeScript, Tailwind (NativeWind) |
| **Dashboard** | React, TypeScript, Tailwind, Vite |
| **Backend** | Node.js, Express, tRPC, TypeScript |
| **Banco de Dados** | MySQL, Drizzle ORM |
| **Autenticação** | OAuth (Manus), JWT |
| **Pagamentos** | MercadoPago / Stripe (a implementar) |
| **Hospedagem** | Cloud Run, Vercel |

---

## Variáveis de Ambiente

### Backend (.env)
```
DATABASE_URL=mysql://user:password@host/database
JWT_SECRET=seu-secret-aqui
MERCADOPAGO_API_KEY=sua-chave-aqui
STRIPE_API_KEY=sua-chave-aqui
```

### Dashboard (.env.local)
```
VITE_API_URL=http://localhost:3000
```

### App Móvel (app.config.ts)
```
API_URL=http://localhost:3000
```

---

## Fluxo de Desenvolvimento

1. **Local**: Desenvolva e teste localmente
2. **Staging**: Deploy em ambiente de teste
3. **Production**: Deploy em produção

Para cada ambiente, atualize as URLs das APIs e as chaves de autenticação.

---

## Segurança

- **Senhas**: Hash com bcrypt (implementar no login de parceiros)
- **Tokens**: JWT com expiração
- **Dados de Pagamento**: Nunca armazenar números de cartão (usar tokens do gateway)
- **CORS**: Configurar apenas domínios permitidos
- **Rate Limiting**: Implementar para prevenir abuso

---

## Monitoramento

- Logs de erros (Sentry, LogRocket)
- Métricas de performance (New Relic, DataDog)
- Alertas para falhas críticas

---

## Suporte

Para dúvidas ou problemas, consulte a documentação de cada projeto:
- App: `/home/ubuntu/capiloop/README.md`
- Dashboard: `/home/ubuntu/capiloop-partner-dashboard/README.md`
