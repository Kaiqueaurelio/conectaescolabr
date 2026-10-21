# Auditoria técnica — Conecta Escola BR

Atualizado em 20/10/2026. Este documento separa correções aplicadas no código de itens que dependem do esquema e das permissões do Supabase de produção.

## Críticos — corrigidos no código

- Removida a restauração de identidade por armazenamento local; a sessão e o perfil autorizado vêm do Supabase Auth e da tabela de perfis.
- Centralizada e testada a regra de autorização: somente contas aprovadas com papel ADMIN, TEACHER, STUDENT ou PARENT entram no aplicativo.
- Corrigida a corrida entre restauração da sessão e criação do perfil durante cadastro; o fluxo de confirmação de e-mail agora preserva nome e papel em metadados e finaliza o perfil pendente no primeiro login autenticado.
- Unificada a configuração e o armazenamento de sessão usados pelos dois clientes Supabase.
- Retirado o provedor de dados fictícios da inicialização do app; rotas antigas de dashboard e chamada redirecionam para telas mantidas.
- Reduzido o acesso genérico a dados pessoais: listagens e buscas não carregam CPF/telefone, campos sensíveis passam pelo endpoint criptografado, e campos legados em texto puro são migrados para colunas criptografadas ao serem lidos com sucesso.
- Removidas ações de exclusão em massa de usuários e estoque; a ação da lista de usuários agora bloqueia acesso sem apagar registros.
- Restringido o prontuário social a administradores enquanto não existe uma matriz de permissões mais granular.

## Altos — corrigidos no código

- Dashboard de impacto e dashboard administrativo consultam o banco e não usam mais métricas de demonstração.
- Chamada/frequência grava e consulta `attendance_records`; falhas e gravações parciais são comunicadas.
- Calendário e comunicados consultam e alteram registros persistidos; as mensagens internas sem backend não simulam envio.
- Ficha do participante usa tabelas conhecidas (`users`, `attendance_records`, `benefit_distributions`, `social_records`) e não inventa vínculos de responsáveis ou matrículas.
- Relatórios deixaram de gerar arquivos falsos com extensão PDF/XLSX; exportações usam dados consultados e erros são mostrados.
- A tela de documentos não simula OCR; valida arquivos e permite baixar o original temporário.
- Aprovação/rejeição de cadastros agora tem ações explícitas; criação administrativa de contas não finge funcionar sem endpoint seguro.
- Protegidos os campos de e-mail e papel contra alterações não confirmadas ou autoalterações de papel.
- Estoque criptografado rejeita quantidades inválidas, valores fracionários, ajustes vazios e operações que excedam o limite permitido; valores descriptografados malformados não são convertidos silenciosamente em zero.
- Corrigidos estados de erro e dados antigos que podiam continuar aparecendo após falhas de consulta.

## Médios — corrigidos no código

- Corrigidas descrições desatualizadas sobre frequência, painel de responsáveis e funcionamento offline.
- Corrigidos links de rotas antigas, estados de carregamento, revogação prematura de URLs de download e validação do histórico local de relatórios.
- Adicionado fluxo de CI para instalação reproduzível, build, lint e testes; adicionados testes unitários para a política de autorização.

## Bloqueios restantes — dependem de esquema, permissões ou serviço externo

1. **Banco de produção/RLS:** as políticas de Row Level Security, as colunas reais e os relacionamentos ainda precisam ser validados no projeto Supabase usado pelo app. Não foi possível confirmar acesso a esse projeto nesta sessão.
2. **Implantação das Edge Functions:** as correções de `secure-profile` e `secure-benefits` estão no repositório, mas a alteração do arquivo não comprova que a função já foi implantada no Supabase.
3. **Responsáveis e alunos:** falta confirmar/criar o relacionamento persistente com RLS; por isso, a tela do responsável não inventa alunos vinculados.
4. **Mensagens internas e lembretes:** não há tabela/contrato de backend confirmado; essas ações ficam explicitamente desativadas em vez de simular persistência.
5. **OCR e arquivos permanentes:** é necessário configurar um provedor de OCR e armazenamento seguro; hoje a tela trabalha apenas com arquivos temporários.
6. **Criação administrativa de contas:** precisa de endpoint seguro que crie Auth e perfil em conjunto. Até lá, o cadastro público e a aprovação administrativa são o fluxo suportado.
7. **Voluntários:** o papel não tem uma área de acesso mantida; cadastros desse papel não podem ser aprovados até que a área e as permissões existam.
8. **Relatórios personalizados/financeiros:** precisam de fontes de dados e regras de negócio confirmadas.

## Verificação

O workflow de CI foi adicionado, mas o GitHub não retornou status de checks para o commit consultado. Portanto, build, lint e testes **ainda não podem ser declarados aprovados**. Antes de considerar a aplicação pronta para produção, executar a CI, validar RLS no projeto correto e implantar/testar as Edge Functions.
