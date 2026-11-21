# Fifinha

Aplicativo mobile para sortear times aleatórios em partidas locais de FIFA / EA Sports FC entre amigos — chega de todo mundo escolher sempre o mesmo time.

## Funcionalidades

- **Sorteio 1v1** — escolha a versão do jogo e cada jogador recebe um time aleatório
- **Equilíbrio por rating** — defina a diferença máxima de overall entre os times sorteados
- **Filtro por liga** — sorteie apenas entre as ligas que quiser
- **Nomes dos jogadores** — personalize quem está jogando
- **Modo Champions League** — sequência de rodadas apenas com times da UCL, com resumo ao final
- **Histórico** — veja os sorteios da sessão

Versões suportadas: FC 22, FC 23, FC 24, FC 25, FC 26 e FC 27 (em curadoria).

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | React Native + Expo SDK 57 |
| Navegação | Expo Router (file-based) |
| Estado | Zustand v5 + `persist` |
| Persistência | AsyncStorage (com fallback em memória no Expo Go) |
| Linguagem | TypeScript |

## Como rodar

Pré-requisitos: Node.js LTS e o app **Expo Go** no celular.

```bash
npm install
npx expo start
```

Escaneie o QR code com o Expo Go. Se o celular e o PC estiverem em redes diferentes:

```bash
npx expo start --tunnel
```

> O `.npmrc` usa `legacy-peer-deps=true` — mantenha-o para o `npm install` funcionar.

## Estrutura

```
app/            # telas (Expo Router)
src/
  components/   # componentes reutilizáveis
  constants/    # tema (cores, espaçamentos)
  data/         # JSONs de times por versão + times da UCL
  services/     # lógica de sorteio
  stores/       # stores Zustand
  types/        # tipos compartilhados
scripts/        # scripts de geração dos dados a partir do Kaggle
docs/           # documentação do projeto
```

## Dados dos times

Os times ficam em `src/data/teams_<versao>.json`. FC 22–FC 25 são gerados a partir de datasets públicos do Kaggle; FC 26–FC 27 são curados manualmente.

Para regenerar a partir de um CSV do Kaggle (os CSVs não são versionados):

```bash
node scripts/transform-kaggle.mjs --input players_25.csv --version fc25 --output src/data/teams_fc25.json
```

Detalhes do pipeline e do schema em [docs/DATA.md](docs/DATA.md).

## Aviso

Projeto pessoal, sem fins lucrativos e sem qualquer vínculo com a Electronic Arts. FIFA, EA Sports FC e nomes de clubes/ligas pertencem aos seus respectivos donos.

## Licença

[MIT](LICENSE)
