# Apps Script — Monitoramento PMAS 2026–2029

Este pacote prepara uma **nova planilha do Google Planilhas** e recebe as respostas do formulário deste projeto. Não depende de Google Forms nem de complementos pagos.

## 1. Criar a planilha e instalar o código

1. Crie uma planilha Google em branco e dê o nome **Monitoramento PMAS 2026–2029**.
2. Nela, abra **Extensões → Apps Script**.
3. Substitua todo o conteúdo inicial de `Código.gs` pelo conteúdo completo de **Code.gs** deste pacote, inclusive o catálogo de metas no final.
4. Salve o projeto como **Recebimento PMAS 2026–2029**.
5. Na lista de funções do editor, escolha **criarAbas** e clique em **Executar**.
6. Autorize o acesso à sua planilha com a conta responsável por ela. A autorização deve ser feita pelo proprietário.
7. Volte à planilha: aparecerá uma janela com a senha administrativa gerada. Guarde essa senha.

`criarAbas` pode ser executada novamente: confere os cabeçalhos, preserva respostas e mantém a senha existente. A aba Resumo é recalculada. Uma aba inicial vazia como “Página1” pode permanecer; o script não a exclui.

Se um cabeçalho foi alterado manualmente e ficou incompatível, o script interrompe a operação, em vez de substituir os dados. Não renomeie as abas nem altere os cabeçalhos das tabelas usadas pelo sistema.

## 2. Abas criadas

| Aba | Conteúdo |
| --- | --- |
| Resumo | Quantidade de envios, Sim, Não, percentual e quantidade de metas incluídas, por eixo |
| Envios | Uma linha por envio, com identificação, totais, datas e código de identificação |
| Respostas das metas | Uma linha para cada meta respondida, com código, categoria e resposta |
| Metas concluídas incluídas | Uma linha para cada meta concluída escrita pelo participante |
| Órgão Gestor | Envios do eixo, com uma coluna para cada uma das suas metas |
| Gestão SUAS | Mesmo modelo, para Gestão SUAS |
| Fundo Municipal | Mesmo modelo, para Fundo Municipal |
| PSB | Mesmo modelo, para Proteção Social Básica |
| PSE | Mesmo modelo, para Proteção Social Especial |
| Segurança Alimentar | Mesmo modelo, para Segurança Alimentar |
| Complexo da Cidadania | Mesmo modelo, para Complexo da Cidadania |
| CMAS | Mesmo modelo, para CMAS |
| COMSEA | Mesmo modelo, para COMSEA |

As abas recebem cabeçalhos azuis, filtros e a primeira linha congelada. O código de identificação liga o envio às respostas detalhadas e às metas incluídas.

O Resumo soma as respostas dos **envios**: se uma mesma meta aparece em vários monitoramentos, cada resposta conta. Ele não representa uma contagem de metas únicas do município. As metas incluídas são contabilizadas separadamente; não alteram o percentual das 151 metas originais.

## 3. Publicar o recebimento

1. No Apps Script, abra **Implantar → Nova implantação**.
2. Selecione o tipo **App da Web**.
3. Em **Executar como**, escolha **Eu**, a conta proprietária da planilha.
4. Em **Quem pode acessar**, escolha **Qualquer pessoa**, permitindo que o formulário público envie respostas sem login Google. A planilha em si deve continuar privada. A disponibilidade dessa opção depende das regras da conta/organização.
5. Clique em **Implantar** e copie a URL que termina em **/exec**. Não use a URL de teste `/dev`.
6. Abra essa URL em uma janela sem login. O resultado esperado é um JSON com `ok: true` e `configurado: true`. Essa consulta não grava dados nem mostra respostas.

A consulta das respostas exige a senha administrativa, mesmo que a implantação aceite envios públicos. A senha não deve ser colocada no HTML, no `config.js` ou no GitHub.

Referência: [Apps da Web no Google Apps Script](https://developers.google.com/apps-script/guides/web).

## 4. Ligar ao site

No arquivo `config.js` do site, coloque a URL da nova implantação:

```js
window.PMAS_CONFIG = Object.freeze({
  appsScriptUrl: "COLE_AQUI_A_URL_QUE_TERMINA_EM_EXEC"
});
```

Depois, publique essa alteração no site. O `config.js` deste projeto já foi atualizado com a URL fornecida para a nova planilha.

O formulário atual já envia os campos esperados: `identificacao`, `metas`, `inclusaoMetas` e `enviadoEm`. O recebimento não precisa de um gatilho agendado. **Não execute `doPost` manualmente no editor**: ele é chamado pelo envio do site.

**Confirmação no navegador:** o formulário atualizado lê a resposta do servidor e só exibe sucesso quando recebe `ok: true` com um ID de envio. Em falhas ou rejeições, mantém o rascunho. Ao tentar novamente sem mudar as respostas, reutiliza a data/hora da tentativa anterior, permitindo ao servidor reconhecer um envio que já foi gravado. Essa referência fica na chave local `pmas-monitoramento-2026-2029:envio-pendente`, separada do rascunho.

## 5. Visualizar respostas

- Na planilha: consulte Envios, as abas dos eixos e Metas concluídas incluídas.
- No painel do site (`painel.html`): selecione **Sistema de Vigilância** e use a senha administrativa criada na instalação.
- O endpoint do painel retorna `ok`, `autenticado`, `eixos`, `envios` e `atualizadoEm`, compatíveis com o painel atual.
- Cada envio retorna também `inclusaoMetas`, com as metas escritas pelo participante. O painel atualizado mostra sua quantidade nos indicadores e na tabela, apresenta os textos nos detalhes e inclui ambos na exportação CSV.
- A senha fica em **Configurações do projeto → Propriedades do script → PMAS_SENHA_PAINEL**. Você pode trocá-la ali. O identificador da planilha é guardado em `PMAS_PLANILHA_ID`; não altere esse valor para apontar a outro arquivo.

O endpoint aceita a consulta autenticada por POST (`acao: "painel"`, `sistema`, `senha`) e por GET para manter compatibilidade com versões anteriores. O painel atualizado utiliza POST, sem senha na URL. As credenciais continuam no `sessionStorage` durante a sessão do navegador; o botão Sair as remove.

## 6. Teste inicial na nova planilha

1. Confira se todas as 13 abas foram criadas.
2. Faça um envio identificado como teste, selecionando um eixo e respondendo todas as suas metas.
3. Inclua duas metas concluídas no campo adicional.
4. Confira uma linha em Envios e uma linha na aba do eixo escolhido.
5. Confira uma linha por resposta em Respostas das metas e duas em Metas concluídas incluídas.
6. Confirme os totais no Resumo e abra o painel com a senha administrativa.
7. Se algo falhar, consulte **Execuções** no editor do Apps Script.

O script recalcula os totais no servidor, aceita somente os códigos de metas do eixo, neutraliza entradas que poderiam virar fórmulas e usa uma trava durante a gravação. Reenviar o mesmo conteúdo com a mesma data/hora `enviadoEm` retorna o ID já gravado. Um novo envio com outra data/hora é registrado normalmente, mesmo que tenha as mesmas respostas.

Se ocorrer uma falha de gravação tratável, o script tenta desfazer as linhas daquele envio. Como o Google Planilhas não oferece transação entre abas, uma interrupção abrupta da execução ainda pode deixar linhas auxiliares sem um envio publicado; o painel consulta apenas os envios finalizados na aba Envios.

O catálogo no final de Code.gs contém as **151 metas atuais**, com seus eixos e categorias. Se metas oficiais forem alteradas no site, atualize o catálogo e planeje a migração das colunas das abas; não remova cabeçalhos com respostas existentes.

Limites deste recebimento: até 100 metas concluídas adicionais, até 1.000 caracteres por meta incluída e até 40.000 caracteres no conjunto delas. O formulário ainda não apresenta esses limites na interface; ajuste essa validação na próxima integração.

## 7. Quando alterar o código

Após mudar o Apps Script, use **Implantar → Gerenciar implantações → Editar → Nova versão → Implantar** para atualizar a implantação existente e manter a URL. Salvar no editor, sozinho, não atualiza a versão publicada.

## Verificação local do pacote

```powershell
node --test apps-script/test.cjs
```

Os testes usam uma planilha simulada, sem acessar a conta Google ou registrar respostas reais. A autorização, a implantação e a gravação na planilha real devem ser verificadas após a instalação.
