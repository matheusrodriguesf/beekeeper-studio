# Beekeeper Studio (Community Edition) - Fork para Estudo de Caso CI/CD

Este repositório é um **fork** do repositório oficial do [Beekeeper Studio](https://github.com/beekeeper-studio/beekeeper-studio). O objetivo deste fork é realizar um **estudo de caso sobre pipelines CI/CD** e também criar um **Dockerfile** para facilitar a execução da aplicação em ambientes locais, sem a necessidade de compilar o código ou configurar manualmente as dependências.

## Objetivos do Fork

1. **Estudo de Caso CI/CD**: 
   - Implementação de um pipeline de CI/CD utilizando o GitHub Actions para automatizar o build, testes, análise de código e publicação de imagens Docker.
   - Exploração de boas práticas para automatizar e otimizar o processo de desenvolvimento e entrega contínua de software.

2. **Criação de um Dockerfile**:
   - Construção de um Dockerfile que encapsula a aplicação Beekeeper Studio e todas as suas dependências, permitindo que o aplicativo seja executado facilmente em qualquer ambiente com suporte a Docker.
   - Publicação da imagem Docker no Docker Hub.

## Pipeline de CI/CD

O pipeline de CI/CD configurado neste projeto inclui as seguintes etapas:
- **Build**: Constrói a aplicação e gera uma imagem Docker.
- **Test**: Executa os testes automatizados para verificar a integridade da aplicação.
- **Analyze**: Realiza a análise estática do código para garantir a qualidade e segurança do código.
- **Publish**: Publica a imagem Docker gerada no Docker Hub, utilizando tags específicas para a versão da aplicação.

## Sobre Beekeeper Studio
Beekeeper Studio é um gerenciador de banco de dados e editor SQL que fornece uma interface gráfica intuitiva para se conectar a diversos bancos de dados, como MySQL, PostgreSQL e SQLite. Como ele podemos gerenciar schema, executar consultas SQL, visualizar e editar dados. O histórico de consultas, o suporte a múltiplas abas e os temas personalizáveis são alguns dos recursos presentes no software.

Disponível para Linux, Mac e Windows, o Beekeeper Studio é um software multiplataforma. A versão Community Edition, que é distribuída e sob a GPL, ou seja, é gratuita e livre para uso e modificação, foi a escolhida para o estudo de caso.

[Baixe a edição da comunidade aqui](https://beekeeperstudio.io/get-community)



## Suporte aos Bancos de Dados

<!-- SUPPORT_BEGIN -->

| Database                                                 | Support                      | Community | Ultimate |                             Beekeeper Links |
| :------------------------------------------------------- | :--------------------------- | :-------: | :------: | -----------------------------------------: |
| [PostgreSQL](https://postgresql.org)                     | ⭐ Full Support              |    ✅     |    ✅    |  [Features](https://beekeeperstudio.io/db/postgres-client) |
| [MySQL](https://www.mysql.com/)                          | ⭐ Full Support              |    ✅     |    ✅    |  [Features](https://beekeeperstudio.io/db/mysql-client)|
| [SQLite](https://sqlite.org)                             | ⭐ Full Support              |    ✅     |    ✅    |   [Features](https://beekeeperstudio.io/db/sqlite-client), [Docs](https://docs.beekeeperstudio.io/user_guide/connecting/sqlite) |
| [SQL Server](https://www.microsoft.com/en-us/sql-server) | ⭐ Full Support              |    ✅     |    ✅    |   [Features](https://beekeeperstudio.io/db/sql-server-client)  |
| [Amazon Redshift](https://aws.amazon.com/redshift/)      | ⭐ Full Support              |    ✅     |    ✅    |    [Features](https://beekeeperstudio.io/db/redshift-client) |
| [CockroachDB](https://www.cockroachlabs.com/)            | ⭐ Full Support              |    ✅     |    ✅    | [Features](https://beekeeperstudio.io/db/cockroachdb-client)|
| [MariaDB](https://mariadb.org/)                          | ⭐ Full Support              |    ✅     |    ✅    |     [Features](https://beekeeperstudio.io/db/mariadb-client) |
| [TiDB](https://pingcap.com/products/tidb/)               | ⭐ Full Support              |    ✅     |    ✅    |        [Features](https://beekeeperstudio.io/db/tidb-client) |
| [Google BigQuery](https://cloud.google.com/bigquery)     | ⭐ Full Support             |    ✅     |    ✅    |    [Features](https://beekeeperstudio.io/db/google-big-query-client), [Docs](https://docs.beekeeperstudio.io/user_guide/connecting/bigquery) |
| [Oracle Database](https://www.oracle.com/database/)      | ⭐ Full Support              |           |    ✅    |      [Features](https://beekeeperstudio.io/db/oracle-client), [Docs](https://docs.beekeeperstudio.io/user_guide/connecting/oracle) |
| [Cassandra](http://cassandra.apache.org/)                | ⭐ Full Support              |           |    ✅    |   [Features](https://beekeeperstudio.io/db/cassandra-client) |
| [Firebird](https://firebirdsql.org/)                     | 🅱 Beta Support              |           |    ✅    |    [Features](https://beekeeperstudio.io/db/firebird-client) |
| [LibSQL](https://libsql.org/)                            | 🅱 Beta Support               |           |    ✅    |      [Features](https://beekeeperstudio.io/db/libsql-client) |
| [ClickHouse](https://clickhouse.tech/)                   | ⏳ Coming Soon                |           |    ✅    |  -- |
| [Snowflake](https://www.snowflake.com/)                  | ⏳ Coming Soon                |           |    ✅    |   -- |
| [Trino](https://trino.io/) / [Presto](https://prestodb.io/) | ⏳ Coming Soon                |           |    ✅    |      -- |
| [DuckDB](https://duckdb.org/)                            | ⏳ Coming Soon                |           |    ✅    |      -- |
| [MongoDB](https://www.mongodb.com/)                      | 🗓️ Planned for V5               |           |    ✅    |     -- |
| [Redis](https://redis.io/)                               | 🗓️ Planned for V5               |           |    ✅    |       -- |
| [DynamoDB](https://aws.amazon.com/dynamodb/)             | 🗓️ Planned for V5               |           |    ✅    |       -- |

## Ferramentas Utilizadas

### 1. **GitHub Actions**
O GitHub Actions foi escolhido para orquestrar o pipeline devido à sua integração nativa com o GitHub e à facilidade de configurar workflows automáticos para execução de testes, builds e publicações de imagens Docker.

### 2. **Docker**
Docker foi utilizado para garantir a consistência do ambiente de desenvolvimento e produção, encapsulando a aplicação e suas dependências em contêineres. O uso de Docker no pipeline permite a construção e publicação de imagens que podem ser facilmente replicadas em diferentes ambientes.


## Estrutura do Pipeline

O pipeline está dividido em quatro jobs principais, cada um com um papel específico no ciclo de vida da integração e entrega contínua. Todos os jobs são disparados automaticamente quando há mudanças no repositório, garantindo que a aplicação esteja sempre testada.

#### Job: Build

O job de **build** realiza a construção da aplicação. Ele usa a ação `actions/setup-node@v4` para configuração no Node.Js.

```yaml
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Cache Yarn modules
        uses: actions/cache@v3
        with:
          path: ~/.cache/yarn
          key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
          restore-keys: |
            ${{ runner.os }}-yarn-
      - run: yarn install
      - run: yarn electron:build
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

### Job: Test

O job de `test` garante que todos os testes sejam executados automaticamente, proporcionando feedback imediato da aplicação.

```yaml
  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Cache Yarn modules
        uses: actions/cache@v3
        with:
          path: ~/.cache/yarn
          key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
          restore-keys: |
            ${{ runner.os }}-yarn-
      - run: yarn install
      - run: yarn test:ci
```

### Job: Analise de Codigo 

O job de `analyze` utiliza a ferramenta de análise estática de código `CodeQL` para garantir que o código segue boas práticas e não contém vulnerabilidades ou bugs críticos.

```yaml
  analyze:
    needs: build
    name: Analyze Code Quality
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      packages: read
      actions: read
      contents: read
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
      - name: Upload CodeQL Results
        uses: actions/upload-artifact@v3
        with:
          name: codeql-results
          path: codeql-results/
```

### Job: Publish
O job de `publish` é responsável por gerar e publicar a imagem Docker no Docker Hub. Esse processo automatizado e garante que a imagem esteja disponível publicamente e pronta para ser utilizada.

```yaml
  publish:
    needs: [test, analyze]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Login no Docker Hub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}

      - name: Construir e publicar imagem Docker
        uses: docker/build-push-action@v2
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_HUB_USERNAME }}/beekeeper-studio:${{ github.sha }}
            ${{ secrets.DOCKER_HUB_USERNAME }}/beekeeper-studio:latest
```


### Como o Pipeline Otimiza o Desenvolvimento
O pipeline CI/CD foi desenhado para otimizar o fluxo de desenvolvimento em várias maneiras:

- Automação Completa: Desde o build até a publicação da imagem Docker, tudo é automatizado. Minimizando erros manuais e acelera o tempo de entrega.
- Execução de Testes: Com a execução automática de testes a cada push no repositório, os desenvolvedores têm feedback imediato sobre o impacto das alterações.
- Análise de Código: O uso de análise estática com CodeQL garante que o código mantido segue padrões de qualidade e segurança.
- Publicação Automatizada: A imagem Docker é construída e publicada no Docker Hub automaticamente, simplificando o processo de distribuição.

## Como Configurar

Para configurar e rodar o pipeline em seu próprio repositório, siga as instruções abaixo:

### Configurar Segredos no GitHub:
Acesse as configurações do repositório no GitHub e adicione os segredos DOCKER_HUB_USERNAME e DOCKER_HUB_TOKEN com suas credenciais do Docker Hub.
### Verificar Dependências:

- Certifique de que todas as dependências, como Node.js e Yarn, estão corretamente configuradas no repositório.
Verificar Permissões do Docker Hub:

- Assegure de que o repositório do Docker Hub está configurado para aceitar pushes das imagens Docker.

## Dockerfile

O Dockerfile criado permite que o Beekeeper Studio seja executado como um contêiner Docker. Isso facilita o uso em diferentes ambientes, sem a necessidade de instalação manual de dependências.

Para executar a aplicação em seu ambiente local, após baixar a imagem Docker, utilize o seguinte comando:

```bash
docker run --name beekeeper-studio \
    --privileged \
    -e DISPLAY=$DISPLAY \
    -v /tmp/.X11-unix:/tmp/.X11-unix \
    -v $HOME/.Xauthority:/root/.Xauthority \
    --net=host \
    matheusrfa/beekeeper-studio:latest
```

## Conclusão

 Este estudo de caso examinou como configurar um pipeline CI/CD usando o GitHub Actions para construir, testar, analisar e publicar uma aplicação dockerizada chamada Beekeeper Studio. A implementação deste pipeline mostrou a importância e os benefícios da integração contínua e da entrega contínua em projetos de software e demonstrou como a automação pode garantir a qualidade do código e otimizar o fluxo de trabalho.

A capacidade do pipeline de garantir que cada alteração no código fosse automaticamente verificada por meio de testes e análises e garantir que as imagens Docker fossem construídas e publicadas de forma confiável foi demonstrada por meio das etapas descritas. O uso das Actions do GitHub facilitou a integração com o Docker Hub e a automação das tarefas críticas do desenvolvimento de software.

O estudo também mostrou a escalabilidade e a flexibilidade das práticas de CI/CD, que permitem o desenvolvimento de software mais ágil e com menos probabilidade de erros. A configuração do pipeline também enfatiza a necessidade de uma abordagem bem estruturada e documentada para a automação de processos, pois facilita a escalabilidade e a manutenção das soluções adotadas.

## Créditos

Este projeto é baseado no [Beekeeper Studio](https://github.com/beekeeper-studio/beekeeper-studio), uma aplicação para gerenciamento de bancos de dados. Todos os créditos pelo desenvolvimento da aplicação original vão para os mantenedores do repositório oficial.

Este fork foi criado exclusivamente para fins de estudo e experimentação com CI/CD e Docker. Caso tenha interesse na aplicação, recomenda-se visitar o repositório oficial para obter a versão mais atual e estável.