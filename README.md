# Conecta Consig

Comparador de consignações entre Banco e Prefeitura. Aplicação 100% client-side (sem backend), rodando direto no navegador.

## Stack

- **Vite** - Build tool rápido com HMR
- **React 18** - UI library
- **TypeScript** - Tipagem estática

## Estrutura do Projeto

```
src/
├── core/       # Engine de processamento (parsers, comparadores)
├── ui/         # Componentes e telas React
├── assets/     # Arquivos estáticos (imagens, fontes)
├── index.css   # Estilos globais
└── main.tsx    # Entry point
```

## Desenvolvimento

### Requisitos

- Node.js 20+
- npm 10+

### Comandos

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento (http://localhost:5173)
npm run dev

# Build para produção
npm run build

# Preview do build local
npm run preview

# Lint
npm run lint
```

## Deploy

O deploy é automático via GitHub Actions. A cada push na branch `main`, o workflow:

1. Faz checkout do código
2. Instala dependências
3. Executa o build
4. Publica no GitHub Pages

### URL de Produção

🔗 https://teightx.github.io/Conecta/

### Deploy Manual

Se precisar fazer deploy manual:

```bash
npm run build
# O diretório 'dist/' contém os arquivos estáticos prontos
```

## Configuração do GitHub Pages

O projeto está configurado para funcionar com GitHub Pages:

- `vite.config.ts`: define `base: '/Conecta/'` para o path correto
- `.github/workflows/deploy.yml`: workflow de CI/CD

## Licença

Privado - Uso interno.
