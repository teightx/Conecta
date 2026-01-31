# RELATÓRIO TÉCNICO DE ANÁLISE DE DADOS
## Cruzamento Banco × Prefeitura - Competência 01/2026

---

## 1) RESUMO EXECUTIVO

### O que dá para comparar com segurança
- **Matrícula normalizada** (formato `XXX-Y`, ex: `85-1`)
- **Código do evento** (002, 015, 135)
- **Valor** (em reais, 2 casas decimais)
- **Competência** (ambos referem-se a 01/2026)

### O que impede comparação perfeita
1. **Sufixos de matrícula divergentes**: Há 4 casos onde o banco usa um sufixo diferente da prefeitura (ex: `244-2` no banco vs `244-1` na prefeitura)
2. **Múltiplos registros por chave**: Mesma matrícula+evento pode ter 10+ linhas (parcelas de consignado), exigindo agregação por soma
3. **Registros ausentes**: 19 chaves existem só no banco, 5 só na prefeitura
4. **Divergências de valor**: 12 chaves com valores diferentes após agregação

### Melhor "chave de match" recomendada
```
CHAVE = (matricula_normalizada + evento)
REGRA = somar todos os valores da mesma chave antes de comparar
```

**Taxa de sucesso atual:** 353 de 365 chaves comuns batem (96,7%)

---

## 2) ANÁLISE DO TXT DO BANCO (`debito_202601.txt`)

### 2.1 Perfil do arquivo

| Característica | Valor |
|----------------|-------|
| Encoding | ASCII (7-bit) |
| Quebra de linha | CRLF (Windows `\r\n`) |
| Tamanho | 763 linhas |
| Registros de dados | 762 linhas |
| Linhas de header | 1 linha |
| Trailer | Não possui |
| Formato | **Fixed-width (posição fixa)** |
| Comprimento da linha | 73 caracteres + CRLF |

### 2.2 Layout detalhado (Fixed-Width)

| Campo | Posição | Tamanho | Tipo | Descrição |
|-------|---------|---------|------|-----------|
| Tipo registro | 1 | 1 | Char | `1`=Header, `2`=Dados |
| Sequencial | 2-10 | 9 | Num | Número sequencial do registro |
| Matrícula base | 11-22 | 12 | Num | Matrícula sem sufixo (com zeros) |
| Matrícula completa | 23-34 | 12 | Num | Matrícula + sufixo (2 dígitos finais) |
| Evento | 35-44 | 10 | Num | Código do evento (ex: `0000000002`) |
| Competência | 45-50 | 6 | Num | Formato `MMAAAA` (ex: `012026`) |
| Valor | 51-57 | 7 | Num | **Centavos** (dividir por 100) |
| Referência | 58-63 | 6 | Num | Identificador único (parcela/contrato) |
| Sequencial final | 64-73 | 10 | Num | Outro sequencial |

**Header (linha 1):**
```
118012026DEBITOS
│└───────┴────── "DEBITOS" (tipo de arquivo)
│   └──────────── 18012026 = data 18/01/2026
└──────────────── 1 = tipo header
```

### 2.3 Exemplos reais parseados

**Linha original 1:**
```
2000000001000000008500000000008501000000000201202600400490720120000000001
```

**JSON extraído:**
```json
{
  "tipo": "2",
  "sequencial": 1,
  "matricula_base": 85,
  "matricula_completa": "85-1",
  "evento": 2,
  "competencia": "01/2026",
  "valor": 400.49,
  "referencia": "720120",
  "seq_final": 1
}
```

**Mais exemplos:**

| Linha | Matrícula | Evento | Valor (R$) | Referência |
|-------|-----------|--------|------------|------------|
| 2 | 85-1 | 002 | 400,49 | 720120 |
| 3 | 85-1 | 015 | 140,99 | 850510 |
| 4 | 278-1 | 015 | 157,00 | 900550 |
| 5 | 278-1 | 015 | 450,00 | 1200240 |
| 6 | 99-1 | 002 | 268,23 | 720400 |

### 2.4 Normalização

**Valor:**
- Formato: 7 dígitos numéricos com zeros à esquerda
- Interpretação: **Centavos** → dividir por 100
- Exemplo: `0040049` = 40049 ÷ 100 = R$ 400,49

**Matrícula:**
- Campo posição 23-34 (12 dígitos)
- **Primeiros 10 dígitos** = número da matrícula (remover zeros à esquerda)
- **Últimos 2 dígitos** = sufixo (01 = "-1", 02 = "-2")
- Exemplo: `000000008501` → matrícula `85`, sufixo `01` → **"85-1"**

**Evento:**
- 10 dígitos com zeros à esquerda
- Converter para inteiro: `0000000002` → **2** (ou "002")

**Competência:**
- Formato: `MMAAAA`
- Exemplo: `012026` = janeiro de 2026

### 2.5 Estatísticas

| Métrica | Valor |
|---------|-------|
| Total de linhas de dados | 762 |
| Matrículas únicas | 303 |
| Eventos únicos | 3 (002, 015, 135) |
| Referências únicas | 272 |

**Distribuição por evento:**

| Evento | Quantidade | Soma (R$) |
|--------|------------|-----------|
| 002 - CONSIGNADO BB | 356 | 142.066,34 |
| 015 - CONSIGNADO CEF | 393 | 110.232,21 |
| 135 - CONSIGNADO BRADESCO | 13 | 5.922,53 |
| **TOTAL** | **762** | **258.221,08** |

**Top 5 matrículas com mais registros:**

| Matrícula | Qtd registros |
|-----------|---------------|
| 436-1 | 11 |
| 534-1 | 11 |
| 298-1 | 10 |
| 356-1 | 10 |
| 362-1 | 9 |

**Duplicidade:** Sim, mesma matrícula+evento pode ter múltiplas linhas (parcelas). **É necessário somar** antes de comparar.

---

## 3) ANÁLISE DO CSV DA PREFEITURA

### 3.1 Estrutura

| Característica | Valor |
|----------------|-------|
| Formato | CSV (delimitado por vírgula) |
| Encoding | UTF-8 |
| Total de linhas | 899 |
| Linhas de dados | 721 |
| Abas | Arquivo único (não é XLS real) |

**Estrutura hierárquica do arquivo:**
1. Cabeçalho institucional (CNPJ, endereço, período)
2. Título "Relação de Trabalhadores por Evento"
3. Cabeçalho de colunas
4. Seção por evento (ex: "Evento: 002 - CONSIGNADO BB")
5. Dados dos trabalhadores
6. Subtotal por evento
7. Repete para próximo evento

**Headers de página** se repetem a cada ~55 linhas (quebra de página do PDF original).

### 3.2 Campos relevantes

| Coluna | Posição | Descrição | Exemplo |
|--------|---------|-----------|---------|
| Matrícula | 1 | Formato `XXX-Y` | `85-1` |
| Nome do Trabalhador | 2-8 | Nome completo (colunas mescladas) | `REGINALDO RODRIGUES` |
| Referência (CPF) | 9 | CPF do trabalhador | `000.281.393-99` |
| Qtde. | 10-11 | Sempre "1/0" ou "1.00" | `1/0` |
| Valor | 13 | Valor em reais (formato BR) | `"400,49"` |

**Identificação de evento:**
- Linha separada: `Evento:  002 - CONSIGNADO BB`
- Todos os registros abaixo pertencem a este evento até o próximo header

**Competência:**
- No cabeçalho institucional: `Mês/Ano: 01/2026`
- No cabeçalho: `Folha Mensal`
- **Não existe campo de competência por linha**

### 3.3 Exemplos reais parseados

**Linha original:**
```csv
85-1,REGINALDO RODRIGUES,,,,,,000.281.393-99,,1/0,"0,00",,"400,49",
```

**JSON normalizado:**
```json
{
  "matricula": "85-1",
  "nome": "REGINALDO RODRIGUES",
  "cpf": "000.281.393-99",
  "evento": 2,
  "qtde": "1/0",
  "valor": 400.49
}
```

**Mais exemplos (evento 002):**

| Matrícula | Nome | Valor (R$) |
|-----------|------|------------|
| 85-1 | REGINALDO RODRIGUES | 400,49 |
| 85-1 | REGINALDO RODRIGUES | 26,83 |
| 26-1 | MARIA LUCIA FELIX BORGES | 972,80 |
| 28-1 | HUDIVANE DA SILVA BRITO GALVAO | 347,17 |
| 28-1 | HUDIVANE DA SILVA BRITO GALVAO | 156,54 |

### 3.4 Normalização

**Matrícula:**
- Já está no formato correto (`XXX-Y`)
- Usar como está para match

**Valor:**
- Formato brasileiro: `"1.234,56"` (entre aspas)
- Remover pontos de milhar, trocar vírgula por ponto
- Exemplo: `"1.057,06"` → `1057.06`

**Duplicidade:** Sim, mesma matrícula+evento pode aparecer múltiplas vezes (múltiplos empréstimos). **Somar para comparar.**

### 3.5 Estatísticas

| Métrica | Valor |
|---------|-------|
| Total de registros | 721 |
| Matrículas únicas | 294 |
| Eventos únicos | 3 |

**Distribuição por evento:**

| Evento | Quantidade | Soma (R$) |
|--------|------------|-----------|
| 002 - CONSIGNADO BB | 327 | 138.282,94 |
| 015 - CONSIGNADO CEF | 382 | 108.033,06 |
| 135 - CONSIGNADO BRADESCO | 12 | 5.744,33 |
| **TOTAL** | **721** | **252.060,33** |

**Duplicidades por chave (matrícula+evento):**
- 149 chaves têm mais de 1 registro
- Máximo: 10 registros para mesma chave (298-1 + evento 015)

---

## 4) PROPOSTA DE CRUZAMENTO

### Estratégia A (Principal) ✓ RECOMENDADA

**Chave de match:**
```
(matricula_normalizada, evento)
```

**Algoritmo:**
1. Para cada arquivo, agrupar por `(matricula, evento)`
2. Somar todos os valores dentro de cada grupo
3. Comparar o valor agregado do banco vs prefeitura
4. Tolerância para diferença: **R$ 0,01** (1 centavo)

**Regras de normalização:**

| Campo | TXT (Banco) | CSV (Prefeitura) |
|-------|-------------|------------------|
| Matrícula | `pos[23:34]` → `int([:10])-int([10:12])` | Primeira coluna, já normalizada |
| Evento | `int(pos[35:44])` | Extrair do header "Evento: XXX" |
| Valor | `int(pos[51:57]) / 100` | Último valor entre aspas, converter BR→EN |

### Estratégia B (Fallback) — Ignorar sufixo

Se houver muitas divergências por sufixo de matrícula:

**Chave alternativa:**
```
(matricula_base, evento)
```

Onde `matricula_base` = parte numérica antes do hífen (ex: `85` de `85-1`)

**Riscos:**
- Pode gerar falsos positivos se existir `85-1` e `85-2` com valores diferentes
- Atualmente há 4 casos de conflito de sufixo detectados

---

## 5) MATRIZ DE DIVERGÊNCIAS ESPERADAS

Baseado na análise real dos dados:

| Categoria | Qtd | % | Causa típica |
|-----------|-----|---|--------------|
| **OK** | 353 | 92,5% | Valores batem dentro de R$ 0,01 |
| **Divergente** | 12 | 3,1% | Valores diferentes após soma |
| **Só no banco** | 19 | 5,0% | Matrícula/sufixo não existe na prefeitura |
| **Só na prefeitura** | 5 | 1,3% | Matrícula não existe no banco |

### Exemplos de cada categoria

**Só no banco (19 chaves):**
- `21-1` eventos 002 e 015 (não existe na prefeitura)
- `244-2` evento 002 (prefeitura tem `244-1`)
- `384-2` evento 015 (prefeitura só tem `384-1`)

**Só na prefeitura (5 chaves):**
- `475-1` evento 015 (banco tem `475-2`)
- `451-1` evento 135
- `523-1` evento 135

**Divergentes (12 chaves):**
- `384-1` evento 015: Banco R$754,99 vs Pref R$1.304,83 (diff R$549,84)
- `1502-1` evento 002: Banco R$762,07 vs Pref R$274,04 (diff R$488,03)

---

## 6) CHECKLIST DE PERGUNTAS RESPONDIDAS

| Pergunta | Resposta |
|----------|----------|
| **Competência existe em qual arquivo e como aparece?** | TXT: campo `pos[45:50]` formato `MMAAAA` = `012026`. CSV: no cabeçalho institucional "Mês/Ano: 01/2026", não por linha. Ambos referem-se a **janeiro/2026**. |
| **Evento é mesmo código nos dois lados?** | Sim. Ambos usam 002, 015, 135. TXT usa 10 dígitos com zeros, CSV usa 3 dígitos. Normalizar para inteiro. |
| **Matrícula é comparável diretamente?** | Quase. TXT precisa parse de 12 dígitos (10 base + 2 sufixo). CSV já está normalizado. Há 4 casos de sufixo divergente. |
| **Valores precisam somar?** | **SIM.** Ambos arquivos têm múltiplas linhas por matrícula+evento (parcelas). Agregar por soma antes de comparar. |
| **Qual é a diferença total?** | Banco tem R$ 6.160,75 a mais que prefeitura (258.221,08 vs 252.060,33). |

---

## ANEXO: Código de Parse Recomendado

### Para TXT (Banco)

```python
def parse_txt_linha(linha):
    return {
        'matricula': f"{int(linha[22:32])}-{int(linha[32:34])}",
        'evento': int(linha[34:44]),
        'competencia': linha[44:50],
        'valor': int(linha[50:57]) / 100.0,
        'referencia': linha[57:63]
    }
```

### Para CSV (Prefeitura)

```python
import re

def parse_csv(arquivo):
    evento_atual = None
    for linha in arquivo:
        # Detectar mudança de evento
        m = re.match(r'Evento:\s+(\d+)', linha)
        if m:
            evento_atual = int(m.group(1))
            continue

        # Detectar linha de dados
        m = re.match(r'^(\d+-\d+),', linha)
        if m and evento_atual:
            matricula = m.group(1)
            valores = re.findall(r'"([\d.,]+)"', linha)
            valor = float(valores[-1].replace('.', '').replace(',', '.'))
            yield {
                'matricula': matricula,
                'evento': evento_atual,
                'valor': valor
            }
```
