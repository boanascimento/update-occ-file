# Update OCC File

Esta extensão foi criada para dar mais agilidade ao realizar download de um widget no OCC e upload de arquivos alterados em um widget.

## Apresentação

A versão atual te permitirá enviar realizar o download de um widget e enviar arquivos alterados assim que o mesmo for salvo. Mas para isso, é necessário ativar a extensão caso você tenha acabado de abrir o VSCode. Basta clicar com o botão direito no arquivo que você deseja enviar, e em seguida na opção **UOF Send File**. Assim você vai iniciar o comando e daí pra frente, até que você feche completamente o VSCode, sempre que um arquivo for salvo o envio dele será realizar.
> ![Local do comando](https://user-images.githubusercontent.com/22202005/91325262-5a58c100-e799-11ea-8d68-b1a9607c9b81.png)

Esta versão é apenas para testes com poucas pessoas. Então a mesma está sujeita a alterações ou sugestões de melhoria.
Há, também, possíveis erros ainda não vistos e outros já levantados os quais estão sendo resolvidos.

> Para sugestões, mande um e-mail para **boanergessn@gmail.com**.

## Requisitos

Para que a extensão funcione, você precisa ter o DCU@1.9.0 ou superior instalado globalmente em sua máquina. Se já estiver instalado, então deu bom!

Nem preciso falar que vc vai precisa do Node instalado, né?

O VSCode precisa que você abra a pasta do seu widget como sendo a raiz/workspace da aba do VSCode aberta.

Para facilitar o uso, você precisará criar algumas variáveis de ambiente:

- Crie uma variável de ambiente e nomeie `TEST_API_KEY` em seu computador e seu valor será a sua **API Key** do respectivo ambiente no OCC. Repita também para os ambientes de **STAGE** e **PROD** de cada ambiente;
- Crie uma variável de ambiente e nomeie `TEST_NODE` em seu computador e seu valor deverá ser a URL do seu respectivo ambiente. Repita também para os ambientes de **STAGE** e **PROD** de cada ambiente;

Estando com VS Code aberto, você precisará criar um arquivo de configurações com a extensão `.json`, o qual será lido pelo _UOF_ para identificação de algumas informações.

- Crie um arquivo e o nomeie `uofSettings.json`; 
  >Você pode fazer isso manualmente ou tecle `CTRL+Shift+P` e selecione o comando **UOF Prepare**. Ele vai criar o arquivo com dados estáticos;
- Altere o arquivo caso utilize o comando **UOF Prepare**;
- Cole os dados abaixo do arquivo criado e altere conforme informado em cada propriedade:
  ```
  {
    "environmentPrefix": "test", // Prefixo da variável de ambiente criada.
    "OCCRootPath": "c:/development/OCC", // Pasta base do OCC na sua máquina.
    "platform": "windows" // Plataforma do seu computador - windows || mac
  }
  ```
Na propriedade `environmentPrefix`, você precisa informar o prefixo da variável de ambiente. O _UOF_ concatena o valor contido nesta propriedade com os sufixos `_API_KEY` e `_NODE` para formar o nome das variáveis de ambiente criadas. Sendo assim, se o valor informado na propriedade for `test`, então o _UOF_ devolverá os nomes das variáveis como `%TEST_API_KEY%` e `%TEST_NODE%`. Nesse caso, você pode criar as variáveis de ambiente com qualquer prefixo, o que facilita caso desenvolva em mais de uma instância OCC.

Para o MacOs, prefira adicionar essas variáveis de ambiente no própri VSCode Setting, fica mais fácil de alterar caso necessário. Basta seguir a documentação do VSCode (https://code.visualstudio.com/docs/getstarted/settings).

### Para enviar arquivos

Tendo atendido os pontos acima, você deverá acionar o _UOF_ clicando com o botão direito do mouse em um dos arquivos e clicar no comando **UOF Send File**. Daí pre frente, você pode salvar um ou mais arquivos e aguardar o upload acompanhando o terminar do VS Code que será aberto pelo _UOF_ com o nome `UOF actions`.

![Send File](https://user-images.githubusercontent.com/22202005/91325262-5a58c100-e799-11ea-8d68-b1a9607c9b81.png)


### Para baixar o Widget

Clique com o botão direito do mouse em um em um dos widgets e selecione o comando **UOF Refresh Widget** para o parâmetro `-e` ou o **UOF Grab Widget** para o parâmetro `-g`.

![grab-de-widget](https://user-images.githubusercontent.com/22202005/91342244-1d002d80-e7b1-11ea-8731-c5cf31ca4b62.png)

## Release Notes

Nesta versão você pode:
- Refresh de um widget(-e, --refresh) com o comando **UOF Refresh Widget**, clicando com o botão direito na pasta do widget;
- Grab de widget com o comando(-g, --grab) **UOF Grab Widget**, clicando com o botão direito na pasta do widget;
- Enviar um arquivo deste para a interface no OCC(-t, --put) apenas salvando o arquivo.
- Grab de todos os widget com o comando `ctrl + shift + P` **UOF Run Grab**;
- Preparação do arquivo `uofSettings.json` com o comando `ctrl + shift + P` **UOF Prepare**;
- Criar widget com o comando `ctrl + shift + P` **UOF Create Widget**;

### Beta

Versão de testes externos
> Aberto a melhorias e sugestões.
