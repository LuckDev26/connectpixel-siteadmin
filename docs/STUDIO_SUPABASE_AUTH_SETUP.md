# ConnectPixel Studio — usuários e acesso por Supabase

## O que está conectado

- Banco de autenticação: projeto Supabase **CRM ConnectPixel 2026** (`zabntyzdhfaapnjdlzop`), sem modificar dados do CRM.
- Perfis do Studio na tabela independente `public.cp_studio_accounts`, protegida por RLS.
- Conta de proprietário preexistente no Supabase vinculada ao usuário **admin**. Sua senha é a senha atual desse usuário no Supabase, não uma senha gerada aqui.
- Não existe mais login por `ADMIN_TOKEN` na branch do Studio. O código antigo ficou só como histórico; não é carregado pelo Worker.
- Gerenciamento de contas em **Usuários e permissões**: proprietário/administrador pode cadastrar usuário, atribuir perfil, ativar/desativar. Um novo usuário recebe senha provisória mostrada uma única vez e deve trocá-la antes de acessar conteúdos.
- A senha é verificada pelo Supabase Auth; Cloudflare mantém apenas uma sessão curta em cookie HttpOnly assinado. Role e estado ativo são consultados em cada requisição administrativa.
- O serviço do Studio mantém seus documentos em R2 privado e suas publicações em bucket separado durante homologação.

## Configuração única ainda necessária na Cloudflare

Para o Worker de homologação `connectpixel-studio-staging`, na seção **Settings > Variables and Secrets** adicione:

1. **`STUDIO_SUPABASE_SERVICE_ROLE_KEY`**, tipo **Secret**: chave `service_role` do projeto Supabase ConnectPixel 2026. Essa chave é exclusivamente de servidor. NUNCA a exponha no frontend, no GitHub, em logs ou no chat. Dê acesso apenas aos administradores técnicos que realmente precisam dela.
2. **`STUDIO_SESSION_SECRET`**, tipo **Secret**: valor aleatório de pelo menos 32 caracteres, gerado e salvo diretamente num gerenciador seguro.

Os valores públicos `CRM_SUPABASE_URL` e `CRM_SUPABASE_PUBLISHABLE_KEY` já constam nas variáveis do Worker. Não é necessário criar secrets por usuário.

### Primeiro login

- **Usuário:** `admin` (ou o e-mail da conta proprietária já cadastrada no Supabase).
- **Senha:** a senha dessa mesma conta no Supabase. Não sabemos nem mostramos senhas existentes.
- Caso a senha seja desconhecida, use a recuperação de senha pelo fluxo seguro do Supabase Auth, nunca tente adivinhar.

### Cadastro de pessoas

Após o primeiro login, abra **Usuários e permissões** e informe usuário, e-mail e perfil. O painel cria a identidade no Supabase Auth e vincula o perfil na tabela isolada. A senha provisória só aparece imediatamente após a criação. Ao entrar pela primeira vez, o novo usuário obrigatoriamente troca essa senha.

### Observações de segurança

- A funcionalidade de convite usa a Admin API com chave de servidor; sem o Secret a tela não deve permitir logins ou gestão de contas (falha segura).
- A chave de servidor é necessária apenas **uma vez** por ambiente, não por usuário.
- A integração está isolada em homologação. Não alterar `connectpixel.online` nem misturar usuários com o DR Contabilidade ou KiMercado.
- Perfis do Studio **não concedem** direitos de CRM. Quem também tiver uma conta no CRM mantém as permissões antigas do CRM inalteradas.
- Criar usuário com e-mail já registrado no mesmo Supabase Auth pode retornar conflito. Não exclua contas CRM para tentar forçar um convite.
- Password resets/email invitations dependem de SMTP configurado no Supabase; a experiência inicial criada aqui usa senha provisória fornecida pelo administrador.
- Em produção, substituir a senha provisória por convite com confirmação de e-mail quando SMTP estiver pronto e adicionar auditoria de convites e MFA, especialmente para proprietários.
