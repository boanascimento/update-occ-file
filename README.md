# Update OCC File

Esta extenção foi criada para dar mais agilidade ao realizar download de um widget no OCC e upload de arquivos alterados em um widget.

## Apresentação

A versão atual te permitirá enviar realizar o download de um widget e enviar arquivos alterados assim que o mesmo for salvo. Mas pada isso, é necessário ativar a extenção caso você tenha acabado de abrir o VSCode. Basta clicar com o botão direito no arquivo que você deseja enviar, e em seguida na opção **Update OCC File**. Assim você vai iniciar o comando e daí pra frente, até que vc feche completamente o VSCode, sempre que um arquivo for salvo o envio dele será realizar.

Esta versão é apenas para testes com poucas pessoas. Então a mesma está sujeita a alterações ou sugestões de melhoria.
Há, também, possíveis erros ainda não vistos e outros já levantados os quais estão sendo resolvidos.

![Local do comando](https://user-images.githubusercontent.com/22202005/78039759-e67acf80-7344-11ea-9b57-4a5be1291c08.png)

> Para sugestões, mande um e-mail para **boanerges.nascimento@compasso.com.br**.

## Requisitos

Para que a extenção funcione, você precisa ter o DCU@1.9.0 ou superior instalado globalmente em sua máquina. Se já estiver instalado, então deu bom!

Nem preciso falar que vc vai precisa do Node instalado, né?

O VSCode precisa que você abra a pasta do seu widget como sendo a raiz/worspace da aba do VSCode aberta.

Estando no worspace do seu widget, você precisará criar um arquivo de configurações com a extensão `.json`, o qual será lido pela extensão e utilizará algumas propriedade.

- Crie uma variável de ambiente e nomeie `DEV_API_KEY` em seu compucator e seu valor será a sua API Kei do respectivo ambiente no OCC. Repita também para os ambientes de **UAT** e **PRD**.;
- Crie uma variável de ambiente e nomeie `DEV_NODE` em seu compucator e seu valor será a URL do seu respectivo ambiente. Repita também para os ambientes de **UAT** e **PRD**;
- Crie o arquivo e nomeie `uofSettings.json`;
- Cole os dados abaixo do arquivo criado e altere conforme informado em cada propriedade:
  ```
  {
    "environment": "dev",
    "widgetName": "custom-nome-do-widget",
    "DCUPath": "c:/development/DCU19/dcuIndex.js",
    "OCCRootPath": "c:/development/OCC"
  }
  ```

### Para enviar aquivos

Tendo atendido os pontos acima, você pode salvar um ou mais arquivos e aguardar o upload acompanhando o terminar do VSCode.

### Para enviar aquivos

Tecle `CTRL+Shift+P` e selecione o comando **Get OCC Widget**.

![Downloado de um widget](https://user-images.githubusercontent.com/22202005/78039560-a3206100-7344-11ea-967e-3556a44ebbb5.png)

## Release Notes

Nesta versão você pode vazer download de um widget e enviarum arquivo deste para a interface no OCC.

### 1.0.0

Initial release of Update OCC File
