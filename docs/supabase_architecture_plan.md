# Plano de Arquitetura do Banco de Dados - Supabase

Este documento detalha a proposta de arquitetura para o banco de dados do aplicativo da ONG Camila, utilizando o Supabase. O objetivo é reestruturar o banco de dados existente (atualmente baseado em dados mockados) para suportar as funcionalidades de gestão social, administrativa e educacional, conforme os requisitos fornecidos.

## 1. Visão Geral da Reestruturação

A reestruturação do banco de dados visa centralizar todas as informações da ONG, substituindo controles descentralizados e manuais por um sistema robusto e escalável. A base de dados será projetada para ser o coração de um sistema estilo ERP social, CRM institucional e prontuário digital.

## 2. Tabelas Propostas e seus Relacionamentos

### 2.1. `users` (Usuários)

Esta tabela será a base para o cadastro institucional unificado, armazenando informações de todos os usuários do sistema (administradores, coordenadores, professores, responsáveis, alunos e voluntários). Ela expandirá a estrutura `User` existente em `mockData.ts`.

| Coluna           | Tipo      | Descrição                                                              | Restrições/Observações                               |
| :--------------- | :-------- | :--------------------------------------------------------------------- | :--------------------------------------------------- |
| `id`             | `UUID`    | Identificador único do usuário.                                        | Chave Primária, Gerado automaticamente               |
| `auth_id`        | `UUID`    | ID do usuário no sistema de autenticação do Supabase.                  | Chave Estrangeira para `auth.users`                  |
| `full_name`      | `TEXT`    | Nome completo do usuário.                                              | Obrigatório                                          |
| `cpf`            | `TEXT`    | Cadastro de Pessoa Física.                                             | Único, Opcional (para menores)                       |
| `rg`             | `TEXT`    | Registro Geral.                                                        | Opcional                                             |
| `address`        | `TEXT`    | Endereço completo.                                                     | Opcional                                             |
| `phone`          | `TEXT`    | Telefone de contato.                                                   | Opcional                                             |
| `email`          | `TEXT`    | Endereço de e-mail.                                                    | Único, Obrigatório (para login)                      |
| `mother_name`    | `TEXT`    | Nome completo da mãe.                                                  | Opcional                                             |
| `father_name`    | `TEXT`    | Nome completo do pai.                                                  | Opcional                                             |
| `role`           | `ENUM`    | Perfil do usuário (ADMIN, TEACHER, STUDENT, PARENT, VOLUNTEER).        | Obrigatório                                          |
| `status`         | `ENUM`    | Status da conta (PENDING, APPROVED, REJECTED).                         | Padrão: PENDING                                      |
| `avatar_url`     | `TEXT`    | URL da imagem de perfil do usuário.                                    | Opcional                                             |
| `vulnerability_situation` | `TEXT` | Descrição da situação de vulnerabilidade.                              | Opcional                                             |
| `priority_public` | `TEXT`    | Indicação de público prioritário.                                      | Opcional                                             |
| `benefits_received` | `JSONB`   | Lista de benefícios recebidos (ex: { "leite": true, "cesta_basica": "2023-01" }). | Opcional                                             |
| `created_at`     | `TIMESTAMPZ` | Data e hora de criação do registro.                                    | Gerado automaticamente                               |
| `updated_at`     | `TIMESTAMPZ` | Data e hora da última atualização do registro.                         | Gerado automaticamente                               |

### 2.2. `children_parents` (Relacionamento entre Alunos e Responsáveis)

Esta tabela fará a ligação entre alunos e seus responsáveis, permitindo que um aluno tenha múltiplos responsáveis e um responsável cuide de múltiplos alunos.

| Coluna           | Tipo      | Descrição                                                              | Restrições/Observações                               |
| :--------------- | :-------- | :--------------------------------------------------------------------- | :--------------------------------------------------- |
| `child_id`       | `UUID`    | ID do aluno (referência a `users.id`).                                 | Chave Estrangeira para `users` (role = 'STUDENT')    |
| `parent_id`      | `UUID`    | ID do responsável (referência a `users.id`).                           | Chave Estrangeira para `users` (role = 'PARENT')     |
| `relationship_type` | `TEXT` | Tipo de relacionamento (ex: 'Mãe', 'Pai', 'Tutor').                     | Opcional                                             |
| `created_at`     | `TIMESTAMPZ` | Data e hora de criação do registro.                                    | Gerado automaticamente                               |

### 2.3. `social_records` (Prontuário Digital)

Esta tabela armazenará o histórico completo de participação, benefícios, eventos e observações para cada usuário, formando o prontuário digital.

| Coluna           | Tipo      | Descrição                                                              | Restrições/Observações                               |
| :--------------- | :-------- | :--------------------------------------------------------------------- | :--------------------------------------------------- |
| `id`             | `UUID`    | Identificador único do registro.                                       | Chave Primária, Gerado automaticamente               |
| `user_id`        | `UUID`    | ID do usuário ao qual o prontuário pertence.                           | Chave Estrangeira para `users.id`                    |
| `record_type`    | `ENUM`    | Tipo de registro (PARTICIPATION, BENEFIT, EVENT, OBSERVATION, DOCUMENT). | Obrigatório                                          |
| `title`          | `TEXT`    | Título ou breve descrição do registro.                                 | Obrigatório                                          |
| `description`    | `TEXT`    | Conteúdo detalhado do registro.                                        | Opcional                                             |
| `record_date`    | `DATE`    | Data do registro.                                                      | Obrigatório                                          |
| `attachments`    | `JSONB`   | URLs de anexos (documentos, imagens).                                  | Opcional                                             |
| `created_by`     | `UUID`    | ID do usuário que criou o registro.                                    | Chave Estrangeira para `users.id`                    |
| `created_at`     | `TIMESTAMPZ` | Data e hora de criação do registro.                                    | Gerado automaticamente                               |

### 2.4. `attendance` (Presença)

Esta tabela registrará a frequência dos alunos em atividades e projetos.

| Coluna           | Tipo      | Descrição                                                              | Restrições/Observações                               |
| :--------------- | :-------- | :--------------------------------------------------------------------- | :--------------------------------------------------- |
| `id`             | `UUID`    | Identificador único do registro de presença.                           | Chave Primária, Gerado automaticamente               |
| `user_id`        | `UUID`    | ID do aluno.                                                           | Chave Estrangeira para `users.id` (role = 'STUDENT') |
| `activity_id`    | `UUID`    | ID da atividade ou projeto.                                            | Chave Estrangeira para `activities.id`               |
| `date`           | `DATE`    | Data da presença.                                                      | Obrigatório                                          |
| `status`         | `ENUM`    | Status da presença (PRESENT, ABSENT, EXCUSED).                         | Obrigatório                                          |
| `recorded_by`    | `UUID`    | ID do usuário que registrou a presença.                                | Chave Estrangeira para `users.id`                    |
| `created_at`     | `TIMESTAMPZ` | Data e hora de criação do registro.                                    | Gerado automaticamente                               |

### 2.5. `activities` (Atividades/Projetos)

Esta tabela armazenará informações sobre as atividades e projetos da ONG.

| Coluna           | Tipo      | Descrição                                                              | Restrições/Observações                               |
| :--------------- | :-------- | :--------------------------------------------------------------------- | :--------------------------------------------------- |
| `id`             | `UUID`    | Identificador único da atividade.                                      | Chave Primária, Gerado automaticamente               |
| `name`           | `TEXT`    | Nome da atividade/projeto.                                             | Obrigatório                                          |
| `description`    | `TEXT`    | Descrição detalhada.                                                   | Opcional                                             |
| `start_date`     | `DATE`    | Data de início.                                                        | Opcional                                             |
| `end_date`       | `DATE`    | Data de término.                                                       | Opcional                                             |
| `created_at`     | `TIMESTAMPZ` | Data e hora de criação do registro.                                    | Gerado automaticamente                               |

### 2.6. `inventory` (Estoque de Benefícios)

Esta tabela controlará o estoque de itens como leite, cesta básica, etc.

| Coluna           | Tipo      | Descrição                                                              | Restrições/Observações                               |
| :--------------- | :-------- | :--------------------------------------------------------------------- | :--------------------------------------------------- |
| `id`             | `UUID`    | Identificador único do item de estoque.                                | Chave Primária, Gerado automaticamente               |
| `item_name`      | `TEXT`    | Nome do item (ex: 'Leite', 'Cesta Básica').                            | Obrigatório                                          |
| `quantity`       | `INT`     | Quantidade em estoque.                                                 | Obrigatório, Padrão: 0                               |
| `unit`           | `TEXT`    | Unidade de medida (ex: 'litros', 'unidades').                          | Opcional                                             |
| `last_restock`   | `TIMESTAMPZ` | Data da última reposição.                                              | Opcional                                             |
| `created_at`     | `TIMESTAMPZ` | Data e hora de criação do registro.                                    | Gerado automaticamente                               |
| `updated_at`     | `TIMESTAMPZ` | Data e hora da última atualização do registro.                         | Gerado automaticamente                               |

### 2.7. `benefit_distribution` (Distribuição de Benefícios)

Esta tabela registrará a distribuição de benefícios aos usuários.

| Coluna           | Tipo      | Descrição                                                              | Restrições/Observações                               |
| :--------------- | :-------- | :--------------------------------------------------------------------- | :--------------------------------------------------- |
| `id`             | `UUID`    | Identificador único da distribuição.                                   | Chave Primária, Gerado automaticamente               |
| `inventory_item_id` | `UUID` | ID do item de estoque distribuído.                                     | Chave Estrangeira para `inventory.id`                |
| `user_id`        | `UUID`    | ID do usuário que recebeu o benefício.                                 | Chave Estrangeira para `users.id`                    |
| `quantity`       | `INT`     | Quantidade distribuída.                                                | Obrigatório                                          |
| `distribution_date` | `TIMESTAMPZ` | Data e hora da distribuição.                                           | Obrigatório, Padrão: `now()`                         |
| `distributed_by` | `UUID`    | ID do usuário que realizou a distribuição.                             | Chave Estrangeira para `users.id`                    |
| `notes`          | `TEXT`    | Observações adicionais.                                                | Opcional                                             |

### 2.8. `announcements` (Comunicados)

Esta tabela armazenará os comunicados da ONG, similar à estrutura existente, mas com `user_id` para o autor.

| Coluna           | Tipo      | Descrição                                                              | Restrições/Observações                               |
| :--------------- | :-------- | :--------------------------------------------------------------------- | :--------------------------------------------------- |
| `id`             | `UUID`    | Identificador único do comunicado.                                     | Chave Primária, Gerado automaticamente               |
| `title`          | `TEXT`    | Título do comunicado.                                                  | Obrigatório                                          |
| `content`        | `TEXT`    | Conteúdo detalhado do comunicado.                                      | Obrigatório                                          |
| `author_id`      | `UUID`    | ID do usuário que publicou o comunicado.                               | Chave Estrangeira para `users.id`                    |
| `target_roles`   | `ENUM[]`  | Perfis de usuários que devem receber o comunicado (ALL, TEACHERS, PARENTS, STUDENTS, VOLUNTEERS). | Obrigatório                                          |
| `created_at`     | `TIMESTAMPZ` | Data e hora de criação do comunicado.                                  | Gerado automaticamente                               |

### 2.9. `events` (Eventos)

Esta tabela armazenará os eventos da ONG, similar à estrutura existente.

| Coluna           | Tipo      | Descrição                                                              | Restrições/Observações                               |
| :--------------- | :-------- | :--------------------------------------------------------------------- | :--------------------------------------------------- |
| `id`             | `UUID`    | Identificador único do evento.                                         | Chave Primária, Gerado automaticamente               |
| `title`          | `TEXT`    | Título do evento.                                                      | Obrigatório                                          |
| `description`    | `TEXT`    | Descrição detalhada do evento.                                         | Opcional                                             |
| `start_datetime` | `TIMESTAMPZ` | Data e hora de início do evento.                                       | Obrigatório                                          |
| `end_datetime`   | `TIMESTAMPZ` | Data e hora de término do evento.                                      | Opcional                                             |
| `location`       | `TEXT`    | Local do evento.                                                       | Opcional                                             |
| `created_by`     | `UUID`    | ID do usuário que criou o evento.                                      | Chave Estrangeira para `users.id`                    |
| `created_at`     | `TIMESTAMPZ` | Data e hora de criação do evento.                                      | Gerado automaticamente                               |

### 2.10. `blog_posts` (Posts do Blog)

Esta tabela armazenará os posts do blog, similar à estrutura existente.

| Coluna           | Tipo      | Descrição                                                              | Restrições/Observações                               |
| :--------------- | :-------- | :--------------------------------------------------------------------- | :--------------------------------------------------- |
| `id`             | `UUID`    | Identificador único do post.                                           | Chave Primária, Gerado automaticamente               |
| `title`          | `TEXT`    | Título do post.                                                        | Obrigatório                                          |
| `cover_image_url` | `TEXT`   | URL da imagem de capa.                                                 | Opcional                                             |
| `excerpt`        | `TEXT`    | Resumo do post.                                                        | Opcional                                             |
| `content`        | `TEXT`    | Conteúdo completo do post (Markdown/HTML).                             | Obrigatório                                          |
| `author_id`      | `UUID`    | ID do usuário autor do post.                                           | Chave Estrangeira para `users.id`                    |
| `published_at`   | `TIMESTAMPZ` | Data e hora de publicação.                                             | Gerado automaticamente                               |
| `updated_at`     | `TIMESTAMPZ` | Data e hora da última atualização.                                     | Gerado automaticamente                               |

### 2.11. `user_activity_log` (Logs de Atividade do Usuário)

Para fins de LGPD e segurança, esta tabela registrará as ações importantes dos usuários.

| Coluna           | Tipo      | Descrição                                                              | Restrições/Observações                               |
| :--------------- | :-------- | :--------------------------------------------------------------------- | :--------------------------------------------------- |
| `id`             | `UUID`    | Identificador único do log.                                            | Chave Primária, Gerado automaticamente               |
| `user_id`        | `UUID`    | ID do usuário que realizou a ação.                                     | Chave Estrangeira para `users.id`                    |
| `action`         | `TEXT`    | Descrição da ação realizada (ex: 'login', 'cadastro_aluno', 'edicao_prontuario'). | Obrigatório                                          |
| `details`        | `JSONB`   | Detalhes adicionais da ação.                                           | Opcional                                             |
| `ip_address`     | `TEXT`    | Endereço IP de onde a ação foi realizada.                              | Opcional                                             |
| `created_at`     | `TIMESTAMPZ` | Data e hora da ação.                                                   | Gerado automaticamente                               |

## 3. Considerações de Segurança e LGPD

*   **Autenticação**: Será utilizada a autenticação nativa do Supabase (Auth), que oferece suporte a e-mail/senha e OAuth.
*   **Autorização (RLS)**: Row Level Security (RLS) será implementada em todas as tabelas sensíveis para garantir que cada usuário acesse apenas os dados permitidos pelo seu perfil (`role`).
*   **Criptografia**: O Supabase já oferece criptografia em trânsito (SSL/TLS) e em repouso para os dados.
*   **Logs de Acesso**: A tabela `user_activity_log` será fundamental para auditoria e conformidade com a LGPD.
*   **Consentimento de Imagem/Dados**: Campos específicos ou tabelas relacionadas podem ser adicionados para gerenciar o consentimento de uso de imagem e dados, conforme a LGPD e ECA Digital.

## 4. Próximos Passos

1.  Criação do projeto no Supabase.
2.  Implementação do esquema de banco de dados proposto.
3.  Configuração da autenticação e RLS no Supabase.
4.  Adaptação do código frontend para interagir com o Supabase API.
